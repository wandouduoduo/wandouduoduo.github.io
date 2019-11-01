---
title: 'Redis-cluster集群[二]:redis持久化'
categories:
  - 数据库
  - NoSQL
  - Redis
tags:
  - Redis
copyright: true
abbrlink: 8d5e3656
date: 2019-07-30 15:14:21
---

## Redis持久化原理：

Redis支持两种持久化：**RDB**和**AOF**模式

<!--more-->

#### **名词解释：**

**RDB**：持久化可以在指定的时间间隔内生成数据集的时间点快照（point-in-time snapshot）。
**AOF**：持久化记录服务器执行的所有写操作命令，并在服务器启动时，通过重新执行这些命令来还原数据集。

**AOF** 文件中的命令全部以 Redis 协议的格式来保存，新命令会被追加到文件的末尾。 Redis 还可以在后台对 AOF 文件进行重写（rewrite）

使得 AOF 文件的体积不会超出保存数据集状态所需的实际大小。

PDB和AOF的优先级：

如果同时开启RDB和AOF模式，AOF的优先级要比RDB高：
Redis 还可以同时使用 AOF 持久化和 RDB 持久化。 在这种情况下， 当 Redis 重启时， 它会优先使用 AOF 文件来还原数据集。

因为 AOF 文件保存的数据集通常比 RDB 文件所保存的数据集更完整。

AOF 的方式有点像ORCAL的逻辑备库！
AOF redis 还会在后台对数据进行重写，比如set key1 ， set key1 ,其实第一次的set key1 没用，这样就可以把第一次set key1 删掉了。这样保存下来的数据集就很小了可以压缩了！
你甚至可以关闭持久化功能，让数据只在服务器运行时存在。

#### **RDB&AOF优缺点**

**RDB**的优缺点：
优点：
1、紧凑易于备份，他就一个文件。
2、RDB可以最大化redis性能、父进程无需做任何操作只需要for一个子进程即可
3、恢复比AOF块

缺点：
1、数据完整性：如果非常注重数据的完整性，那么RDB就不行，虽然他是一个point-in-time 的快照方式，但是在快照的过程中，redis重启了，那么在快照中的这些数据将会丢失
2、数据非常庞大后，非常耗CPU和时间，那么redis讲可能down掉1秒钟设置更长。

**AOF**的优缺点：
优点：
1、 使用 AOF 持久化会让 Redis 变得非常耐久，AOF默认的每一秒追加一次也可以修改他的方式没执行一次命令追加一次，所以你最多丢失1秒钟的数据
2、 AOF 文件是一个只进行追加操作的日志文件（append only log）
3、 Redis 可以在 AOF 文件体积变得过大时，自动地在后台对 AOF 进行重写

缺点：
1、对于相同的数据集来说，AOF 文件的体积通常要大于 RDB 文件的体积。
2、 根据所使用的 fsync 策略，AOF 的速度可能会慢于 RDB

 

#### **RDB & AOF 持久化原理**

快照的运行方式：

当 Redis 需要保存 dump.rdb 文件时， 服务器执行以下操作：

1. Redis 调用 fork() ，同时拥有父进程和子进程。
2. 子进程将数据集写入到一个临时 RDB 文件中。
3. 当子进程完成对新 RDB 文件的写入时，Redis 用新 RDB 文件替换原来的 RDB 文件，并删除旧的 RDB 文件。
4. 这种工作方式使得 Redis 可以从写时复制（copy-on-write）机制中获益。

AOF 重写和 RDB 创建快照一样，都巧妙地利用了写时复制机制。

以下是 AOF 重写的执行步骤：

1. Redis 执行 fork() ，现在同时拥有父进程和子进程。
2. 子进程开始将新 AOF 文件的内容写入到临时文件。
3. 对于所有新执行的写入命令，父进程一边将它们累积到一个内存缓存中，一边将这些改动追加到现有 AOF 文件的末尾： 这样即使在重写的中途发生停机，现有的 AOF 文件也还是安全的。
4. 当子进程完成重写工作时，它给父进程发送一个信号，父进程在接收到信号之后，将内存缓存中的所有数据追加到新 AOF 文件的末尾。
5. 搞定！现在 Redis 原子地用新文件替换旧文件，之后所有命令都会直接追加到新 AOF 文件的末尾。

AOF重写

因为 AOF 的运作方式是不断地将命令追加到文件的末尾， 所以随着写入命令的不断增加， AOF 文件的体积也会变得越来越大。
举个例子， 如果你对一个计数器调用了 100 次 INCR ， 那么仅仅是为了保存这个计数器的当前值， AOF 文件就需要使用 100 条记录（entry）。
然而在实际上， 只使用一条 SET 命令已经足以保存计数器的当前值了， 其余 99 条记录实际上都是多余的。
为了处理这种情况， Redis 支持一种有趣的特性： 可以在不打断服务客户端的情况下， 对 AOF 文件进行重建（rebuild）。
执行 BGREWRITEAOF 命令， Redis 将生成一个新的 AOF 文件， 这个文件包含重建当前数据集所需的最少命令。
Redis 2.2 需要自己手动执行 BGREWRITEAOF 命令； Redis 2.4 则可以自动触发 AOF 重写， 具体信息请查看 2.4 的示例配置文件。

