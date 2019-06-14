---
title: Linux用法技巧
categories:
  - 系统运维
tags:
  - Linux
copyright: true
abbrlink: 1d19f8d4
date: 2019-06-06 11:46:28
---

## 目的

根据自己多年的工作经历和经验，对日常中的细节技巧和用法进行归纳和总结。

持续更新中...

<!--more-->

## 技巧详解

### 指定特定用户执行命令

```shell
sudo -H -u www bash -c 'nohup /home/web/ke/upfileserver /home/web/ke/up/conf.json &'
```

### 统计机器中网络连接各个状态个数

```shell
netstat` `-an | ``awk` `'/^tcp/ {++S[$NF]}  END {for (a in S) print a,S[a]} '
```

### 删除乱码

```shell
find . ! -regex '.*\.jar\|.*\.war\|.*\.zip'|xargs rm
```

### 过滤IP

```SHELL
grep -E -o "172.18.[0-9]{1,3}[\.][0-9]{1,3}" filename
```

### 获取本机IP

```SHELL
ipaddr=$(ip addr | awk '/^[0-9]+: / {}; /inet.*global/ {print gensub(/(.*)\/(.*)/, "\\1", "g", $2)}')

echo $ipaddr
```

### **TIME_WAIT过多的解决办法**

```shell
查看当前状态
cat /proc/sys/net/ipv4/tcp_tw_reuse
cat /proc/sys/net/ipv4/tcp_tw_recycle
netstat -n | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key,"/t",state[key]}'

修改内核参数
方法一：直接修改参数文件
echo "1" > /proc/sys/net/ipv4/tcp_tw_reuse
#让TIME_WAIT尽快回收，我也不知是多久，观察大概是一秒钟
echo "1" > /proc/sys/net/ipv4/tcp_tw_recycle
方法二：命名修改内核参数并生效
[root@aaa1 ~]# sysctl -a|grep net.ipv4.tcp_tw
net.ipv4.tcp_tw_reuse = 0
net.ipv4.tcp_tw_recycle = 0
[root@aaa1 ~]#

vi /etc/sysctl
增加或修改net.ipv4.tcp_tw值：
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1

使内核参数生效：
[root@aaa1 ~]# sysctl -p

[root@aaa1 ~]# sysctl -a|grep net.ipv4.tcp_tw
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1

用netstat再观察正常
```

