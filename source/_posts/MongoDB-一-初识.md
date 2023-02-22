---
title: 'MongoDB[一]:初识'
categories:
  - 数据库
  - NoSQL
  - MongoDB
tags:
  - MongoDB
copyright: true
abbrlink: 35556fc0
date: 2019-07-15 17:49:45
---

## 目的

本文对Nosql进行介绍，并且引申出mongodb，进而对mango安装过程进行记录。

<!--more-->

## NoSQL介绍

### **NoSQL简介**

NoSQL,全称是”Not Only Sql”,指的是非关系型的数据库。

非关系型数据库主要有这些特点:**非关系型的、分布式的、开源的、水平可扩展的**。

原始的目的是为了大规模 web 应用,这场全 新的数据库革命运动早期就有人提出,发展至 2009 年趋势越发高涨。

NoSQL 的拥护者们提倡运用非关系型的数据存储,通常的应用如:模式自由、支持简易复制、简单的 API、最终 的一致性(非 ACID)、大容量数据等。

NoSQL 被我们用得最多的当数 **key-value 存储（如Redis）**,当然还 有其他的**文档型的、列存储、图型数据库、xml 数据库**等。 

### **为什么会有NoSQL**

通用关系数据库功能强大，遵循SQL标准，而且性能卓越而且稳定为什么会出现NoSQL呢？

上面也说过了NoSQL的初识是随着WEB应用的飞速发展中出现的，在期间遇到了一些关系型数据库难以克服的问题，例如：

1、Highperformance- 对数据库高并发读写的需求

```
web2.0 网站要根据用户个性化信息来实时生成动态页面和提供动态信息,所以基本上无法 使用动态页面静态化技术,因此数据库并发负载非常高,往往要达到每秒上万次读写请求。 
关系型数据库应付上万次 SQL 查询还勉强顶得住,但是应付上万次 SQL 写数据请求,硬盘 IO 就已经无法承受了,其实对于普通的 BBS 网站,往往也存在对高并发写请求的需求。
```

2、HugeStorage- 对海量数据的高效率存储和访问的需求

```
对于大型的 SNS 网站,每天用户产生海量的用户动态信息,以国外的 Friend feed 为例,一 个月就达到了 2.5 亿条用户动态,
对于关系数据库来说,在一张 2.5 亿条记录的表里面进行 SQL 查询,效率是极其低下乃至不可忍受的。
再例如大型 web 网站的用户登录系统,例如腾 讯,盛大,动辄数以亿计的帐号,关系数据库也很难应付。
```

3、HighScalability&&HighAvailability- 对数据库的高可扩展性和高可用性的需求

```
随着数据库的不断增加，你的数据库没有办法向webserver或app那样简单的通过增加硬件来提升性能和负载能力。
并且mysql没有提供水平拆分的和扩容的方案，这是非常头疼的一件事情。
```

对于上面的三高要求来说很多关系型数据库就遇到了难以克服的问题，**并且在WEB2.0的网站和应用来说关系型数据库很多主要特性却无用武之地**！！！

1、数据库事务一致性需求

```
很多 web 实时系统并不要求严格的数据库事务,对读一致性的要求很低,有些场合对写一 致性要求也不高。因此数据库事务管理成了数据库高负载下一个沉重的负担。
```

2、数据库的写实时性和读实时性需求

```
对关系数据库来说,插入一条数据之后立刻查询,是肯定可以读出来这条数据的,但是对于 很多 web 应用来说,并不要求这么高的实时性。
```

3、对复杂的 SQL 查询,特是多表关联查询的需求

```
任何大数据量的 web 系统,都非常忌讳多个大表的关联查询,以及复杂的数据分析类型的复杂 SQL查询,特是SNS类型的网站,从需求以及产品设计角度,就避免了这种情况的产生。
往往更多的只是单表的主键查询,以及单表的简单条件分页查询,SQL 的功能被 极大的弱化了。
因此,关系数据库在这些越来越多的应用场景下显得不那么合适了
```

**为了解决如上问题NoSQL就诞生了~**

