---
title: 'Redis-cluster集群[四]:redis-cluster集群配置'
categories:
  - 数据库
  - NoSQL
  - Redis
tags:
  - Redis
copyright: true
abbrlink: d2e62a87
date: 2019-07-30 18:01:08
---

## Redis分片：

为什么要分片：随着Redis存储的数据越来越庞大，会导致Redis的性能越来越差！

目前分片的方法：

1,客户端分片

在应用层面分片，程序里指定什么数据存放在那个Redis  优势：比较灵活    缺点：加个节点扩容就很费劲

2, 代理Proxy分片  第三方的Twemproxy  使用代理的缺点，你代理什么性能，那么你整个Redis的性能就是什么样的！

3, redis cluster

4, codis （豌豆荚）开源

 <!--more-->

## 参考文档

[Redis cluster](http://redisdoc.com/topic/cluster-tutorial.html#id2)



## 集群分片原理：

Redis 集群使用数据分片（sharding）而非一致性哈希（consistency hashing）来实现： 一个 Redis 集群包含 16384 个哈希槽（hash slot），

数据库中的每个键都属于这 16384 个哈希槽的其中一个， 集群使用公式 CRC16(key) % 16384 来计算键 key 属于哪个槽，

其中 CRC16(key) 语句用于计算键 key 的 CRC16 校验和 。

集群中的每个节点负责处理一部分哈希槽。 举个例子， 一个集群可以有三个哈希槽， 其中：

    * 节点 A 负责处理 0 号至 5500 号哈希槽。
    * 节点 B 负责处理 5501 号至 11000 号哈希槽。
    * 节点 C 负责处理 11001 号至 16384 号哈希槽。

这种将哈希槽分布到不同节点的做法使得用户可以很容易地向集群中添加或者删除节点。 比如说：

    * 如果用户将新节点 D 添加到集群中， 那么集群只需要将节点 A 、B 、 C 中的某些槽移动到节点 D 就可以了。
    * 与此类似， 如果用户要从集群中移除节点 A ， 那么集群只需要将节点 A 中的所有哈希槽移动到节点 B 和节点 C ， 然后再移除空白（不包含任何哈希槽）的节点 A 就可以了。

因为将一个哈希槽从一个节点移动到另一个节点不会造成节点阻塞， 所以无论是添加新节点还是移除已存在节点， 又或者改变某个节点包含的哈希槽数量， 都不会造成集群下线。


Redis集群中的主从复制
为了使得集群在一部分节点下线或者无法与集群的大多数（majority）节点进行通讯的情况下， 仍然可以正常运作，

Redis 集群对节点使用了主从复制功能： 集群中的每个节点都有 1 个至 N 个复制品（replica）， 其中一个复制品为主节点（master）， 而其余的 N-1 个复制品为从节点（slave）。
在之前列举的节点 A 、B 、C 的例子中， 如果节点 B 下线了， 那么集群将无法正常运行， 因为集群找不到节点来处理 5501 号至 11000 号的哈希槽。
另一方面， 假如在创建集群的时候（或者至少在节点 B 下线之前）， 我们为主节点 B 添加了从节点 B1 ， 那么当主节点 B 下线的时候， 集群就会将 B1 设置为新的主节点，

并让它代替下线的主节点 B ， 继续处理 5501 号至 11000 号的哈希槽， 这样集群就不会因为主节点 B 的下线而无法正常运作了。

不过如果节点 B 和 B1 都下线的话， Redis 集群还是会停止运作。

Redis 集群的一致性保证（guarantee）
Redis 集群不保证数据的强一致性（strong consistency）： 在特定条件下， Redis 集群可能会丢失已经被执行过的写命令。
使用异步复制（asynchronous replication）是 Redis 集群可能会丢失写命令的其中一个原因。 考虑以下这个写命令的例子：

    * 客户端向主节点 B 发送一条写命令。
    * 主节点 B 执行写命令，并向客户端返回命令回复。
    * 主节点 B 将刚刚执行的写命令复制给它的从节点 B1 、 B2 和 B3 。

如你所见， 主节点对命令的复制工作发生在返回命令回复之后， 因为如果每次处理命令请求都需要等待复制操作完成的话， 那么主节点处理命令请求的速度将极大地降低 —— 我们必须在性能和一致性之间做出权衡。
如果真的有必要的话， Redis 集群可能会在将来提供同步地（synchronou）执行写命令的方法。
Redis 集群另外一种可能会丢失命令的情况是， 集群出现网络分裂（network partition）， 并且一个客户端与至少包括一个主节点在内的少数（minority）实例被孤立。
举个例子， 假设集群包含 A 、 B 、 C 、 A1 、 B1 、 C1 六个节点， 其中 A 、B 、C 为主节点， 而 A1 、B1 、C1 分别为三个主节点的从节点， 另外还有一个客户端 Z1 。
假设集群中发生网络分裂， 那么集群可能会分裂为两方， 大多数（majority）的一方包含节点 A 、C 、A1 、B1 和 C1 ， 而少数（minority）的一方则包含节点 B 和客户端 Z1 。
在网络分裂期间， 主节点 B 仍然会接受 Z1 发送的写命令：

    * 如果网络分裂出现的时间很短， 那么集群会继续正常运行；
    * 但是， 如果网络分裂出现的时间足够长， 使得大多数一方将从节点 B1 设置为新的主节点， 并使用 B1 来代替原来的主节点 B ， 那么 Z1 发送给主节点 B 的写命令将丢失。

注意， 在网络分裂出现期间， 客户端 Z1 可以向主节点 B 发送写命令的最大时间是有限制的， 这一时间限制称为节点超时时间（node timeout）， 是 Redis 集群的一个重要的配置选项：

   * 对于大多数一方来说， 如果一个主节点未能在节点超时时间所设定的时限内重新联系上集群， 那么集群会将这个主节点视为下线， 并使用从节点来代替这个主节点继续工作。

   * 对于少数一方， 如果一个主节点未能在节点超时时间所设定的时限内重新联系上集群， 那么它将停止处理写命令， 并向客户端报告错误。

     

## Redis Cluster安装：

1、安装环境：首先确保安装了Redis

```shell
cd /opt/
mkdir `seq 7001 7008`
cp /etc/redis/6379.conf ./
 
 
配置文件里：
 
新增这三行即可
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
 
并且报：AOF是开启的
appendonly yes
 
 
#把相关的信息都统一修改为：6379  （端口、日志文件、存储dir持久化）
sed  's/6379/7001/g' 6379.conf > 7001/redis.conf
sed  's/6379/7002/g' 6379.conf > 7002/redis.conf
sed  's/6379/7003/g' 6379.conf > 7003/redis.conf
sed  's/6379/7004/g' 6379.conf > 7004/redis.conf
sed  's/6379/7005/g' 6379.conf > 7005/redis.conf
sed  's/6379/7006/g' 6379.conf > 7006/redis.conf
sed  's/6379/7007/g' 6379.conf > 7007/redis.conf
sed  's/6379/7008/g' 6379.conf > 7008/redis.conf
 
 
for i in `seq 7001 7009`;do cd /opt/$i && /usr/local/bin/redis-server redis.conf ; done
```

2、安装管理工具，源码自带了一个管理Cluster集群的工具是用ruby写的所以需要安装ruby

```shell
yum -y install ruby rubygems
#安装ruby的管理工具redis
gem install redis 
```

 3、复制管理工具

```shell
cp /opt/redis-3.0.4/src/redis-trib.rb /usr/local/bin/redis-trib
#查看redis-trib帮助
redis-trib help
```

 4、创建集群  7001-7006   6个redis为集群node，7007-7008   “2个redis为back node”

```shell
[root@server.tianshuai.com]$ redis-trib create --replicas 1 192.168.0.201:7001 192.168.0.201:7002 192.168.0.201:7003 192.168.0.201:7004 192.168.0.201:7005 192.168.0.201:7006
>>> Creating cluster
Connecting to node 192.168.0.201:7001: OK
Connecting to node 192.168.0.201:7002: OK
Connecting to node 192.168.0.201:7003: OK
Connecting to node 192.168.0.201:7004: OK
Connecting to node 192.168.0.201:7005: OK
Connecting to node 192.168.0.201:7006: OK
>>> Performing hash slots allocation on 6 nodes...
Using 3 masters:
192.168.0.201:7001
192.168.0.201:7002
192.168.0.201:7003                                                                         
Adding replica 192.168.0.201:7004 to 192.168.0.201:7001
Adding replica 192.168.0.201:7005 to 192.168.0.201:7002
Adding replica 192.168.0.201:7006 to 192.168.0.201:7003
M: 699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001                          
   slots:0-5460 (5461 slots) master
M: 96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002
   slots:5461-10922 (5462 slots) master
M: f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003
   slots:10923-16383 (5461 slots) master
S: d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004                          
   replicates 699f318027f87f3c49d48e44116820e673bd306a
S: d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005
   replicates 96892fd3f51292e922383ddb6e8018e2f772deed
S: a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006
   replicates f702fd03c1e3643db7e385915842533ba5aab98d
Can I set the above configuration? (type 'yes' to accept):  YES
 
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join...
>>> Performing Cluster Check (using node 192.168.0.201:7001)
M: 699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001
   slots:0-5460 (5461 slots) master
M: 96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002
   slots:5461-10922 (5462 slots) master
M: f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003
   slots:10923-16383 (5461 slots) master
M: d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004
   slots: (0 slots) master
   replicates 699f318027f87f3c49d48e44116820e673bd306a
M: d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005
   slots: (0 slots) master
   replicates 96892fd3f51292e922383ddb6e8018e2f772deed
M: a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006
   slots: (0 slots) master
   replicates f702fd03c1e3643db7e385915842533ba5aab98d
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
 
#create --replicas 1    这里--replicas 1 是指定复制几份，相当于每个master有几个从
#redis cluaster最低要求有3个master
#master的定义  host1:port host2:port  host3:port如果--replicas 1 那么：
#host1:port == master  host2:port 是：host1:port从
 
#如果--replicas 2 那么：
#host1:port == master host2:port & host3:port 是host1:port 的从
 
M: 这个是cluaster 自动生成的ID 集群在通信的时候是使用这个ID来区分的
```

 4、连接cluster（连接任意的Cluster集群中的服务器即可）

```shell
redis-cli -c -h 192.168.0.201 -p 7001   的需要加-c的参数   可以连接集群的任意节点！
 
192.168.0.201:7001> cluster nodes  查看cluster节点
f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003 master - 0 1444813870405 3 connected 10923-16383
699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001 myself,master - 0 0 1 connected 0-5460
d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004 slave 699f318027f87f3c49d48e44116820e673bd306a 0 1444813870105 4 connected
a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006 slave f702fd03c1e3643db7e385915842533ba5aab98d 0 1444813868605 6 connected
96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002 master - 0 1444813869405 2 connected 5461-10922
d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005 slave 96892fd3f51292e922383ddb6e8018e2f772deed 0 1444813869105 5 connected
 
192.168.0.201:7001> cluster info  查看cluster信息
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:6
cluster_size:3
cluster_current_epoch:6
cluster_my_epoch:1
cluster_stats_messages_sent:1809
cluster_stats_messages_received:1809
```

5、集群扩容

```shell
redis-trib add-node 192.168.0.201:7007 192.168.0.201:7001 
命令解释：
redis-trib add-node 要加的节点和端口  现有任意节点和端口
 
加完之后查看结果：
192.168.0.201:7001> cluster info
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_slots_pfail:0
cluster_slots_fail:0
cluster_known_nodes:7
cluster_size:3
cluster_current_epoch:6
cluster_my_epoch:1
cluster_stats_messages_sent:2503
cluster_stats_messages_received:2503
192.168.0.201:7001> cluster nodes
f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003 master - 0 1444814061587 3 connected 10923-16383
699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001 myself,master - 0 0 1 connected 0-5460
d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004 slave 699f318027f87f3c49d48e44116820e673bd306a 0 1444814062087 4 connected
a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006 slave f702fd03c1e3643db7e385915842533ba5aab98d 0 1444814061087 6 connected
a1301a9e1fd24099cd8dc49c47f2263e3124e4d6 192.168.0.201:7007 master - 0 1444814063089 0 connected
96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002 master - 0 1444814062589 2 connected 5461-10922
d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005 slave 96892fd3f51292e922383ddb6e8018e2f772deed 0 1444814061587 5 connected
192.168.0.201:7001> 
```

 6、新加上来没有数据-及没有槽位，我们可以用命令让他重新分片（分片）

```shell
redis-trib reshard 192.168.0.201:7007
```

 7、在添加一个服务器做从

```shell
在添加一个7008 让他做7008的从
[root@server.tianshuai.com]$ redis-trib add-node 192.168.0.201:7008 192.168.0.201:7001
加进来之后默认就是mater但是他没有任何的槽位
192.168.0.201:7001> cluster nodes
f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003 master - 0 1444814915795 3 connected 11089-16383
699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001 myself,master - 0 0 1 connected 166-5460
d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004 slave 699f318027f87f3c49d48e44116820e673bd306a 0 1444814917298 4 connected
a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006 slave f702fd03c1e3643db7e385915842533ba5aab98d 0 1444814916297 6 connected
a02a66e0286ee2f0a9b5380f7584b9b20dc032ff 192.168.0.201:7008 master - 0 1444814915796 0 connected
a1301a9e1fd24099cd8dc49c47f2263e3124e4d6 192.168.0.201:7007 master - 0 1444814915295 7 connected 0-165 5461-5627 10923-11088
96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002 master - 0 1444814916898 2 connected 5628-10922
d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005 slave 96892fd3f51292e922383ddb6e8018e2f772deed 0 1444814916798 5 connected
 
然后连接到7008的这个redis实例上，然后复制7007的ID
192.168.0.201:7008> cluster replicate a1301a9e1fd24099cd8dc49c47f2263e3124e4d6
OK
然后看下：
192.168.0.201:7008> cluster nodes
699f318027f87f3c49d48e44116820e673bd306a 192.168.0.201:7001 master - 0 1444815074072 1 connected 166-5460
a1301a9e1fd24099cd8dc49c47f2263e3124e4d6 192.168.0.201:7007 master - 0 1444815073071 7 connected 0-165 5461-5627 10923-11088
96892fd3f51292e922383ddb6e8018e2f772deed 192.168.0.201:7002 master - 0 1444815073671 2 connected 5628-10922
a77b16c4f140c0f5c17c907ce7ee5e42ee2a7b02 192.168.0.201:7006 slave f702fd03c1e3643db7e385915842533ba5aab98d 0 1444815073571 3 connected
f702fd03c1e3643db7e385915842533ba5aab98d 192.168.0.201:7003 master - 0 1444815072571 3 connected 11089-16383
d0994ce7ef68c0834030334afcd60013773f2e77 192.168.0.201:7004 slave 699f318027f87f3c49d48e44116820e673bd306a 0 1444815073071 1 connected
d880581504caff4a002242b2b259d5242b8569fc 192.168.0.201:7005 slave 96892fd3f51292e922383ddb6e8018e2f772deed 0 1444815073871 2 connected
a02a66e0286ee2f0a9b5380f7584b9b20dc032ff 192.168.0.201:7008 myself,slave a1301a9e1fd24099cd8dc49c47f2263e3124e4d6 0 0 0 connected
192.168.0.201:7008>
```



```shell
192.168.7.107:7002> set key101 shuaige
-> Redirected to slot [1601] located at 192.168.7.107:7001
OK
192.168.7.107:7001> set key102 shuaige
-> Redirected to slot [13858] located at 192.168.7.107:7003
OK
192.168.7.107:7003> set key103 shuaige
-> Redirected to slot [9731] located at 192.168.7.107:7002
OK
192.168.7.107:7002> set key104 shuaige
-> Redirected to slot [5860] located at 192.168.7.107:7007
OK
192.168.7.107:7007> set key105 shuaige
-> Redirected to slot [1733] located at 192.168.7.107:7001
OK
192.168.7.107:7001>
```

