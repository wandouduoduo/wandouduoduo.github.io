---
title: 'MongoDB[二]:逻辑与物理存储结构'
categories:
  - 数据库
  - NoSQL
  - MongoDB
tags:
  - MongoDB
copyright: true
abbrlink: ebd79db6
date: 2019-07-15 18:11:59
---

## 目的

对MongoDB中操作逻辑和存储结构进行详细介绍。

<!--more-->

## 基本的操作

#### **常用的命令和基础知识**

1、进入MongoDB shell

首先我们进入到MongoDB所在目录执行

```
cd /work/app/mongodb/bin/
#启动
./mongo
```

为了方便执行我们可以,这样直接在终端输入mongo调用就可以了

```
alias mongo='/work/app/mongodb/bin/mongo'
```

如果想永久生效,把他加入到/etc/profile中即可
2、查看数据库命令

```
#可以通过show dbs;  或者 和Mysql一样执行show databases;

> show dbs;
local  0.000GB
> show databases;
local  0.000GB
> 
```

3、打开数据库

和关系型数据库中打开数据库是一样的

```
#使用数据库使用use dbs即可，进入后可以使用showtables;去查看数据库中的表
> use dbs;
switched to db dbs
> show tables;
> 
```

**从上面可以看出，一个MongoDB实例是由一个或多个数据库组成的**

但是这里需要注意：

在Mysql中的表中，我们给里面的每行叫做‘记录’，但是在MongoDB中我们给每行数据叫做**‘文档’**

所以在MongoDB中我们给每个表叫做**‘集合’**。集合中就是存储了文档的集合。

查看当前数据库中的集合命令为：

```
show collections;
```

**所以：show tables; 和 show databases;命令只是兼容关系型数据库而已，因此他们之间的层次关系就明白了，NICE~**

**总结：**

1、MongoDB逻辑概念总结

文档：文档(Document)是MongodDB中的核心概念，他是MongoDB逻辑存储的最小基本单元

集合：多个文档组成的集合

数据库：多个集合组成的数据库

| MongoDb           | 关系型数据库Mysql |
| ----------------- | ----------------- |
| 文档(document)    | 行(row)           |
| 集合(collections) | 表(table)         |
| 数据库(databases) | 数据库(databases) |

2、MongoDB 物理存储总结

2.1 命名空间文件：命名空间(.ns结尾文件) 它存储了分配和正在使用的磁盘空间

2.2 数据库文件：以(0,1,2,3...)结尾的，并且后面的文件大小是前面一个文件大小的2倍！

为什么MongodDB物理存储使用这种方式设计呢？好处是什么？：当一方面如果数据库很小的时候，不至于数据库小而浪费存储空间，另外一方面如果数据库增长比较快，通过预分配的方式，是上一个文件的两倍的办法，来避免数据的剧增造成分配文件造成的性能下降，来预分配空间，以空间的办法来换取性能的提升。

2.3 日志文件

```
    系统日志文件logpath
    oplog复制操作日志文件 #只有在主从复制开启之后才会出现
    慢查询日志  #需要开启后才可以
```

慢查询日志通过help就可以看到如何启用

```
  #这两个参数需要组合使用 --slowms 大于多少秒才算慢查询 
  --slowms arg (=100)                   value of slow for profile and console 
                                        log
  #默认是关闭的1为慢查询，all为所有的都日志
  --profile arg                         0=off 1=slow, 2=all
```

我们可以通过配置文件进行设置：

```
profile=1
#生产中这里应该大于200毫秒，并且这个必须根据生产中实际的需求来定义的
slowms=1
```

**MongoDB数据类型**

MongodDB的数据类型是：BSON的数据类型

**BSON**：是Binary JSON是二进制的格式，能将MongoDB的所有文档表示为字节字符串！

**JSON：**是一种轻量级的数据交换格式。它基于JavaScript的一个子集！

**一、在初识MongoDB的时候了解“帮助”**

**1、最高的帮助**

在MongoDB shell中输入help