## Rdis持久化设置：

#### 查看下面配置文件：

```shell
#默认Redis是开启的RDB模式的持久化
vim /etc/redis/6379.conf
=============================================================
################################ SNAPSHOTTING  ################################
#
# Save the DB on disk:
#
#   save <seconds> <changes>
#
#   Will save the DB if both the given number of seconds and the given
#   number of write operations against the DB occurred.
#
#   In the example below the behaviour will be to save:
#   after 900 sec (15 min) if at least 1 key changed
#   after 300 sec (5 min) if at least 10 keys changed
#   after 60 sec if at least 10000 keys changed
#
#   Note: you can disable saving completely by commenting out all "save" lines.
#
#   It is also possible to remove all the previously configured save
#   points by adding a save directive with a single empty string argument
#   like in the following example:
#
#   save ""
 
save 900 1
save 300 10
save 60 10000
 
================================================================
#上面3个save 是或的关系
 
#   save <seconds> <changes>   ###格式！
解释：
#   after 900 sec (15 min) if at least 1 key changed
#   after 300 sec (5 min) if at least 10 keys changed
#   after 60 sec if at least 10000 keys changed
 
#900 sec内有1个key发生了改变就做一次快照 
#或  300sec 内有10个keys发生了改变做一次快照   
#或60 sec内 10000 keys发生了改变做一次快照
 
#快照原理：
#forker出一个进程，是当前进程的一个副本相当于子进程，不会影响你当前运行的进程。
#当子进程写的时候会有一个临时的文件，当子进程写完之后会把这个
 
#临时的文件move替换老的文件，所以这个rdb的文件任何时间都是一个完整的可用的副本！
#你写的时候不会影响RDB这个文件，因为forker出的子进程正在写的是一个临时文件！
 
 
#但是如果如果故障了，你这个保存的时间是你开始快照那一刻那个时间，你快照到快照完毕那一段时间的数据就丢失了！
 
#如果想禁用持久化把这三行删了就行了
save 900 1
save 300 10
save 60 10000
```



####  快照保存在那里呢？

```shell
# The filename where to dump the DB
dbfilename dump.rdb   #如果你启用了多个快照名称，可以使用端口好来定义比如：dump_6379.rdb
 
# Note that you must specify a directory here, not a file name.
dir ./  #不仅仅是RDB模式下的DB存放在这个目录AOF模式下也是存放在这个目录的，建议存放在你指定的地方！
 
比如：
dir /opt/redis/
 
比如我上面指定了：
# The filename where to dump the DB
dbfilename dump_6379.rdb
 
# Note that you must specify a directory here, not a file name.
dir /opt/redis/
```



####  手动在Redis中保存

```shell
127.0.0.1:6379> SET key 1
OK
127.0.0.1:6379> SAVE
OK
 
下目录下面有没有修改：
-rw-r--r-- 1 root root 27 Oct 14 13:35 dump_6379.rdb 当前时间创建
在设置个key看下：
127.0.0.1:6379> SET key 2
OK
127.0.0.1:6379> SAVE
OK
 
-rw-r--r-- 1 root root 27 Oct 14 13:37 dump_6379.rdb
 
127.0.0.1:6379> BGSAVE
Background saving started
 
 
#SAVE和BGSAVE有什么区别：SAVE 是阻塞的当你直接执行SAVE的时候他就不干活了，BGSAVE是在后台执行。forker一个子进程来进行SAVE！
 
#SAVE的使用场景仅限于：当Redis需要迁移的时候，Redis没有数据写入并且可以停的时候使用！
 
#测试添加一个：key然后停掉看看！不保存：
#目前的key是：
127.0.0.1:6379> KEYS *
1) "key"
2) "key2"
3) "key3"
 
127.0.0.1:6379> SET key4 4
OK
 
#杀掉，重启之后发现设置的key丢失了。
#所以当redis异常挂掉之后，没有SAVE收据！
```

####  启用了AOF后

```shell
#给这个文件追加，把所有的命令都写到一个文件里面，你执行一个我写一个。
#恢复的话在执行一遍不就行了吗！非常简单 （但是恢复相对RDB模式回慢他相当于重新把AOF库里的记录重新往内存中写一边）
 
#可以RDB和AOF同时使用！优点都占用了！但是也的根据业务来定！
 
#开启方法：修改配置文件
appendonly yes  #改为yes
appendfilename "appendonly.aof"  #文件名
 
 
#工作原理：
#forker 一个子进程写到临时文件，写完之后就给父进程发一个信号，开始写到写完的这个过程还会有子进程给父进程发信号。先保存在内存里
#但是他有个好的功能，重写，他会定时对aof进行重新，这样文件就会非常小！
 
测试：（他会根据Redis可识别的方式写入文件，不过大概人也能看懂）
[root@192.168.7.107]$ cat appendonly.aof
*2
$6
SELECT
$1
0
*3
$3
SET
$4
kye1
```

