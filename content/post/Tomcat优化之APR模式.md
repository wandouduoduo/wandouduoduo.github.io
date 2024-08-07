---
title: Tomcat优化之APR模式
categories:
  - 应用服务
  - Tomcat
tags:
  - Tomcat
copyright: true
abbrlink: 98d7cf0b
date: 2019-12-18 17:22:37
---

## APR模式介绍

Tomcat可以使用APR来提供超强的可伸缩性和性能，更好地集成本地服务器技术。APR(Apache Portable Runtime)是一个高可移植库，它是Apache HTTP Server2.x的核心。

APR有很多用途，包括访问高级IO功能(例如sendfile,epoll和OpenSSL)，OS级别功能(随机数生成，系统状态等等)，本地进程管理(共享内存，NT管道和UNIXsockets)。这些功能可以使Tomcat作为一个通常的前台WEB服务器，能更好地和其它本地web技术集成，总体上让Java更有效率作为一个高性能web服务器平台而不是简单作为后台容器。

在产品环境中，特别是直接使用Tomcat做WEB服务器的时候，应该使用Tomcat Native来提高其性能。就是如何  在Tomcat中使用JNI的方式来读取文件以及进行网络传输。这个东西可以大大提升Tomcat对静态文件的处理性能，同时如果你使用了HTTPS方式  传输的话，也可以提升SSL的处理性能。



<!--more-->

## APR模式配置

### 获取APR组件依赖包

首先需要下载APR的三个依赖包 [官方下载地址](http://apr.apache.org/download.cgi) 

![](1.png)

然后把包上传到服务器。

### 编译安装各个组件

##### 安装相关环境包

```bash
yum -y install cmake gcc expat-devel
```

##### 安装apr

```
tar -xzvf apr-1.7.0.tar.gz
cd apr-1.7.0
./configure --prefix=/usr/local/apr
make && make install
```

##### 安装apr-iconv

```bash
tar -xzvf apr-iconv-1.2.2.tar.gz
cd apr-iconv-1.2.2
./configure --prefix=/usr/local/apr-iconv --with-apr=/usr/local/apr
make && make install
```

##### 安装apr-util

```bash
tar -xzvf apr-util-1.6.1.tar.gz
cd apr-util-1.6.1
./configure --prefix=/usr/local/apr-util --with-apr=/usr/local/apr --with-apr-iconv=/usr/local/apr-iconv/bin/apriconv
make && make install
```

##### 安装Tomcat-native

两种方式获取安装包：1，[从官方网站下载](http://tomcat.apache.org/download-native.cgi)；2，Tomcat中就包含该安装包，目录在: tomcat_home/bin/下。本教程采用第二种。

```
cd tomcat_home/bin
tar -zxvf tomcat-native.tar.gz
cd tomcat-native-1.2.23-src/native/
./configure  --with-apr=/usr/local/apr 
make && make install
```

如有报错，openssl版本过低，需要大于1.0.2版本的，如下图

![](2.png)

在[openssl官方网站](https://www.openssl.org/source/)下载。

```bash
wget https://www.openssl.org/source/openssl-1.0.2t.tar.gz
tar xzvf openssl-1.0.2t.tar.gz
cd openssl-1.0.2t
./config --prefix=/usr/local/openssl  –fPIC #加上-fPIC参数,否则编译native的时候会报错
./config -t
make && make install
```

安装成功openssl后再次编译还是报错，说明没找到，可以添加绝对路径编译

```bash
./configure  --with-apr=/usr/local/apr --with-ssl=/usr/local/openssl
make && make install
```

##### 设置环境变量

```bash
vim /etc/profile

export LD_LIBRARY_PATH=/usr/local/apr/lib ##添加apr path

source /etc/profile
```

### 修改tomcat配置文件

##### 修改protocol值

Tomcat默认是HTTP/1.1，如果运行apr模式需要把protocol值修改成apr模式：**org.apache.coyote.http11.Http11AprProtocol**

```bash
# vim server.xml

<Connector port="8080" protocol="org.apache.coyote.http11.Http11AprProtocol"
```

##### 修改SSLEngine

```bash
# vim server.xml

<Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="off" />
```

## 启动tomcat验证

![](3.png)