```
> help
        db.help()                    help on db methods
        db.mycoll.help()             help on collection methods
        sh.help()                    sharding helpers
        rs.help()                    replica set helpers
        help admin                   administrative help
        help connect                 connecting to a db help
        help keys                    key shortcuts
        help misc                    misc things to know
        help mr                      mapreduce

        show dbs                     show database names
        show collections             show collections in current database
        show users                   show users in current database
        show profile                 show most recent system.profile entries with time >= 1ms
        show logs                    show the accessible logger names
        show log [name]              prints out the last segment of log in memory, 'global' is default
        use <db_name>                set current database
        db.foo.find()                list objects in collection foo
        db.foo.find( { a : 1 } )     list objects in foo where a == 1
        it                           result of the last line evaluated; use to further iterate
        DBQuery.shellBatchSize = x   set default number of items to display on shell
        exit                         quit the mongo shell
> 
```

**2、打开数据库在数据库中查看帮助**

进入到数据库中后我们可以使用db.help()查看数据库级别的帮助

```
db.help()  #查看数据库级别的帮助,里面会显示数据库级别的帮助
```

**3、查看集合中的帮助**

```
> show dbs;
local  0.000GB
tim    0.000GB
> show collections;
users
> db.users.help()
```

#### **创建数据库**

查看当前的数据库

```
> show dbs;
local  0.000GB
tim    0.000GB
```

可以看到当前只有tim和系统自带的local数据库，我们通过use 去打开一个数据库！shuai并且查看数据库

```
> use shuai;
switched to db shuai
> show dbs;
local  0.000GB
tim    0.000GB
> 
```

发现数据库并没有添加，当我们在给数据库中的集合插入一条文档的时候就会：**自动创建一条文档合、一个集合、一个数据库。**

```
> db.users.insert({"uid":1})
WriteResult({ "nInserted" : 1 })
> 
#这个时候看下是否添加了数据库和集合！！！
> show dbs;
local  0.000GB
shuai  0.000GB
tim    0.000GB

#当前数据库"shuai"下的集合
> show collections;
users
> 
```

**2、插入一条数据**

```
> db.users.insert({"uid":2,"uname":"luotianshuai","isvip":true,"sex":null,"favorite":["apple","banana",1,2,3,4,5],"regtime":new Date()})
WriteResult({ "nInserted" : 1 })
> db.users.find()
{ "_id" : ObjectId("5754f1ea4b7f62c4992c4ef4"), "uid" : 1 }
{ "_id" : ObjectId("5754f2c84b7f62c4992c4ef5"), "uid" : 2, "uname" : "luotianshuai", "isvip" : true, "sex" : null, "favorite" : [ "apple", "banana", 1, 2, 3, 4, 5 ], "regtime" : ISODate("2016-06-06T03:49:28.946Z") }
```

注：这里的数据类型，列表、字典，这里的new Date()是MongoDB就类似Django Model的时间选项类似于：date = models.DateTimeField(auto_now=True)

**3、查询数据**

查询一条数据

```
> db.users.findOne({"uid":2})
{
        "_id" : ObjectId("5754f2c84b7f62c4992c4ef5"),
        "uid" : 2,
        "uname" : "luotianshuai",
        "isvip" : true,
        "sex" : null,
        "favorite" : [
                "apple",
                "banana",
                1,
                2,
                3,
                4,
                5
        ],
        "regtime" : ISODate("2016-06-06T03:49:28.946Z")
}
> 
```

并且我们可以吧取出来的数据保存在一个变量中，并且通过变量去调用其值

```
> a = db.users.findOne({"uid":2})
{
        "_id" : ObjectId("5754f2c84b7f62c4992c4ef5"),
        "uid" : 2,
        "uname" : "luotianshuai",
        "isvip" : true,
        "sex" : null,
        "favorite" : [
                "apple",
                "banana",
                1,
                2,
                3,
                4,
                5
        ],
        "regtime" : ISODate("2016-06-06T03:49:28.946Z")
}

#并且可以通过变量去调用里面的值
> a.
a._id                    a.favorite               a.isvip                  a.regtime                a.toLocaleString(        a.uid                    a.valueOf(
a.constructor            a.hasOwnProperty(        a.propertyIsEnumerable(  a.sex                    a.toString(              a.uname
> a.
```

####  **MongoDB中的数据类型和Mysql数据类型对比**

