---
title: 详解linux中文件的三种time
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 3b236ad9
date: 2019-06-05 18:53:41
---

## 目的

linux下文件有3个时间的，分别是atime,mtime,ctime。有些博友对这3个时间还是比较迷茫和困惑的，我整理了下，写下来希望对博友们有所帮助。

<!--more-->

## 含义

| 简名  | 全名        | 中文名   | 含义                                     |
| ----- | ----------- | -------- | ---------------------------------------- |
| atime | access time | 访问时间 | 文件中的数据库最后被访问的时间           |
| mtime | modify time | 修改时间 | 文件内容被修改的最后时间                 |
| ctime | change time | 变化时间 | 文件的元数据发生变化。比如权限，所有者等 |

## 查看

```shell
[root@centos7 time]# pwd
/app/time
[root@centos7 time]# ll
total 8
-rw-------. 1 root root 1933 Nov 11 08:14 anaconda-ks.cfg
-rw-r--r--. 1 root root   59 Nov 11 08:15 issue
[root@centos7 time]# stat issue 
  File: ‘issue’
  Size: 59            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 08:15:05.650986739 +0800
Modify: 2017-11-11 08:15:05.650986739 +0800
Change: 2017-11-11 08:15:05.650986739 +0800
 Birth: -
[root@centos7 time]# ls -l                               #默认的ls -l显示的是mtime     
total 8
-rw-------. 1 root      root 1933 Nov 11 08:14 anaconda-ks.cfg
-rw-r--r--. 1 zhaojiedi root   71 Nov 11 09:05 issue
[root@centos7 time]# ls -l --time=atime                             #列出文件的atime
total 8
-rw-------. 1 root      root 1933 Nov 11 08:14 anaconda-ks.cfg
-rw-r--r--. 1 zhaojiedi root   71 Nov 11 09:12 issue
[root@centos7 time]# ls -l --time=ctime　　　　　　　　　　　　　　　 #列出ctime
total 8
-rw-------. 1 root      root 1933 Nov 11 08:14 anaconda-ks.cfg
-rw-r--r--. 1 zhaojiedi root   71 Nov 11 09:03 issue
```

## 测试

### 3.1 准备工作

测试前，我们需要先关闭文件系统的relatime特性。这个随后在说，具体操作如下。

```shell
[root@centos7 time]# mount -o remount,strictatime /app  # 重新挂载我们的/app，并修改文件系统工作在严格atime上，也就是不启用了默认的relatime支持。
[root@centos7 time]# mount |grep /app                   #查看我们的修改
/dev/sda5 on /app type ext4 (rw,seclabel,data=ordered)
```

### 3.2 读取文件

```
[root@centos7 time]# stat issue                             #先获取3个时间
  File: ‘issue’
  Size: 59            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 08:15:05.650986739 +0800
Modify: 2017-11-11 08:15:05.650986739 +0800
Change: 2017-11-11 08:15:05.650986739 +0800
 Birth: -
[root@centos7 time]# cat issue                             #读取下
\S
Kernel \r on an \m
tty:   \l
hostname:   \n
time:    \t
[root@centos7 time]# stat issue 　　　　　　　　　　　　　　　#再次查看3个时间
  File: ‘issue’
  Size: 59            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 08:57:40.858948780 +0800
Modify: 2017-11-11 08:15:05.650986739 +0800
Change: 2017-11-11 08:15:05.650986739 +0800
 Birth: -
```



通过上面的分析，我们可以看出来，在使用cat读取文件后，文件的atime发生了改变。其他的没有改变。

### 3.3 修改文件

```
[root@centos7 time]# stat issue                           #先获取下3个time
  File: ‘issue’
  Size: 65            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 09:03:49.080931626 +0800
Modify: 2017-11-11 09:04:16.881930331 +0800
Change: 2017-11-11 09:04:16.881930331 +0800
 Birth: -
[root@centos7 time]# echo "hello" >> issue                #修改文件
[root@centos7 time]# stat issue 　　　　　　　　　　　　　　  #再次查看三个time
  File: ‘issue’
  Size: 71            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 09:03:49.080931626 +0800
Modify: 2017-11-11 09:05:07.775927960 +0800
Change: 2017-11-11 09:05:07.775927960 +0800
 Birth: -
```

