---
title: Opensips+RTPEngine+FreeSwitch实现FS高可用
categories:
  - 运维技术
  - 服务搭建
tags:
  - Linux
copyright: true
abbrlink: ec271ad5
date: 2021-01-14 11:26:59
---

![image.png](1.png)

<!--more-->

## 建议

**对于初学者，整个架构涉及的知识点很多，配置项复杂，建议使用下面的调试方法：**

1. 保证UA直连freeswitch 已经都正常通话且有声音，这也是本文的前提
2. 软电话注册正常
3. FS直接originate 到软电话 playback一段录音能听到声音
4. FS直接originate 到软电话 echo能听到声音
5. webrtc 使用ws 注册正常，重复3、4 步骤
6. 互拨测试，每一阶段不正常使用chrome的debug和抓包查看SIP、SDP、ICE是否正常：
   - 软电话->软电话
   - 软电话->webrtc
   - webrtc->软电话
   - webrtc->webrtc
7. webrtc从ws 切换到wss，重复上面的2、3、4、5、6步骤。

#### 熟练使用抓包工具

1. chrome 调试模式，可以查看websocket的每一个frame内容
2. 软电话可以使用Wireshark 之类工具抓包查看内容
3. 不确定声音问题时可以抓包查看是否有持续的UDP包收到或者发送。

## 经历历程

- 最初是想UA 经过 opensips转发 REGISTER 后直接在fs保存穿透后的地址，UA连上Opensips之后将自己的地址经过转发传给FS1存储，这样是不是FS1可以直接通过contact找到坐席了呢？`三者在同一个局域网是可以的`，但是如果op和fs在外网，这是UA链接op就会涉及到NAT打洞的相关问题，即使FS保存了UA打洞后的ip和端口，由于NAT的限制，该端口可能只能UA和OP能够使用，FS是不能够使用的（但是不同的NAT环境可能又可以，但是我们不能指望用户的环境是最优环境）。
  ![image.png](2.png)

这里有一定的联想：`是否有一种可以通过一种keepalive的机制随时监控多台fs的状态，UA发送SIP时通过某个接口实时获取可用的一台FS主机IP，实现客户端级别的高可用。这里后面想了想：首先如果一台fs宕机则一半的客户端需要重新登录，其次比如INVITE失败不能自动重试其他机器。`

- 那么使用使用op转发，fs 用户的contact 保存 op 的地址。
  - 坐席呼叫坐席,INVITE消息流转：
    UA1 ——> OpenSips ——-> FS ——-> OpenSips ——> UA2
  - FS直接originate：
    FS —-(udp)—-> OpenSips ——-(ws)—-> UA
- 保存上op的地址之后，对于软电话其实到这里注册已经可以了，接下来是声音。
- 发现从fs直接`originate user/1000 &echo()`是没有声音的，通过抓包会发现UA收到的INVITE的SDP信息有问题(查看o=的IP)，可能会是FS的内网地址。
  这里直接在opensips的脚本中判断从内部收到的INVITE，fix_nated_sdp到fs的外网IP即可，参考：https://opensips.org/pipermail/users/2013-August/026471.html
- 软电话一切调通后开始测试webrtc，使用web登录1000 账号之后显示登录成功，但是`originate user/1000 &echo()`会直接失败，并且开始siptrace也不显示有任何sip发送出去，猜测`U->O 注册时的contact带有“transport=ws”，如果不删除，在FS保存时也会保存transport=ws，使得FS以为这是一个web client，于是从FS呼叫用户时会向Opensips 的5060端口发送websocket请求，导致根本无法呼出（本来应该是udp通讯）`
- 【最终采用的方案】那么就删除“transport=ws”（目前是直接操作contact字段字符串，暂时没有更好的方案），这样在FS保存的就没有了（OP自己保存的信息依然知道是ws，要问OP怎么保存：save(“location”) + lookup()），FS会使用udp和OP通讯，信令正常，但是发送到web UA的时候会报“SIP/2.0 603 Failed to get local SDP”，原因是FS发送的INVITE中的SDP 音频编码不包含 Chrome 用的 SAVPF，说白了就是FS发的是一个给软电话的请求，web client处理不了。
- 解决：originate 需要加上 “originate {media_webrtc=true}user/8800 &echo” 这样就会当成一个web发送请求，但是这样如果一个FS有软电话也有web，不是很好区别（因为对于fs来说不知道客户端类型。如果是软电话但是加上了media_webrtc=true，会报IP/2.0 488 Not Acceptable Here）
- 无法在OP中做判断然后修改，有些加密信息需要fs生成
- 【最终采用的方案】使用RTPEngine 协商双方的编码以及转码
- 注意SDP对应的IP，如果是websocket 还需要有ICE的candidate ip 协商过程。此外如果rtpengine所在机器有内网和公网ip还需要在offer中指定方向。

