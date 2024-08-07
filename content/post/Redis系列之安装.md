---
title: Redis系列之安装
categories:
  - 数据库
  - NoSQL
  - Redis
tags:
  - Redis
copyright: true
abbrlink: 72cca2b5
date: 2019-06-21 09:16:41
---

## 前言

redis作为nosql家族中非常热门的一员，也是被大型互联网公司所青睐，无论你是开发、测试或者运维，学习掌握它总会为你的职业生涯增色添彩。本文介绍Redis的安装及配置详解。

<!--more-->

## redis简介

### 概述

redis(REmote DIctionary Server)是一个由Salvatore Sanfilippo写key-value存储系统，它由C语言编写、遵守BSD协议、支持网络、可基于内存亦可持久化的日志型、Key-Value类型的数据库，并提供多种语言的API。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hash（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步，redis在3.0版本推出集群模式。

### 特点、优势

- k、v键值存储以及数据结构存储（如列表、字典）
- 所有数据(包括数据的存储)操作均在内存中完成
- 单线程服务(这意味着会有较多的阻塞情况)，采用epoll模型进行请求响应，对比nginx
- 支持主从复制模式，更提供高可用主从复制模式（哨兵）
- 去中心化分布式集群
- 丰富的编程接口支持，如Python、Golang、Java、php、Ruby、Lua、Node.js 
- 功能丰富，除了支持多种数据结构之外，还支持事务、发布/订阅、消息队列等功能
- 支持数据持久化(AOF、RDB)

### 对比memcache

- memcache是一个分布式的内存对象缓存系统，并不提供持久存储功能，而redis拥有持久化功能
- memcache数据存储基于LRU(简单说：最近、最少使用key会被剔除)，而redis则可以永久保存(服务一直运行情况下)
- memcache是多线程的（这是memcache优势之一），也就意味着阻塞情况少，而redis是单线程的，阻塞情况相对较多
- 两者性能上相差不大
- memcache只支持简单的k、v数据存储，而redis支持多种数据格式存储。
- memcache是多线程、非阻塞IO复用网络模型，而redis是单线程IO复用模型

## 安装部署

```shell
yum install gcc -y  #安装C依赖
wget http://download.redis.io/redis-stable.tar.gz  #下载稳定版本
tar zxvf redis-stable.tar.gz  #解压
cd redis-stable
make PREFIX=/opt/redis test   #指定目录编译，也可以不用指定
make install







###启动与停止
/etc/init.d/redis start
/etc/init.d/redis stop
```

## 开机自启动

1，设置redis.conf中daemonize为yes,确保守护进程开启,也就是在后台可以运行.

```shell
vi /etc/redis/6379.conf #修改配置文件： 
bind 0.0.0.0      #监听地址
maxmemory 4294967296   #限制最大内存（4G）：
daemonize yes   #后台运行
```

2. 复制redis配置文件(启动脚本需要用到配置文件内容,所以要复制)

```shell
`[root@localhost /]# mkdir /etc/redis    #在/etc下新建redis文件夹``[root@localhost redis]# cp /opt/redis-3.0.5/redis.conf /etc/redis/6379.conf   #把安装redis目录里面的redis.conf文件复制到/etc/redis/6379.conf里面,6379.conf启动脚本里面的变量会读取这个名称,6379是redis的端口号       `
```

3. 复制redis启动脚本

```shell
`[root@localhost redis]# find / -name redis_init_script    #redis启动脚本一般在redis根目录的utils,如果不知道路径,可以先查看路径``/usr/redis/redis-3.2.4/utils/redis_init_script``[root@localhost redis]# cp /opt/redis-3.0.5/utils/redis_init_script /etc/init.d/redis    #复制启动脚本到/etc/rc.d/init.d/redis文件中`
```

4. 修改启动脚本参数

```shell
`[root@localhost redis]# vim /etc/rc.d/init.d/redis``#在/etc/init.d/redis文件的头部添加下面两行注释代码,也就是在文件中#!/bin/sh的下方添加``# chkconfig: 2345 10 90 ``# description: Start and Stop redis`
```

同时还要修改参数,指定redis的安装路径

```shell
`以下是我的安装路径：``REDISPORT=6379``EXEC=/opt/redis-3.0.5/src/redis-server``CLIEXEC=/opt/redis-3.0.5/src/redis-cli`
```

5. 设置redis开机自启动

```shell
chkconfig --add redis   
chkconfig redis on   #开启开机启动
chkconfig redis off  #关闭开机启动

