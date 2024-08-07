---
title: haproxy+keepalived实现高可用负载均衡
categories:
  - 运维技术
  - 服务部署
tags:
  - Haproxy
  - Keepalived
copyright: true
abbrlink: 9ad4df0e
date: 2019-11-02 09:53:34
---

## 目的

在运维的日常工作中和很多服务打交道，为了保证各个服务健康稳定运行，高可用和高负载是在一个服务搭建好后，必须要考虑的问题。本文介绍了一种常用的高可用和负载均衡的解决方案：KA+HA(haproxy+keepalived)



## 环境

haproxy keepalived  主：192.168.1.192
haproxy keepalived  备：192.168.1.193
vip：192.168.1.200
web：192.168.1.187:80 

​            192.168.1.187:8000



## 架构图

![img](0.115069789831175.png)

<!--more-->

## 安装过程

在192.168.1.192上：
**keepalived**的安装:

```bash
tar -zxvf keepalived-1.1.17.tar.gz
ln -s /usr/src/kernels/2.6.18-128.el5-i686/ /usr/src/linux
cd keepalived-1.1.17
./configure --prefix=/ --mandir=/usr/local/share/man/ --with-kernel-dir=/usr/src/kernels/2.6.18-128.el5-i686/
make && make install
cd /etc/keepalived/
mv keepalived.conf keepalived.conf.default
vim keepalived.conf

! Configuration File for keepalived
vrrp_script chk_http_port {
script "/etc/keepalived/check_haproxy.sh"
interval 2
weight 2

global_defs {
router_id LVS_DEVEL
}
vrrp_instance VI_1 {
state MASTER #192.168.1.193上改为BACKUP
interface eth0
virtual_router_id 51 
priority 150 #192.168.1.193上改为120
advert_int 1
authentication {
auth_type PASS
auth_pass 1111
}

track_script {
chk_http_port
}

virtual_ipaddress {
192.168.1.200 
}
}
}

vi /etc/keepalived/check_haproxy.sh
#!/bin/bash
A=`ps -C haproxy --no-header |wc -l`
if [ $A -eq 0 ];then
/usr/local/haproxy/sbin/haproxy -f /usr/local/haproxy/conf/haproxy.cfg
sleep 3
if [ `ps -C haproxy --no-header |wc -l` -eq 0 ];then
/etc/init.d/keepalived stop
fi
fi
chmod 755 /etc/keepalived/check_haproxy.sh
```

**haproxy**的安装(主备都一样)：

```bash
tar -zxvf haproxy-1.4.9.tar.gz
cd haproxy-1.4.9
make TARGET=linux26 PREFIX=/usr/local/haproxy install
cd /usr/local/haproxy/
mkdir conf logs
cd conf
vim haproxy.cfg

global
log 127.0.0.1 local3 info
maxconn 4096
user nobody
group nobody
daemon
nbproc 1
pidfile /usr/local/haproxy/logs/haproxy.pid

defaults
maxconn 2000
contimeout 5000
clitimeout 30000
srvtimeout 30000
mode http
log global
log 127.0.0.1 local3 info
stats uri /admin?stats
option forwardfor

frontend http_server
bind :80
log global
default_backend info_cache
acl test hdr_dom(host) -i test.domain.com
use_backend cache_test if test

backend info_cache
#balance roundrobin
balance source
option httpchk HEAD /haproxy.txt HTTP/1.1\r\nHost:192.168.1.187
server inst2 192.168.1.187:80 check inter 5000 fall 3

backend cache_test
balance roundrobin
#balance source
option httpchk HEAD /haproxy.txt HTTP/1.1\r\nHost:test.domain.com
server inst1 192.168.1.187:8000 check inter 5000 fall 3
```



## 两台机器上分别启动

```
/etc/init.d/keepalived start （这条命令会自动把haproxy启动）
```



## 验证测试

### 两台机器上分别执行

```
ip add
```

主: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
link/ether 00:0c:29:98:cd:c0 brd ff:ff:ff:ff:ff:ff
inet 192.168.1.192/24 brd 192.168.1.255 scope global eth0
**inet 192.168.1.200/32 scope global eth0**
inet6 fe80::20c:29ff:fe98:cdc0/64 scope link
valid_lft forever preferred_lft forever

备: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
link/ether 00:0c:29:a6:0c:7e brd ff:ff:ff:ff:ff:ff
inet 192.168.1.193/24 brd 255.255.255.254 scope global eth0
inet6 fe80::20c:29ff:fea6:c7e/64 scope link
valid_lft forever preferred_lft forever



### 停掉主上的haproxy

3秒后keepalived会自动将其再次启动



### 停掉主的keepalived

备机马上接管服务
备: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
link/ether 00:0c:29:a6:0c:7e brd ff:ff:ff:ff:ff:ff
inet 192.168.1.193/24 brd 255.255.255.254 scope global eth0
**inet 192.168.1.200/32 scope global eth0**
inet6 fe80::20c:29ff:fea6:c7e/64 scope link
valid_lft forever preferred_lft forever



### 更改hosts

192.168.1.200 test.com
192.168.1.200 test.domain.com
通过IE测试，可以发现
test.com的请求发向了192.168.1.187:80
test.domain.com的请求发向了192.168.1.187:8000
![img](0.6843823240075992.png)

![img](0.9408829897802136.png)