## 遇到的问题

- websocket连接opensips出现自动登出的问题。fs返回的REGISTER的OK中的contact包含的expire时间时180秒，也就是UA会在180秒内重新发起REGITER进行续期。但是opensips的websocket连接时间为120秒，否则连接会被关闭。
  解决：1、调小FS的`sip-force-expires`,或者2、调整opensips的`tcp_connection_lifetime`参数大于180秒，或者3、`modparam("registrar", "tcp_persistent_flag", "TCP_PERSISTENT")`并且`setflag(TCP_PERSISTENT);`,设置超时时间为REGISTER中的exipre时间。

## 架构

（和顶部的官方推荐架构一样。。。。）

- opensips 仅作为消息转发，不负责语音通讯
- 使用rtpengine来进行rtp转发以及sdp的协商
- 一台opensips后对应多台freeswitch
- opensips需要数据库存储相关负载以及保活信息
- 多台FS共用数据库
- 多台opensips间使用负载均衡中间件（阿里SLB，提供端口检测心跳）

## 开启端口(公网)

- Opensips 开启：7443(wss) 5060(UDP)
- Freeswitch 开启RTP端口段（线路方侧） 5080（线路方SIP） 5060(理论上不需要开启公网，但是出现了Opensip转发BYE通过公网转发给FS，待研究)
- RTPengine 开启RTP端口段（坐席侧）

## 安装

### FS安装

略，修改多台FS的数据库指向同一mysql，用于共享数据。

### RTPEngine安装

https://github.com/sipwise/rtpengine

### Opensips安装

- 下载源码并选择模块

```bash
[root@localhost /]# cd /usr/local/src 
[root@localhost src]# git clone https://github.com/OpenSIPS/opensips.git -b 2.4 opensips-2.4
[root@localhost src]# cd opensips-2.4
[root@localhost src]# yum install mysql mysql-devel gcc gcc-c++ ncurses-devel flex bison
[root@localhost opensips-2.4]# make all
```

如果这里报错，停止，装好依赖再make all

```
[root@localhost opensips-2.4]# make menuconfig
```

进入这个菜单后，根据需要使用这个工具（左右键进入返回，空格键选中，回车键确定），但有个必须的是进入`Configure Compile Options` —> Configure Excluded Modules，按空格选中[*] db_mysql，返回上一级，Save Chnahes, 返回主菜单选择`Compile And Install OpenSIPS`编译安装即可。完成后会回到这个界面，保存退出。

- 重要目录

### 配置文件目录

```bash
[root@localhost /]# ls /usr/local/etc/opensips/
opensips.cfg  opensips.cfg.sample  opensipsctlrc  opensipsctlrc.sample  osipsconsolerc  osipsconsolerc.sample  scenario_callcenter.xml
```

### 运行程序目录

```bash
[root@localhost /]# ls /usr/local/sbin
curses.out  opensips  opensipsctl  opensipsdbctl  opensipsunix  osipsconfig  osipsconsole
```

### 修改配置

```bash
[root@localhost /]# cd /usr/local/etc/opensips/
[root@localhost opensips]# vi opensipsctlrc
```

### 修改后的配置

```bash
SIP_DOMAIN=192.168.0.191
DBENGINE=MYSQL
DBPORT=3306
DBHOST=localhost
DBNAME=opensips
DB_PATH="/usr/local/etc/opensips/dbtext"
DBRWUSER=opensips
DBRWPW="opensipsrw"
```

这里主要是mysql连接信息，保证能正常连接即可。还有一个SIP_DOMAIN能连接到本服务的域名或者IP地址即可。