#打开redis命令：
service redis start

#关闭redis命令：
service redis stop

#重启redis命令：
service redis restart
```

## 验证

```shell
#执行客户端工具
redis-cli 
#输入命令info
127.0.0.1:6379> info
```

![](1.png)

## 执行文件说明

redis安装完成后会有以下可执行文件（window下是exe文件）生成，下面是各个文件的作用。

```shell
redis-server　　　　   #Redis服务器和Sentinel服务器，启动时候可使用--sentinel指定为哨兵
redis-cli　　　　　    #Redis命令行客户端 
redis-benchmark　     #Redis性能测试工具 
redis-check-aof      #AOF文件修复工具 
redis-check-dump     #RDB文件检测工具 
redis-sentinel       #Sentinel服务器,4.0版本已经做了软链接到redis-server
```

## 配置详解

redis所有的配置参数都可以通过客户端通过“CONFIG GET 参数名” 获取，参数名支持通配符，如*代表所有。所得结果并按照顺序分组，第一个返回结果是参数名，第二个结果是参数对应的值。

![img](2.png)

除了查看配置还可以使用CONFIG SET修改配置，写入配置文件使用CONFIG REWRITE,使用时是需要注意某些关于服务配置参数慎重修改，如bind。

![img](3.png)

配置参数以及解释，需要注意的是，有些配置是4.0.10新增的，有些配置已经废除，如vm相关配置，和集群相关配置在集群篇章在进行补充。

```shell
logfile
#日志文件位置及文件名称

bind 0.0.0.0
#监听地址，可以有多个 如bind 0.0.0.0 127.0.0.1

daemonize yes
#yes启动守护进程运行，即后台运行，no表示不启用

pidfile /var/run/redis.pid 
# 当redis在后台运行的时候，Redis默认会把pid文件在在/var/run/redis.pid，也可以配置到其他地方。
# 当运行多个redis服务时，需要指定不同的pid文件和端口

port 6379
# 指定redis运行的端口，默认是6379

unixsocket 
#sock文件位置

unixsocketperm
#sock文件权限

timeout 0
# 设置客户端连接时的超时时间，单位为秒。当客户端在这段时间内没有发出任何指令，那么关闭该连接， 0是关闭此设置

loglevel debug
# 指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning，默认为verbose

logfile ""
# 日志文件配置,默认值为stdout，标准输出，若后台模式会输出到/dev/null

syslog-enabled
# 是否以syslog方式记录日志，yes开启no禁用，与该配置相关配置syslog-ident 和syslog-facility local0 分别是指明syslog的ident和facility

databases 16
#配置可用的数据库个数，默认值为16，默认数据库为0，数据库范围在0-（database-1）之间

always-show-logo yes #4.0以后新增配置
#是否配置日志显示redis徽标，yes显示no不显示


######################## 快照相关配置 #########################

save 900 1
save 300 10
save 60 10000
#配置快照(rdb)促发规则，格式：save <seconds> <changes>
#save 900 1  900秒内至少有1个key被改变则做一次快照
#save 300 10  300秒内至少有300个key被改变则做一次快照
#save 60 10000  60秒内至少有10000个key被改变则做一次快照

dbfilename  dump.rdb
#rdb持久化存储数据库文件名，默认为dump.rdb

stop-write-on-bgsave-error yes 
#yes代表当使用bgsave命令持久化痤疮时候禁止写操作

rdbchecksum yes
#开启rdb文件校验

dir "/etc"
#数据文件存放目录，rdb快照文件和aof文件都会存放至该目录


######################### 复制相关配置参数 #########################

slaveof <masterip> <masterport>  
#设置该数据库为其他数据库的从数据库，设置当本机为slave服务时，设置master服务的IP地址及端口，在Redis启动时，它会自动从master进行数据同步

masterauth <master-password>
#主从复制中，设置连接master服务器的密码（前提master启用了认证）

