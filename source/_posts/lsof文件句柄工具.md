---
title: lsof文件句柄工具
categories:
  - 运维技术
  - 命令详解
tags:
  - Linux
copyright: true
abbrlink: 6915627d
date: 2019-07-29 09:25:02
---

## 简介

在linux环境下，一切皆文件，通过文件不仅仅可以访问常规数据，还可以访问网络连接和硬件，如传输控制协议 (TCP) 和用户数据报协议 (UDP) 套接字等，系统在后台都为该应用程序分配了一个文件描述符，文件描述符提供了大量关于这个应用程序本身的信息。

## 参数：

```
 -a 列出被打开的文件的进程列表
-c<进程名> 列出指定进程所打开的文件
-g 列出GID号进程详情
-d<文件号> 列出占用该文件号的进程
+d<目录> 列出目录下被打开的文件
+D<目录> 递归列出目录下被打开的文件
-n<目录> 列出使用NFS的文件
-i<条件> 列出符合条件的进程。（4、6、协议、:端口、 @ip ）
-p<进程号> 列出指定进程号所打开的文件
-u 列出UID号进程详情
```

<!--more-->

## 实例

#### 文件被哪些进程打开了

```shell
 root@lzjun:~# lsof -a /var/lib/mysql/mysql/slow_log.CSV
COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
mysqld  29363 mysql   63r   REG  253,1        0 263979 /var/lib/mysql/mysql/slow_log.CSV
```

#### 列出用户打开的文件

```shell
 root@lzjun:~# lsof -u root | more
COMMAND     PID USER   FD      TYPE             DEVICE SIZE/OFF       NODE NAME
init          1 root  cwd       DIR              253,1     4096          2 /
init          1 root  rtd       DIR              253,1     4096          2 /
init          1 root  txt       REG              253,1   167192    1048737 /sbin/init
```

#### 列出程序（command）打开了哪些文件

```shell
 root@lzjun:~# lsof -c python
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
python  32280 root  rtd    DIR  253,1     4096      2 /
python  32280 root  mem    REG  253,1    52120 927846 /lib/x86_64-linux-gnu/libnss_files-2.15.so
python  32280 root  DEL    REG  253,1          263953 /usr/lib/python2.7/lib-dynload/_multiprocessing.so
```

#### 根据进程号列出该进程打开的文件

```shell
 root@lzjun:~# lsof -p 31370  #nginx的进程号
COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF    NODE NAME
nginx   31370 www-data  cwd    DIR              253,1     4096       2 /
nginx   31370 www-data  rtd    DIR              253,1     4096       2 /
nginx   31370 www-data  txt    REG              253,1   843688 1186644 /usr/sbin/nginx
```

#### 查看所有网络连接，包括tcp，udp，ipv4,ipv6的连接（网络连接也是文件）

```shell
 root@lzjun:~# lsof -i
COMMAND    PID     USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
pptpd      975     root    6u  IPv4     8836      0t0  TCP *:1723 (LISTEN)
ssserver  7366     root    4u  IPv4   100096      0t0  TCP *:8388 (LISTEN)
ssserver  7366     root    5u  IPv4   100097      0t0  UDP *:8388
ssserver  7366     root    7u  IPv4   100098      0t0  UDP *:57935
```

#### 查看某个端口打开的文件（socket 连接）

```shell
 root@lzjun:~# lsof -i :80
COMMAND   PID     USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx   31369     root    6u  IPv4 8882096      0t0  TCP *:http (LISTEN)
```

#### 查看所有TCP连接

```shell
 lsof -n -P -i TCP -s TCP:LISTEN
```