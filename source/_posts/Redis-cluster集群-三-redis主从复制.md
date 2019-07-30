---
title: 'Redis-cluster集群[三]:redis主从复制'
categories:
  - 数据库运维
tags:
  - Redis
copyright: true
abbrlink: 1e52f2e4
date: 2019-07-30 17:54:51
---

## Redis主从复制原理：

通过把这个RDB文件或AOF文件传给slave服务器，slave服务器重新加载RDB文件，来实现复制的功能！

复制的话：主服务器可以有多个从服务器！！！  不仅这样从服务器还可以有从服务器，可以做成星状的结构！

复制的话也不会阻塞进程，同样fork一个子进程来做！

 

复制的原理：

当建立一个从服务器后，从服务器会想主服务器发送一个SYNC的命令，主服务器接收到SYNC命令之后会执行BGSAVE

然后保存到RDB文件，然后发送到从服务器！收到RDB文件然后就载入到内存！

最早不支持增量，到2.8之后就支持增量了！

<!--more-->

## Redis主从配置：

配置非常简单：

我要把：192.168.0.201  6380 作为192.168.0.201 6379的从就一条命令

```shell
192.168.0.201:6380> slaveof 192.168.0.201 6379
OK
 
#然后使用INFO查看下：
# Replication
role:slave
master_host:192.168.0.201
master_port:6379
master_link_status:up
master_last_io_seconds_ago:7
master_sync_in_progress:0
slave_repl_offset:85
slave_priority:100
slave_read_only:1
connected_slaves:0
master_repl_offset:0
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
 
#然后在到主的上面看下：
15:38 [root@server.tianshuai.com]$ redis-cli -h 192.168.0.201 -p 6379
192.168.0.201:6379> INFO
 
 
#Replication
role:master
connected_slaves:1
slave0:ip=192.168.0.201,port=6380,state=online,offset=183,lag=1    #
master_repl_offset:183
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:2
repl_backlog_histlen:182
 
 
#从2.61 的时候！从是仅读的
192.168.0.201:6380> SET key1 2
(error) READONLY You can't write against a read only slave.
192.168.0.201:6380><br>##现实工作场景中，写和读是1：10的吗，我们就可以，设置多1个主多个从这样，进行读写分离！
```

 