### **NoSQL特点**

1、它可以处理超大量的数据
2、它运行在便宜的服务器集群上集群扩充起来非常方便并且成本很低。
3、它击碎了性能瓶颈
NoSQL 的支持者称,通过 NoSQL 架构可以省去将 Web 或 Java 应用和数据转换成 SQL 格式的 时间,执行速度变得更快。
“SQL 并非适用于所有的程序代码”,对于那些繁重的重复操作的数据,SQL 值得花钱。但 是当数据库结构非常简单时,SQL 可能没有太大用处。
4、它没有过多的操作
虽然NoSQL的支持者也承认关系型数据库提供了无可比拟的功能集合,而且在数据完整性上也发挥绝对稳定,他们同时也表示,企业的具体需求可能没有那么复杂。
5、 它的支持者源于社区
因为NoSQL项目都是开源的,因此它们缺乏供应商提供的正式支持。这一点它们与大多数 开源项目一样,不得不从社区中寻求支持。
NoSQL 发展至今,出现了好几种非关系性数据库,比如我正在学习的MongoDB

## 初识MongoDB

MongoDB 是一个介于关系数据库和非关系数据库之间的产品,是非关系数据库当中功能最丰富,最像关系数据库的。
他支持的数据结构非常松散,是类似 json 的 bjson 格式,因此可以存储比较复杂的数据类型。
MongoDB最大的特点：它支持的查询语言非常强大,**其语法有点类似于面向对象的查询语言**,**几乎可以实现类似关系数据库单表查询的绝大部分功能**, 而且还支持对数据建立索引。它是一个面向集合的,模式自由的文档型数据库。

**1、 面向集合(Collenction-Orented)**
意思是数据被分组存储在数据集中, 被称为一个集合(Collenction)。每个集合在数据库中 都有一个唯一的标识名,并且可以包 无限数目的文档。集合的概念类似关系型数据库(RDBMS)里的表(table),不同的是它不需要定义任何模式(schema)。

**2、 模式自由(schema-free)**
意味着对于存储在 MongoDB 数据库中的文件,我们不需要知道它的任何结构定义。提了这 么多次"无模式"或"模式自由",它到是个什么概念呢?例如,下面两个记录可以存在于同一个集合里面:
{"welcome" : "Beijing"}
{"age" : 28}

**3、 文档型 意思是我们存储的数据是键-值对的集合,键是字符串,值可以是数据类型集合里的任意类型,**

包括数组和文档. 我们把这个数据格式称作 “BSON” 即 “Binary Serialized dOcument Notation.”

### **MongoDB特点**

1. 面向集合存储,易于存储对象类型的数据
2. 模式自由
3. 支持动态查询
4. 支持完全索引,包 内部对象
5. 支持查询
6. 支持复制和故障恢复
7. 使用高效的二进制数据存储,包括大型对象(如视频等)
8. 自动处理碎片,以支持云计算层次的扩展性
9. 支持 Python,PHP,Ruby,Java,C,C#,Javascript,Perl更多请看社区
10. 文件存储格式为 BSON(一种 JSON 的扩展)
11. 可通过网络访问

### **MongoDB功能**

1. 面向集合的存储:适合存储对象及 JSON 形式的数据
2. 动态查询:MongoDB 支持丰富的查询表达式。查询指令使用 JSON 形式的标记,可轻易查询文档中内嵌的对象及数组
3. 完整的索引支持:包括文档内嵌对象及数组。MongoDB 的查询优化器会分析查询表达式,并生成一个高效的查询计划
4. 查询监视:MongoDB 包 一系列监视工具用于分析数据库操作的性能
5. 复制及自动故障转移:MongoDB 数据库支持服务器之间的数据复制,支持主-从模式及
6. 服务器之间的相互复制。复制的主要目标是提供冗余及自动故障转移
7. 高效的传统存储方式:支持二进制数据及大型对象(如照片或图片)
8. 自动分片以支持云级 的伸缩性:自动分片功能支持水平的数据库集群,可动态添加额外的机器

