---
title: lvs的三次实践
categories:
  - 运维技术
tags:
  - Lvs
copyright: true
abbrlink: eb3c6886
date: 2020-06-11 19:31:15
---

## 目的

本文详细介绍了lvs的三次实践。

<!--more-->

## 实践

#### **NAT模式**

**实验环境**

三台服务器，一台作为 director，两台作为 real server。

director 有一个外网网卡(172.16.254.200) 和一个内网ip(192.168.0.8)，两个 real server 上只有内网 ip (192.168.0.18) 和 (192.168.0.28)，并且需要把两个 real server 的内网网关设置为 director 的内网 ip(192.168.0.8)。



**安装和配置**

```bash
#两个 real server 上都安装 nginx 服务
yum install -y nginx

#Director 上安装 ipvsadm
yum install -y ipvsadm
```

Director 上编辑 nat 实现脚本

```bash
# vim /usr/local/sbin/lvs_nat.sh


# 编辑写入如下内容：

#! /bin/bash
# director服务器上开启路由转发功能:
echo 1 > /proc/sys/net/ipv4/ip_forward
# 关闭 icmp 的重定向
echo 0 > /proc/sys/net/ipv4/conf/all/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/default/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/eth0/send_redirects
echo 0 > /proc/sys/net/ipv4/conf/eth1/send_redirects

# director设置 nat 防火墙
iptables -t nat -F
iptables -t nat -X
iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -j MASQUERADE

# director设置 ipvsadm
IPVSADM='/sbin/ipvsadm'
$IPVSADM -C
$IPVSADM -A -t 172.16.254.200:80 -s wrr
$IPVSADM -a -t 172.16.254.200:80 -r 192.168.0.18:80 -m -w 1
$IPVSADM -a -t 172.16.254.200:80 -r 192.168.0.28:80 -m -w 1
```

保存后，在 Director 上直接运行这个脚本就可以完成 lvs/nat 的配置

```bash
/bin/bash   /usr/local/sbin/lvs_nat.sh
```

查看ipvsadm设置的规则

```bash
ipvsadm -ln
```

**测试LVS的效果**

通过浏览器测试2台机器上的web内容 http://172.16.254.200 。

为了区分开，我们可以把 nginx 的默认页修改一下：

```bash
#在 RS1 上执行
echo "rs1rs1" >/usr/share/nginx/html/index.html

#在 RS2 上执行
echo "rs2rs2" >/usr/share/nginx/html/index.html
```

*注意，切记一定要在两台 RS 上设置网关的 IP 为 director 的内网 IP。*

#### **DR模式**

**实验环境**

三台机器：

- Director节点：  (eth0 192.168.0.8  vip eth0:0 192.168.0.38)
- Real server1： (eth0 192.168.0.18 vip lo:0 192.168.0.38)
- Real server2： (eth0 192.168.0.28 vip lo:0 192.168.0.38)

**安装**

```bash
#两个 real server 上都安装 nginx 服务
yum install -y nginx

#Director 上安装 ipvsadm
yum install -y ipvsadm
```

**Director 上配置脚本**

```bash
vim /usr/local/sbin/lvs_dr.sh


#!/bin/bash
echo 1 > /proc/sys/net/ipv4/ip_forward
ipv=/sbin/ipvsadm
vip=192.168.0.38
rs1=192.168.0.18
rs2=192.168.0.28

ifconfig eth0:0 down
ifconfig eth0:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip dev eth0:0
$ipv -C
$ipv -A -t $vip:80 -s wrr
$ipv -a -t $vip:80 -r $rs1:80 -g -w 3
$ipv -a -t $vip:80 -r $rs2:80 -g -w 1
```

执行脚本：

```bash
bash /usr/local/sbin/lvs_dr.sh
```

**在2台 rs 上配置脚本：**

```bash
vim /usr/local/sbin/lvs_dr_rs.sh

#!/bin/bash
vip=192.168.0.38
ifconfig lo:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip lo:0
echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce
```

rs 上分别执行脚本：

```bash
bash /usr/local/sbin/lvs_dr_rs.sh
```

**实验测试**

测试方式同上，浏览器访问 http://192.168.0.38

*注意：在 DR 模式下，2台 rs 节点的 gateway 不需要设置成 dir 节点的 IP 。*



#### **LVS结合keepalive**

LVS可以实现负载均衡，但是不能够进行健康检查，比如一个rs出现故障，LVS 仍然会把请求转发给故障的rs服务器，这样就会导致请求的无效性。keepalive 软件可以进行健康检查，而且能同时实现 LVS 的高可用性，解决 LVS 单点故障的问题，其实 keepalive 就是为 LVS 而生的。

**实验环境**

4台节点

- Keepalived1 + lvs1(Director1)：192.168.0.48

- Keepalived2 + lvs2(Director2)：192.168.0.58

- Real server1：192.168.0.18

- Real server2：192.168.0.28

- IP: 192.168.0.38

  

**安装系统软件**

```bash
#Lvs + keepalived的2个节点安装
yum install ipvsadm keepalived -y

#Real server + nginx服务的2个节点安装
yum install epel-release -y
yum install nginx -y
```

**设置配置脚本**

Real server节点2台配置脚本：

```bash
vim /usr/local/sbin/lvs_dr_rs.sh

#! /bin/bash
vip=192.168.0.38
ifconfig lo:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip lo:0
echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce
```

2个节点rs 上分别执行脚本：

```bash
bash /usr/local/sbin/lvs_dr_rs.sh
```



keepalived节点配置(2节点)：

```bash
#主节点( MASTER )配置文件

vim /etc/keepalived/keepalived.conf

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.0.38
    }
}

virtual_server 192.168.0.38 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    persistence_timeout 0
    protocol TCP

    real_server 192.168.0.18 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }

    real_server 192.168.0.28 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }
}
```

从节点( BACKUP )配置文件

```
#拷贝主节点的配置文件keepalived.conf，然后修改如下内容：

state MASTER -> state BACKUP
priority 100 -> priority 90
```

keepalived的2个节点执行如下命令，开启转发功能：

```
echo 1 > /proc/sys/net/ipv4/ip_forward
```

**启动keepalive**

```
<strong>先主后从分别启动keepalive</strong>

service keepalived start
```



## 验证结果

实验1

手动关闭192.168.0.18节点的nginx，service nginx stop 在客户端上去测试访问 http://192.168.0.38 结果正常，不会出现访问18节点，一直访问的是28节点的内容。



实验2

手动重新开启 192.168.0.18 节点的nginx， service nginx start 在客户端上去测试访问 http://192.168.0.38 结果正常，按照 rr 调度算法访问18节点和28节点。



实验3

测试 keepalived 的HA特性，首先在master上执行命令 ip addr ，可以看到38的vip在master节点上的；这时如果在master上执行 service keepalived stop 命令，这时vip已经不再master上，在slave节点上执行 ip addr 命令可以看到 vip 已经正确漂到slave节点，这时客户端去访问 http://192.168.0.38 访问依然正常，验证了 keepalived的HA特性。