### 修改opensips.cfg

```bash
[root@localhost opensips]# vi opensips.cfg
```

### 修改配置项

注意，下面的配置文件只是简单的示例，很多功能比如 save location、wss、rtpengine没有使用到，鉴于公司项目原因，暂时不公开脚本。

```
log_level=3  #老版本日志级别参数为debug，级别范围1-4，建议生产上设置为1，为3或者4时将产生大量日志，磁盘空间很快就不够了
sip_warning=0
log_stderror=yes
log_facility=LOG_LOCAL0
log_name="opensips"
#debug_mode=yes#开启时需要直接opensips 启动前端模式
children=2
dns_try_ipv6=no
auto_aliases=no
listen=udp:10.0.11.84:5060
mpath="/usr/local//lib64/opensips/modules/"
#fork=no
loadmodule "db_mysql.so"
loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "uri.so"
loadmodule "dialog.so"
loadmodule "maxfwd.so"
loadmodule "textops.so"
loadmodule "mi_fifo.so"
loadmodule "dispatcher.so"
loadmodule "load_balancer.so"
loadmodule "sipmsgops.so"
loadmodule "proto_udp.so"
modparam("mi_fifo", "fifo_name", "/tmp/opensips_fifo")
modparam("dialog", "db_mode", 1)
modparam("dialog", "db_url","mysql://root:root@10.0.11.84/opensips")
modparam("rr", "enable_double_rr", 1)
modparam("rr", "append_fromtag", 1)
modparam("tm", "fr_timer", 2)
modparam("dispatcher", "ds_ping_method", "OPTIONS")
modparam("dispatcher", "ds_ping_interval", 5)
modparam("dispatcher", "ds_probing_threshhold", 2)
modparam("dispatcher", "ds_probing_mode", 1)
modparam("dispatcher", "db_url","mysql://root:root@10.0.11.84/opensips")
modparam("load_balancer", "db_url","mysql://root:root@10.0.11.84/opensips")
modparam("load_balancer", "probing_method", "OPTIONS")
modparam("load_balancer", "probing_interval", 5)
route{
        if (!mf_process_maxfwd_header("10")) {
                sl_send_reply("483","Too Many Hops");
                exit;
        }
        if (!has_totag()) {
                record_route();
        } else {
                loose_route();
                t_relay();
                exit;
        }
        if (is_method("CANCEL")) {
                if ( t_check_trans() )
                        t_relay();
                exit;
        }
        if (is_method("INVITE")) {
                if ( !lb_start("1","pstn")) {
                        send_reply("500","No Destination available");
                        exit;
                }
                t_on_failure("GW_FAILOVER");
                #if (!load_balance("1","pstn","1")) {
                #        send_reply("503","Service Unavailable");
                #        exit;
                #}
        }
        else if (is_method("REGISTER")) {
                if (!ds_select_dst("1", "0")) {
                        send_reply("503","Service Unavailable");
                        exit;
                }
        } else {
                send_reply("405","Method Not Allowed");
                exit;
        }
        if (!t_relay()) {
                sl_reply_error();
        }
}
failure_route[GW_FAILOVER] {
        if (t_was_cancelled()) {
                exit;
        }
        # failure detection with redirect to next available trunk
        if (t_check_status("(408)|([56][0-9][0-9])")) {
                xlog("Failed trunk $rd/$du detected \n");
                if ( lb_next() ) {
                        t_on_failure("GW_FAILOVER");
                        t_relay();
                        exit;
                }
                send_reply("500","All GW are down");
        }
}
```

这里listen如果你不确定该怎么填的话，运行下面的命令看一下，一般是本机IP。

```bash
[root@localhost opensips]# ip route get 8.8.8.8 | head -n +1 | tr -s " " | cut -d " " -f 7
```

### 部分关键脚本

- 删除`transport=wss`

```
$var(ct) = $ct;
$var(str) = ';transport=wss';
$var(pos) = $(var(ct){s.index, $var(str)});
$var(end) = $var(pos) + $(var(str){s.len});
$var(res) = $(var(ct){s.substr, 0, $var(pos)}) + $(var(ct){s.substr, $var(end), 0});
remove_hf("Contact");
append_hf("Contact: $var(res)\r\n");
```