### **适用场景**

1. 网站数据:MongoDB 非常适合实时的插入,更新与查询,并具备网站实时数据存储所需的复制及高度伸缩性
2. 缓存:由于性能很高,MongoDB 也适合作为信息基础设施的缓存层。在系统重启之后, 由 MongoDB 搭建的持久化缓存层可以避免下层的数据源过载
3. 大尺寸,低价值的数据:使用传统的关系型数据库存储一些数据时可能会比较昂贵,在此之前,很多时候程序员往往会选择传统的文件进行存储
4. 高伸缩性的场景:MongoDB 非常适合由数十或数百台服务器组成的数据库。MongoDB的路线图中已经包 对 MapReduce 引擎的内置支持
5. 用于对象及 JSON 数据的存储:MongoDB 的 BSON 数据格式非常适合文档化格式的存储及查询

## MongoDB部署与维护

### **安装MongoDB**

MongoDB维护者还事相当的人性化的给我们提供了YUM源安装就相当的方便了，当然也可以通过源码去安装！

**1、创建一个/etc/yum.repos.d/mongodb-enterprise.repo配置文件**

**内容如下**

**3.2版本**

```shell
[mongodb-enterprise]
name=MongoDB Enterprise Repository
baseurl=https://repo.mongodb.com/yum/redhat/$releasever/mongodb-enterprise/stable/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc
```

**2.6版本**

```shell
[mongodb-org-2.6]
name=MongoDB 2.6 Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
gpgcheck=0
enabled=1
```

**2、执行安装命令**

```shell
yum install -y mongodb-enterprise
```

如果你想安装特殊的指定版本可以按照如下命令操作

```shell
yum install -y mongodb-enterprise-3.2.1 mongodb-enterprise-server-3.2.1 mongodb-enterprise-shell-3.2.1 mongodb-enterprise-mongos-3.2.1 mongodb-enterprise-tools-3.2.1
```

### **卸载MongoDB**

停止服务

```shell
sudo service mongod stop
```

删除包

```bash
sudo yum erase $(rpm -qa | grep mongodb-enterprise)
```

删除库文件

```bash
sudo rm -r /var/log/mongodb
sudo rm -r /var/lib/mongo
```

### **源码安装MongoDB**

通过MongoDB官网就可以打开下载地址：https://www.mongodb.com/download-center?jmp=nav&_ga=1.114046535.1911966133.1464573239#community 从里面获取到下载地址之后直接在服务器上下载即可！

**1、下载源码**

```bash
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel62-3.2.6.tgz
```

**2、解压**

```bash
tar -zxvf mongodb-linux-x86_64-rhel62-3.2.6.tgz
```

解压后的目录：

```bash
GNU-AGPL-3.0  #GNU协议文件
MPL-2  #MPL协议文件
README #README软件提供类似于软件须知
THIRD-PARTY-NOTICES  #第三方的提文件
bin #主程序目录
```

上面的几个文件，没有具体的实际作用我们可以删除掉！但是README还是建议保留下的

并且为了方便管理我把的目录名更改为：

```bash
mv mongodb-linux-x86_64-rhel62-3.2.6 mongodb
```

**3、启动Mongodb**

进入到bin目录下，执行./mongod 看看提示

```shell
2016-05-30T10:36:33.520+0800 I STORAGE  [initandlisten] exception in initAndListen: 29 Data directory /data/db not found., terminating
```

所以在MongoDB在启动的时候默认指定的数据库目录是/data/db我们可以通过 --dbpath=目录名称 来指定数据库默认存储的路径

我们来创建别名和目录指定并启动它

```shell
./mongod --dbpath=/work/app/mongodb/data/
```

现在启动的时候是在前台启动的，如果当前终端退出后那么程序就会退出，怎么让他在后台启动呢？ --fork --logpath=日志文件和路径，在使用fork参数的时候必须指定日志文件路径

```shell
./mongod --dbpath=/work/app/mongodb/data/ --fork      
BadValue: --fork has to be used with --logpath or --syslog
try './mongod --help' for more information
```

