---
title: centos7安装redis教程
categories:
  - 运维技术
  - 服务部署
tags:
  - Redis
copyright: true
abbrlink: 39f481b5
date: 2019-11-02 10:54:48
---

## **安装**

```bash
#通过wget方式直接在linux上下载Redis
wget http://download.redis.io/releases/redis-4.0.9.tar.gz

#解压下载的redis-2.6.17.tar.gz 文件
tar xzf redis-4.0.9.tar.gz

#进入解压后的文件夹
cd  redis-4.0.9

#编译安装
make
```

<!--more-->

## 运行

- 通过执行src文件夹下的redis-server，可以启动redis服务：

  ```bash
  ./src/redis-server
  ```

- 通过执行src文件夹下的redis-cli， 可以访问redis服务。

  ```bash
  ./src/redis-cli
  redis> set foo bar
  Ok
  redis> get foo
  "bar"
  ```

## **排错**

CentOS5.7默认没有安装gcc，这会导致我们无法make成功。使用yum安装：

```bash
yum -y install gcc
```

make时报如下错误：

```basj
zmalloc.h:50:31: error: jemalloc/jemalloc.h: No such file or directory
zmalloc.h:55:2: error: #error "Newer version of jemalloc required"
make[1]: *** [adlist.o] Error 1
make[1]: Leaving directory `/data0/src/redis-2.6.2/src'
make: *** [all] Error 2
```

原因是jemalloc重载了Linux下的ANSI C的malloc和free函数。解决办法：make时添加参数。

```bash
make MALLOC=libc
```

make之后，会出现一句提示

```bash
Hint: To run 'make test' is a good idea ;) 
```

但是不测试，通常是可以使用的。若我们运行make test ，会有如下提示

```bash
[devnote@devnote src]$ make test
You need tcl 8.5 or newer in order to run the Redis test
make: ***[test] Error_1
```

解决办法是用yum安装tcl8.5（或去tcl的官方网站http://www.tcl.tk/下载8.5版本，并参考官网介绍进行安装）

```bash
yum install tcl
```