```
> db.users.insert({"uid":3,"salary":312402039840981098098309,"a":1.2423412314223423413})
WriteResult({ "nInserted" : 1 })

> b = db.users.findOne({"uid":3})
{
        "_id" : ObjectId("5754f7214b7f62c4992c4ef6"),
        "uid" : 3,
        "salary" : 3.124020398409811e+23,
        "a" : 1.2423412314223423
}
```

**1、MongoDB中的数字类型和Mysql中的数字类型对比**

查看MongoDB中的数字类型他们都是**numbe**r类型的

```
> typeof(b.uid)
number
> typeof(b.salary)
number
> typeof(b.a)
number
> 
```

可以看出在MongoDB中所有的数字类型都是数值类型的，我们比较下Mysql中的数字类型！

在Mysql中类似“uid":3 这个3应该属于普通的整数，或者是短整形

类似薪水：salary 应该是长整型

类似a应该是双精度浮点型

**数字：**

**在Mysql中对数字类型分的非常详细，有短整形、长整型，浮点数分为单精度和双精度浮点型，而在MongoDB都是64位的浮点数！这样的好处就是很简单，他不需要区分数字类型，就是number类型，简单、简洁。容易理解和在处理的时候也方便。**

**字符串：**

在Mysql中分为定长、变长字符串，无论是定长字符串或者变长字符串，都要对长度事先定义！但是MongoDB中无需事先定义，对长度没有并且的定义并且他甚至可以存储一篇文章！也表现的简单、简洁、

**布尔型：**

布尔值只有：真、假分别用：True  False  表示

**null值：**

```
> db.users.find({"sex":null})
{ "_id" : ObjectId("5754f1ea4b7f62c4992c4ef4"), "uid" : 1 }
{ "_id" : ObjectId("5754f2c84b7f62c4992c4ef5"), "uid" : 2, "uname" : "luotianshuai", "isvip" : true, "sex" : null, "favorite" : [ "apple", "banana", 1, 2, 3, 4, 5 ], "regtime" : ISODate("2016-06-06T03:49:28.946Z") }
{ "_id" : ObjectId("5754f7214b7f62c4992c4ef6"), "uid" : 3, "salary" : 3.124020398409811e+23, "a" : 1.2423412314223423 }
> 
```

咱们查询以”sex“ 为null条件，但是查询出了3条结果可以得出：

在MongoDB中，1、**null代表着值为null**   2、**者字段不存在。**

那么怎么把字段存在并且为null值得文档查找出来呢？

```
> db.users.find({"sex":null,"sex":{"$exists":true}})
{ "_id" : ObjectId("5754f2c84b7f62c4992c4ef5"), "uid" : 2, "uname" : "luotianshuai", "isvip" : true, "sex" : null, "favorite" : [ "apple", "banana", 1, 2, 3, 4, 5 ], "regtime" : ISODate("2016-06-06T03:49:28.946Z") }
> 
#我们查找sex为null的并且给其加一个条件    值存在{"$exists":true}
```

**数组：**

一组数据集合

**对象类型：**

比如日期类型，日期类型是通过对象类型产生的，但是处理日期比较麻烦！这个也是MongoDB的问题表现力不足

 

**BSON的特点：**优点：简单、简洁、容易理解、解析方便、记忆

缺点：表现力不足比如日期格式（处理起来就比较麻烦）

#### **命名规则**

**1、文档的键名命名几乎所有utf8字符串，只有以下少数例外**

1. $开头
2. \0   空字符串
3. _下划线开头，可以用但是不建议使用，凡是系统生成的都是以_开头命名的，所以在实际生产中我们不使用_开头的！

**2、集合的命名几乎所有的utf8字符串，只有以下少数例外**

1. $开头
2. \0   空字符串
3. system.开头
4. ”“空字符串

 **3、数据库的命名几乎所有的utf8字符串，只有以下少数例外**

1. $开头
2. \0   空字符串
3. system.开头
4. ”“空字符串
5. /
6. \

并且这里需要注意：**数据库名是不区分大小写的**，如果你有一个shuai的数据库，你在创建一个SHUAI的数据库插入数据的时候就会报错，我们一般创建数据库的时候都把MongoDB的数据库名为小写。