**所以后台启动为**

```shell
./mongod --dbpath=/work/app/mongodb/data/ --fork --logpath=/work/app/mongodb/data/mongodb1.log
about to fork child process, waiting until server is ready for connections.
forked process: 16975
child process started successfully, parent exiting
```

**关闭程序，在关闭的时候必须执行dbpath**

```shell
./mongod --dbpath=/work/app/mongodb/data/ --shutdown
```

**4、改为配置文件启动方式**

现在我们可以在后台启动了，但是有个问题，我们以后再配置管理的时候，难道每次都要去手动去设置这些参数呢？如果参数错误了造成的问题呢？

4.1、单实例如何通过配置文件启动

首先创建一个目录config目录名称随意,然后在目录里创建一个配置文件

```shell
vim mongodb1.cnf
```

然后在配置文件里写入参数，把咱们平时写的参数写到配置文件中

参考命令行下的命令：

```shell
./mongod --dbpath=/work/app/mongodb/data/ --fork --logpath=/work/app/mongodb/data/mongodb1.log
```

配置文件内容如下：

```shell
vim mongodb1.cnf
#if have a parameter must be write like :  key=value
dbpath=/work/app/mongodb/data/

#if not paramenter and you want enable must be write like : fork=true
fork=true
port=27017
logpath=/work/app/mongodb/data/mongodb1.log
```

启动命令：

```shell
./bin/mongod -f config/mongodb1.cnf 
about to fork child process, waiting until server is ready for connections.
forked process: 17220
child process started successfully, parent exiting
```

关闭命令：  因为配置文件中已经有数据库的路径了，所以直接通过--shutdown就可以了

```shell
./bin/mongod -f config/mongodb1.cnf --shutdown
2016-05-30T12:10:12.295+0800 I CONTROL  [main] log file "/work/app/mongodb/data/mongodb1.log" exists; moved to "/work/app/mongodb/data/mongodb1.log.2016-05-30T04-10-12".
killing process with pid: 17220
```

**5、在服务器上通过配置文件启动多实例**

首先创建第二个实例的数据库存储目录

```shell
mkdir /work/app/mongodb/data2
```

再添加配置文件

```shell
cd /work/app/mongodb/config
vim mongodb2.cnf

#if have a parameter must be write like :  key=value
dbpath=/work/app/mongodb/data2/
#if not paramenter and you want enable must be write like : fork=true
fork=true
port=27018
logpath=/work/app/mongodb/data/mongodb2.log
```

启动实例

```shell
#第一个实例
bin/mongod -f config/mongodb1.cnf
#第二个实例
bin/mongod -f config/mongodb2.cnf
'''
以后如果还有其他实例按照上面的操作即可
'''
```

查看结果：

```shell
ps -ef |grep -i mong
root     17737     1  3 15:22 ?        00:00:00 bin/mongod -f config/mongodb1.cnf
root     17758     1  2 15:22 ?        00:00:00 bin/mongod -f config/mongodb2.cnf
```

## **MongoDB Server脚本**

```shell
#!/bin/bash
#---------------------------------------------------------------------
# Written by     : sun
# Program        : mongodb_server.sh will help to contrl :start stop restart mongodb
# Creation Date  : 2016/5/30
# Last Modified  : 2016/5/30
#---------------------------------------------------------------------

instance=$1
action=$2

case "$action" in
    start)
            /work/app/mongodb/bin/mongod -f /work/app/mongodb/config/"$instance".cnf
            ;;
    'stop')
            /work/app/mongodb/bin/mongod -f /work/app/mongodb/config/"$instance".cnf --shutdown
            ;;
    'restart')
            /work/app/mongodb/bin/mongod -f /work/app/mongodb/config/"$instance".cnf --shutdown
            /work/app/mongodb/bin/mongod -f /work/app/mongodb/config/"$instance".cnf
            ;;
    *)
            echo -e "\033[31;40myou must input like : ./mongodb_server.sh mongodbname for example :  ./mongodb_server.sh mongodb1\033[0m"
            ;;
esac
```