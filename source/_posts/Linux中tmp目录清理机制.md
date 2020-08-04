---
title: Linux中tmp目录清理机制
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 88fdad2f
date: 2020-07-22 14:44:35
---

## 背景

在Linux系统中/tmp目录中的文件会被定期删除，但是多长时间被删除呢？又是如何删除的呢？按照什么规则呢？今天就来剖析tmp目录的清理机制。



<!--more-->

## 环境

Centos    

*RHEL\CentOS\Fedora\系统都可*

ubuntu

*Debian\Ubuntu系统都可*



## tmpwatch命令

关于tmpwatch命令的参数，不同版本可能有所不同

### 作用

删除一段时间没有被访问的文件。

### 参数

```
-u 按照文件的最后access时间，即最后访问时间为参考。默认选项。可通过ls -lu查看。
-m 按照文件的最后modified时间，即最后修改时间为参考。可通过ls -l查看。
-c 按照文件的-ctime时间做参考，ctime更新的条件为写入、更改属主、权限。可通过ls -lc查看。
-M 按照目录的修改时间来删除目录而不是访问时间。
-a 删除所有类型文件。包括目录和symbolic links
-d --nodirs 排除目录文件，即使是空目录。
-d --nosysmlinks 排除symbolic links类型文件。
-f 强制删除那些root没有写权限的文件。比如root的readonly文件
-q 只报告错误信息。
-x /PATH 排除特定目录，即不删除该子目录里的文件。
-U user_name 排除属于特定用户的文件，即不删除该用户的文件。
-v 显示删除过程。默认是不显示删除了什么文件，直接删除的。
-t 用于测试，并不真正删除文件，能显示出要删除文件的过程。
-d 不删除文件里的子目录，但是子目录里面的文件还是会被删除。
```

参数后加时间，默认是hours。也可以使用30d表示30天，但是有些版本只支持hours。 时间后是要检查的目录。可以多个目录用空格分开。

## Centos6.x

这个命令相关的计划任务文件。 

cat  /etc/cron.daily/tmpwatch，内容 如下：

```bash
#! /bin/sh 
flags=-umc 
/usr/sbin/tmpwatch "$flags" -x /tmp/.X11-unix -x /tmp/.XIM-unix \ 
        -x /tmp/.font-unix -x /tmp/.ICE-unix -x /tmp/.Test-unix \ 
        -X ‘/tmp/hsperfdata_*’ 10d /tmp 
/usr/sbin/tmpwatch "$flags" 30d /var/tmp 
for d in /var/{cache/man,catman}/{cat?,X11R6/cat?,local/cat?}; do 
    if [ -d "$d" ]; then 
        /usr/sbin/tmpwatch "$flags" -f 30d "$d" 
    fi 
done
```

第一行相当于一个标记（参数）

第二行就是针对/tmp目录里面排除的目录

第三行，这是对这个/tmp目录的清理，下面的是针对其他目录的清理，就不说了。

```
/usr/sbin/tmpwatch "$flags" 30d /var/tmp
```

30d，就是30天的意思，决定了30天清理/tmp下不访问的文件。如果说，你想一天一清理的话，就把这个30d改成1d。这个你懂的……哈哈！

但有个问题需要注意，如果你设置更短的时间来清理的话，比如说是30分钟、10秒等等，你可以在这个文件中设置，但你会发现，它不会清理/tmp文件夹里面的内容，这是为什么呢？

这就是tmpwatch他所在的位置决定的，他的上层目录是/etc/cron.daily/，而这个目录是每天执行一次计划任务，所以说，你设置了比一天更短的时间，他就不起作用了，这下明白了吧。 

**注意**

在RHEL6中，系统自动清理/tmp文件夹的默认时限是30天

## Centos7.x

CentOS6以下系统（含）如上所述使用tmpwatch + cron来实现定时清理临时文件的效果。这点在CentOS7发生了变化，在CentOS7下，系统使用systemd管理易变与临时文件，与之相关的系统服务有3个：

```bash
systemd-tmpfiles-setup.service  ：Create Volatile Files and Directories
systemd-tmpfiles-setup-dev.service：Create static device nodes in /dev
systemd-tmpfiles-clean.service ：Cleanup of Temporary Directories
```

相关的配置文件也有3个地方：

```bash
/etc/tmpfiles.d/*.conf
/run/tmpfiles.d/*.conf
/usr/lib/tmpfiles.d/*.conf
```

/tmp目录的清理规则主要取决于 /usr/lib/tmpfiles.d/tmp.conf 文件的设定，默认的配置内容为：

```bash
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.
 
# See tmpfiles.d(5) for details
 
# Clear tmp directories separately, to make them easier to override
v /tmp 1777 root root 10d           #   清理/tmp下10天前的目录和文件
v /var/tmp 1777 root root 30d       #   清理/var/tmp下30天前的目录和文件
 
# Exclude namespace mountpoints created with PrivateTmp=yes
x /tmp/systemd-private-%b-*
X /tmp/systemd-private-%b-*/tmp
x /var/tmp/systemd-private-%b-*
X /var/tmp/systemd-private-%b-*/tmp
```

我们可以配置这个文件，比如你不想让系统自动清理/tmp下以tomcat开头的目录，那么增加下面这条内容到配置文件中即可：

```bash
x /tmp/tomcat.*
```

```
x  在根据"寿命"字段清理过期文件时， 忽略指定的路径及该路径下的所有内容。 可以在"路径"字段中使用shell风格的通配符。 注意，这个保护措施对 r 与 R 无效。

X  在根据"寿命"字段清理过期文件时， 仅忽略指定的路径自身而不包括该路径下的其他内容。 可以在"路径"字段中使用shell风格的通配符。 注意，这个保护措施对 r 与 R 无效
```



## Ubuntu

Ubuntu系统中，/tmp文件夹里面的内容，每次开机都会被清空，如果不想让他自动清理的话，只需要更改rcS文件中的TMPTIME的值。 

```bash
sudo vi /etc/default/rcS

#把 TMPTIME=0
#修改成 TMPTIME=-1或者是无限大
```

更改后，系统在重新启动的时候就不会清理你的/tmp目录了。 举一反三，如果说要限制多少时间来清理的话，就可以改成相应的值即可。

**注意**

在Ubuntu中，系统自动清理/tmp文件夹的时限默认每次启动