### 创建数据库

```bash
[root@localhost opensips]# cd /usr/local/sbin
[root@localhost sbin]# opensipsdbctl create
……
INFO: creating database opensips ...
INFO: Using table engine MyISAM.
INFO: Core OpenSIPS tables successfully created.
Install presence related tables? (Y/n): y
INFO: creating presence tables into opensips ...
INFO: Presence tables successfully created.
Install tables for 
    b2b
    cachedb_sql
    call_center
    carrierroute
    cpl
    domainpolicy
    emergency
    fraud_detection
    freeswitch_scripting
    imc
    registrant
    siptrace
    userblacklist
? (Y/n): y
INFO: creating extra tables into opensips ...
INFO: Extra tables successfully created.
```

之后就是根据提示傻瓜操作创建数据库就好了，如果前面的mysql环境没装好，数据库连接有问题，这里就会报错，如果提示类似下面的编码问题，输入latin1即可。

```
WARNING: Your current default mysql characters set cannot be used to create DB. Please choice another one from the following list:
```

这一步完成之后，会在数据库新建一个opensips（名字是在上面的配置文件里设置的）的数据库。

### 将日志输出到指定文件

在/etc/rsyslog.conf追加OpenSIPS日志输出配置。（注：OpenSIPS配置文件中log_stderror和debug_mode需设置成no，否则可能不能输出单独日志）

```bash
echo "local0.*                        /var/log/opensips.log" >>/etc/rsyslog.conf
```

修改配置文件后需要重启日志服务：

```bash
service rsyslog restart
```

### 启动opensips

- 启动

  ```bash
  [root@localhost sbin]# opensipsctl start
  INFO: Starting OpenSIPS : 
  INFO: started (pid: 26051)
  ```

- 查看opensips进程

  ```bash
  [root@localhost sbin]# ps -aux | grep opensips
  root      3504  0.0  0.4  70536  4420 ?        S    3月07   0:00 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3505  3.1  0.1  70776  1368 ?        S    3月07  12:35 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3506  0.1  0.0  70536   476 ?        S    3月07   0:29 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3507  0.0  0.0  70536   688 ?        S    3月07   0:08 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3508  0.0  0.2  70536  2396 ?        S    3月07   0:03 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3509  0.0  0.1  70536  1424 ?        S    3月07   0:01 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3510  0.0  0.1  70536  1912 ?        S    3月07   0:01 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3511  0.0  0.2  70536  2392 ?        S    3月07   0:01 /usr/local/sbin/opensips -P /var/run/opensips.pid
  root      3512  0.0  0.1  70536  1164 ?        S    3月07   0:01 /usr/local/sbin/opensips -P /var/run/opensips.pid
  ```

## 配置Opensips

### 添加负载节点

在数据库添加两个负载节点信息，地址对应多个FS的地址等
添加后可以通过`opensipsctl fifo lb_reload` 进行reload

```sql
INSERT INTO `opensips`.`load_balancer` (`id`, `group_id`, `dst_uri`, `resources`, `probe_mode`, `description`) VALUES ('1', '1', 'sip:172.16.100.10', 'vm=100;conf=100;transc=100;pstn=500', '1', 'FS1');
INSERT INTO `opensips`.`load_balancer` (`id`, `group_id`, `dst_uri`, `resources`, `probe_mode`, `description`) VALUES ('2', '1', 'sip:172.16.100.11', 'vm=100;conf=100;transc=100;pstn=500', '1', 'FS2');
```

### 添加FreeSWITCH到调度列表(转发SIP消息的路由)

执行以下命令将两个节点添加到调度列表，（这里添加调度器的命令和1.7版本是有区别的）
添加后可以通过`opensipsctl fifo ds_reload` 进行reload

```bash
opensipsctl dispatcher addgw 1 sip:172.16.100.10 5060 0 50 'FS1' '节点1'
opensipsctl dispatcher addgw 1 sip:172.16.100.11 5060 0 50 'FS2' '节点2'
```

添加调度列表成功后，在两个FreeSWITCH的控制通过siptrace on打开sip消息跟踪即可看到OpenSIPS节点不停在跟FreeSWITCH通过”OPTIONS“消息进行握手。