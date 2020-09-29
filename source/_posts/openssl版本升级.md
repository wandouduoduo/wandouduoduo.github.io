---
title: openssl版本升级
categories:
  - 操作系统
tags:
  - Openssl
copyright: true
abbrlink: 41a25a14
date: 2020-09-14 10:58:59
---

**OpenSSL**是一个[开放源代码](https://baike.baidu.com/item/开放源代码)的[软件](https://baike.baidu.com/item/软件)[库](https://baike.baidu.com/item/库)包，应用程序可以使用这个包来进行安全通信，避免窃听，同时确认另一端连接者的身份。这个包广泛被应用在互联网的网页服务器上。


<!--more-->



## 升级教程

### 查看openssl版本

```bash
openssl version

OpenSSL 1.0.1e-fips 11 Feb 2013
```



### 下载指定版本的openssl软件

在[官网](https://www.openssl.org/source/)下载最新长期支持版本，教程文档编写时，最新长期支持版本为1.1.1

```bash
wget https://www.openssl.org/source/openssl-1.1.1g.tar.gz
```



### 编译安装

```bash
tar -xf openssl-1.1.1g.tar.gz
cd openssl-1.1.1g
./config shared zlib
make && make install
```



### 配置

```bash
mv /usr/bin/openssl /usr/bin/openssl.bak
mv /usr/include/openssl /usr/include/openssl.bak
find / -name openssl
ln -s /usr/local/bin/openssl /usr/bin/openssl
ln -s /usr/local/include/openssl /usr/include/openssl
echo "/usr/local/lib64/" >> /etc/ld.so.conf
ldconfig 
openssl version -a
```



### 验证

```bash
openssl version 

OpenSSL 1.1.1g  14 Sep 2020
```