slave-serve-stale-data yes
# 当从库同主机失去连接或者复制正在进行，从机库有两种运行方式：
# 1) 如果slave-serve-stale-data设置为yes(默认设置)，从库会继续相应客户端的请求
# 2) 如果slave-serve-stale-data是指为no，除了INFO和SLAVOF命令之外的任何请求都会返回一个错误"SYNC with master in progress"

repl-ping-slave-period 10
#从库会按照一个时间间隔向主库发送PING命令来判断主服务器是否在线，默认是10秒

repl-timeout 60
#设置主库批量数据传输时间或者ping回复时间间隔超时时间，默认值是60秒
# 一定要确保repl-timeout大于repl-ping-slave-period

repl-backlog-size 1mb
#设置复制积压大小,只有当至少有一个从库连入才会释放。

slave-priority 100
#当主库发生宕机时候，哨兵会选择优先级最高的一个称为主库，从库优先级配置默认100，数值越小优先级越高

min-slaves-to-write 3
min-slaves-max-lag 10
#设置某个时间断内，如果从库数量小于该某个值则不允许主机进行写操作，以上参数表示10秒内如果主库的从节点小于3个，则主库不接受写请求，min-slaves-to-write 0代表关闭此功能。


########################## 安全相关配置 ###########################

requirepass
#客户端连接认证的密码，默认为空，即不需要密码，若配置则命令行使用AUTH进行认证

maxclients 10000
# 设置同一时间最大客户端连接数，4.0默认10000，Redis可以同时打开的客户端连接数为Redis进程可以打开的最大文件描述符数，
# 如果设置 maxclients 0，表示不作限制。
# 当客户端连接数到达限制时，Redis会关闭新的连接并向客户端返回max number of clients reached错误信息

maxmemory 4gb
#设置最大使用的内存大小

maxmemory-policy noeviction
#设置达到最大内存采取的策略：
# volatile-lru -> 利用LRU算法移除设置过过期时间的key (LRU:最近使用 Least Recently Used )
# allkeys-lru -> 利用LRU算法移除任何key
# volatile-random -> 移除设置过过期时间的随机key
# allkeys->random -> remove a random key, any key
# volatile-ttl -> 移除即将过期的key(minor TTL)
# 4.0默认noeviction代表不删除任何key，只在写操作时候返回错误。

maxmemory-samples 5
#LRU，LFU等算法样本设置，默认5个key


####################### AOF相关配置########################

appendonly no
# 设置AOF持久化，yes开启，no禁用，开启后redis会把所接收到的每一次写操作请求都追加到appendonly.aof文件中，当redis重新启动时，会从该文件恢复出之前的状态。
# 但是这样会造成appendonly.aof文件过大，所以redis还支持了BGREWRITEAOF指令，对appendonly.aof 进行重写。

appendfilename "appendonly.aof"
#设置AOF文件名

appendfsync everysec
# AOF文件写策略，Redis支持三种同步AOF文件的策略:
# no: 不进行同步，交给操作系统去执行 ，速度较快
# always: always表示每次有写操作都调用fsync方法强制内核将该写操作写入到文件，速度会慢, 但是安全，因为每次写操作都在AOF文件中.
# everysec: 表示对写操作进行累积，每秒同步一次，折中方案.
# 默认是"everysec"，按照速度和安全折中这是最好的。

no-appendfsync-on-rewrite no
# AOF策略设置为always或者everysec时，后台处理进程(后台保存或者AOF日志重写)会执行大量的I/O操作
# 在某些Linux配置中会阻止过长的fsync()请求。注意现在没有任何修复，即使fsync在另外一个线程进行处理，为了减缓这个问题，可以设置下面这个参数no-appendfsync-on-rewrite

auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
#当AOF文件增长到一定大小的时候Redis能够调用BGREWRITEAOF对日志文件进行重写，它是这样工作的：Redis会记住上次进行些日志后文件的大小(如果从开机以来还没进行过重写，那日子大小在开机的时候确定)。
#基础大小会同现在的大小进行比较。如果现在的大小比基础大小大制定的百分比，重写功能将启动
# 同时需要指定一个最小大小用于AOF重写，这个用于阻止即使文件很小但是增长幅度很大也去重写AOF文件的情况
# 设置 percentage 为0就关闭这个特性
#auto-aof-rewrite-percentage 代表AOF文件每次重写文件大小（以百分数代表），100表示百分之百，即当文件增加了1倍（100%），则开始重写AOF文件
#auto-aof-rewrite-min-size  设置最小重写文件大小，避免文件小而执行太多次的重写

