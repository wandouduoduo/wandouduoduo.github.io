---
title: Zimbra邮件服务器证书部署教程
categories:
  - 应用服务
tags:
  - Mail
copyright: true
abbrlink: b778abf7
date: 2020-12-21 13:50:05
---

zimbra邮件服务搭建完成后，为了安全和用户体验，通常用域名解析和证书配置。本文详细介绍zimbra服务的证书配置，当然证书过期替换也是一样的操作方法。



<!--more-->

此文档采用命令行的形式配置证书。

## **获取SSL证书**

从沃通申请SSL证书后，将会下载一个以域名命名的.zip压缩包，解压该压缩包，会得到for Apache.zip、for Nginx.zip、for IIS.zip、for other server.zip，Zimbra将会用到for other server.zip里面的四个.crt文件(test.wosign.com为测试证书域名)以及自主生成的私钥.key文件（申请证书过程创建CSR时生成）。
![Zimbra邮件服务器证书部署教程](1.png)



## 证书合成以及重命名**

### Windows环境：

在windows环境下，可以用记事本或写字板打开.crt文件，将issuer.crt、cross.crt、root.crt按顺序合成后保存，并将合成后的.crt文件重命名为commercial_ca.crt。
将自主生成的.key文件重命名为commercial.key。
将test.wosign.com.crt重命名为commercial.crt。

### Linux环境:

在Linux服务器上，用命令合成证书文件，具体命令如下：

```shell
cat issuer.crt cross.crt root.crt > commercial_ca.crt
Mv test.wosign.com.crt commercial.crt
Mv yourdomain.com.key commercial.key
```



## 证书安装**

### 上传

将重命名后的三个文件上传至/opt/zimbra/ssl/zimbra/commercial目录。

### 验证

用命令验证证书文件是否匹配，命令如下：

```bash
/opt/zimbra/bin/zmcertmgr verifycrt comm /opt/zimbra/ssl/zimbra/commercial/commercial.key /opt/zimbra/ssl/zimbra/commercial/commercial.crt /opt/zimbra/ssl/zimbra/commercial/commercial_ca.crt
```

当出现如下提示Valid Certificate:/opt/zimbra/ssl/zimbra/commercial/commercial.crt: OK，则可继续安装，如果报错，请根据报错查看具体原因。

![](2.png)

### 安装

命令如下:

```bash
/opt/zimbra/bin/zmcertmgr deploycrt comm /opt/zimbra/ssl/zimbra/commercial/commercial.crt /opt/zimbra/ssl/zimbra/commercial/commercial_ca.crt
```



## 重启Zimbra

```
zmcontrol restart
```



## **测试HTTPS访问**

打开浏览器，输入https://wandouduoduo.github.io（你自己的域名）

如浏览器地址栏显示加密小锁，则表示证书配置成功。若显示无法连接，请确保防火墙或安全组等策略有放行443端口（SSL配置端口）。



## 证书备份**

请将下载的.zip压缩包和自主生成的私钥.key文件备份。

