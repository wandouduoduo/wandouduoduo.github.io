---
title: centos7时间自动同步
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 6bab7f2f
date: 2020-12-22 15:50:28
---

运维的工作高可用高并发，负载均衡，可靠稳定等等要求，很多系统都是集群模式并采用分布式部署。但是有时系统时间不同步，集群服务器之间时间不同，就会造成一些困扰或服务根本就启动不起来。所以时间自动同步，是很有必要的。

<!--more-->

## 教程

### 修改时区

```
rm -rf /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

vim /etc/sysconfig/clock
ZONE= "Asia/Shanghai"
UTC= false
ARC= false
```

### 安装并设置开机自启

```
yum install -y ntp
systemctl start ntpd
systemctl enable ntpd
```

### 配置开机启动

```
vim /etc/rc.d/rc.local
/usr/sbin/ntpdate ntp1.aliyun.com > /dev/ null  2 >& 1 ; /sbin/hwclock -w
```

### 配置定时任务

```
crontab -e
0  */ 1  * * * ntpdate ntp1.aliyun.com > /dev/ null  2 >& 1 ; /sbin/hwclock -w
```

## 脚本

```bash
#!/bin/bash

rm -rf /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

cat >/etc/sysconfig/clock <<EOF
ZONE= "Asia/Shanghai"
UTC= false
ARC= false
EOF

yum install -y ntp && systemctl start ntpd && systemctl enable ntpd

echo "/usr/sbin/ntpdate ntp1.aliyun.com > /dev/ null  2 >& 1 ; /sbin/hwclock -w" >>/etc/rc.d/rc.local
echo "0 */1  * * * ntpdate ntp1.aliyun.com > /dev/ null  2 >& 1 ; /sbin/hwclock -w" >> /var/spool/cron/root
```