通过上面的实验，我们可以看出来，写文件操作不会导致atime(访问时间）的修改，但是mtime和ctime会发生修改。mtime修改了我们可以理解的，毕竟我们修改了文件的，

那为何ctime也修改了呢， 仔细可以发现我们文件的大小发生了变化，也就是元数据发生了变化，所以ctime也是要变化的。



### 3.4 修改文件所有者

```shell
[root@centos7 time]# stat issue                                          #先查看下3个time 
  File: ‘issue’
  Size: 71            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 09:03:49.080931626 +0800
Modify: 2017-11-11 09:05:07.775927960 +0800
Change: 2017-11-11 09:05:07.775927960 +0800
 Birth: -
[root@centos7 time]# chown zhaojiedi issue                              #修改权限
[root@centos7 time]# stat issue 　　　　　　　　　　　　　　　　　　　　　　　 #再次查看3个时间
  File: ‘issue’
  Size: 71            Blocks: 8          IO Block: 4096   regular file
Device: 805h/2053d    Inode: 261123      Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/zhaojiedi)   Gid: (    0/    root)
Context: unconfined_u:object_r:etc_runtime_t:s0
Access: 2017-11-11 09:03:49.080931626 +0800
Modify: 2017-11-11 09:05:07.775927960 +0800
Change: 2017-11-11 09:12:42.076906795 +0800
 Birth: -
```

通过上面的实验，我们可以看出来，修改了权限后，文件ctime发生了变化。



## 说说relatime

常用命令对三个time的修改情况我们上面的测试，可以看出来，每次访问文件都会更新atime,这是很耗时的，尤其在web服务器上，大量用户只是访问html页面，完全没有必要修改atime。

从kernel2.6.29开始，文件系统默认集成了一个relatime的属性。

那么啥时候更新atime呢？ 有2种情况会更新atime,第一种是mtime比atime新，第二种是上次访问是1天前的了。



## 常用命令对三个time的修改情况

上面我们做了3个测试，我们也对atime,mtime,ctime有了一定的了解。网上有人已经做了好多测试如下表。

```shell
+-------------------------------------------------+
   |               |  timestamps marked for update   |
   |    syscall    |---------------------------------|
   |               |       file        | parent dir  |
   |---------------+-------------------+-------------|
   | [2]chdir      |                   |             |
   |---------------| -                 | -           |
   | [3]fchdir     |                   |             |
   |---------------+-------------------+-------------|
   | [4]chmod      |                   |             |
   |---------------| ctime             | -           |
   | [5]fchmod     |                   |             |
   |---------------+-------------------+-------------|
   | [6]chown      |                   |             |
   |---------------|                   |             |
   | [7]fchown     | ctime             | -           |
   |---------------|                   |             |
   | [8]lchown     |                   |             |
   |---------------+-------------------+-------------|
   | [9]close      | -                 | -           |
   |---------------+-------------------+-------------|
   | [10]creat     | atime,ctime,mtime | ctime,mtime |
   |---------------+-------------------+-------------|
   | [11]execve    | atime             | -           |
   |---------------+-------------------+-------------|
   | [12]fcntl     | -                 | -           |
   |---------------+-------------------+-------------|
   | [13]ftruncate |                   |             |
   |---------------| ctime,mtime       | -           |
   | [14]truncate  |                   |             |
   |---------------+-------------------+-------------|
   | [15]fstat     |                   |             |
   |---------------|                   |             |
   | [16]stat      | -                 | -           |
   |---------------|                   |             |
   | [17]lstat     |                   |             |
   |---------------+-------------------+-------------|
   | [18]fsync     |                   |             |
   |---------------| -                 | -           |
   | [19]fdatasync |                   |             |
   |---------------+-------------------+-------------|
   | [20]link      | ctime             | ctime,mtime |
   |---------------+-------------------+-------------|
   | [21]lseek     | -                 | -           |
   |---------------+-------------------+-------------|
   | [22]mknod     | atime,ctime,mtime | ctime,mtime |
   |---------------+-------------------+-------------|
   | [23]mkdir     | atime,ctime,mtime | ctime,mtime |
   |---------------+-------------------+-------------|
   | [24]mmap      | *                 | -           |
   |---------------+-------------------+-------------|
   | [25]munmap    | -                 | -           |
   |---------------+-------------------+-------------|
   | [26]msync     | *                 | -           |
   |---------------+-------------------+-------------|
   | [27]open      | *                 | *           |
   |---------------+-------------------+-------------|
   | [28]pread     |                   |             |
   |---------------|                   |             |
   | [29]read      | atime             | -           |
   |---------------|                   |             |
   | [30]readv     |                   |             |
   |---------------+-------------------+-------------|
   | [31]pwrite    |                   |             |
   |---------------|                   |             |
   | [32]write     | ctime,mtime       | -           |
   |---------------|                   |             |
   | [33]writev    |                   |             |
   |---------------+-------------------+-------------|
   | [34]rename    | implementation    | ctime,mtime |
   |---------------+-------------------+-------------|
   | [35]rmdir     | -                 | ctime,mtime |
   |---------------+-------------------+-------------|
   | [36]readlink  | *                 | -           |
   |---------------+-------------------+-------------|
   | [37]readdir   | atime             | -           |
   |---------------+-------------------+-------------|
   | readahead     | ?                 | ?           |
   |---------------+-------------------+-------------|
   | [38]symlink   | *                 | *           |
   |---------------+-------------------+-------------|
   | sendfile      | ?                 | ?           |
   |---------------+-------------------+-------------|
   | [39]unlink    | -                 | ctime,mtime |
   |---------------+-------------------+-------------|
   | [40]utime     | ctime             | -           |
   +-------------------------------------------------+ 
```