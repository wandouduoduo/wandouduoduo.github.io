---
title: Linux修改时区正确姿势
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 4655e3fe
date: 2019-06-14 15:01:17
---

## 背景

CentOS和Ubuntu的时区文件是/etc/localtime，但是在CentOS7以后localtime以及变成了一个链接文件，那要怎么正确修改时区呢？

```shell
[root@centos7 ~]# ll /etc/localtime 
lrwxrwxrwx 1 root root 33 Oct 12 11:01 /etc/localtime -> /usr/share/zoneinfo/Asia/Shanghai
```

<!--more-->

## 传统方法

如果采用直接cp的方法修改系统时区，那么就会把它所链接的文件修改掉，例如把美国的时区文件内容修改成了上海的时区内容，有可能会导致有些编程语言或程序在读取系统时区的时候发生错误。

## 正确方法

### CentOS6、Ubuntu16

```shell
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

### CentOS7、RHEL7、Scientific Linux 7、Oracle Linux 7

最好的方法是使用timedatectl命令

```shell
timedatectl list-timezones |grep Shanghai    #查找中国时区的完整名称
Asia/Shanghai

timedatectl set-timezone Asia/Shanghai    #其他时区以此类推
```

或者直接手动创建软链接

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