aof-load-truncated yes
＃当redis突然运行崩溃时，会出现aof文件被截断的情况，Redis可以在发生这种情况时退出并加载错误，以下选项控制此行为。
＃如果aof-load-truncated设置为yes，则加载截断的AOF文件，Redis服务器启动发出日志以通知用户该事件。
＃否则，如果该选项设置为no，则服务器将中止并显示错误并停止启动。当该选项设置为no时，用户需要在重启之前使用“redis-check-aof”实用程序修复AOF文件在进行重启


########################## 慢查询配置 ###########################


slowlog-log-slower-than 10000
 #Redis Slow Log 记录超过特定执行时间的命令。执行时间不包括I/O计算比如连接客户端，返回结果等，只是命令执行时间，可以通过两个参数设置slow log：一个是告诉Redis执行超过多少时间被记录的参数slowlog-log-slower-than(微秒，因此1000000代表一分钟
#另一个是slow log 的长度。当一个新命令被记录的时候最早的命令将被从队列中移除
 
slowlog-max-len 128
#慢查询命令记录队列长度设置，该队列占用内存，可以使用SLOWLOG RESET清空队列



######################## 高级配置 ########################

hash-max-zipmap-entries 512
hash-max-zipmap-value 64
# 当hash中包含超过指定元素个数并且最大的元素没有超过临界时，hash将以一种特殊的编码方式（大大减少内存使用）来存储，这里可以设置这两个临界值
# Redis Hash对应Value内部实际就是一个HashMap，实际这里会有2种不同实现，
# 这个Hash的成员比较少时Redis为了节省内存会采用类似一维数组的方式来紧凑存储，而不会采用真正的HashMap结构，对应的value redisObject的encoding为zipmap,当成员数量增大时会自动转成真正的HashMap,此时encoding为ht。

list-max-ziplist-size -2
#Lists也以特殊方式编码，以节省大量空间。
＃可以指定每个内部列表节点允许的条目数
＃作为固定的最大大小或最大元素数。
＃对于固定的最大大小，使用-5到-1表示：
＃-5：最大大小：64 Kb < - 不建议用于正常工作负载
＃-4：最大尺寸：32 Kb < - 不推荐
＃-3：最大尺寸：16 Kb < - 可能不推荐
＃-2：最大尺寸：8 Kb < - 好
＃-1：最大尺寸：4 Kb < - 良好
＃正数意味着存储_exactly_元素数量
＃每个列表节点。
＃性能最高的选项通常为-2（8 Kb大小）或-1（4 Kb大小）

zset-max-ziplist-entries 128
zset-max-ziplist-value 64
# list数据类型多少节点以下会采用去指针的紧凑存储格式。
# list数据类型节点值大小小于多少字节会采用紧凑存储格式。

activerehashing yes
# Redis将在每100毫秒时使用1毫秒的CPU时间来对redis的hash表进行重新hash，可以降低内存的使用
# 当你的使用场景中，有非常严格的实时性需要，不能够接受Redis时不时的对请求有2毫秒的延迟的话，把这项配置为no。
# 如果没有这么严格的实时性要求，可以设置为yes，以便能够尽可能快的释放内存

client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
#客户端输出缓冲区限制可用于强制断开客户端，由于某种原因，没有足够快地从服务器读取数据，常见的原因是Pub / Sub客户端不能像很快的消费一条消息，可以为三种不同类型的客户端设置不同的限制：
#normal - >普通客户端，包括MONITOR客户端
#subve - >从服务器客户端
#pubsub - >客户端订阅了至少一个pubsub通道或模式
#设置方法：client-output-buffer-limit 软限制大小 硬限制大小 秒数
#当客户端达到硬限制大小则立即断开连接，当客户端达到软限制时候并且在设置的秒数缓冲大小任然超了，则在设置的秒数后断开连接
```

