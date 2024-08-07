---
title: centos7.x添加开机启动
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 5b4c4c27
date: 2020-07-22 15:36:34
---

## 背景

搭建环境、部署服务这是运维工作中很常见的工作，也是比较频繁的。那么如果搭建环境或部署服务的这台服务器因为各种突发原因（如停电，磁盘异常进行替换或资源扩容等等）重启了。这个服务很重要的，但是服务器重启后肯定服务没有自己启动，而又在一年前部署的，这时就需要我们去查当初的部署文档，手动启动服务。那么有没有方法让服务器启动时自动启动服务呢？本文就介绍这个添加开机启动。



<!--more-->

## 添加开机自启服务

在CentOS 7中，我们通过yum安装完服务后，添加开机自启服务也是非常方便的，只需要两条命令(以Jenkins为例)：

```bash
#设置jenkins服务为开机自启动服务
systemctl enable jenkins.service 

#启动jenkins服务
sysstemctl start jenkins.service 
```



## 添加开机自启脚本

在centos7中增加自定义脚本开机自启有两种方法，以脚本autostart.sh为例：

```bash
#!/bin/bash
#description:开机自启脚本
/usr/local/tomcat/bin/startup.sh  #启动tomcat
```

### 方法一

```bash
# 赋予脚本可执行权限（/opt/script/autostart.sh是你的脚本路径）
chmod +x /opt/script/autostart.sh

# 打开/etc/rc.d/rc/local文件，在末尾增加如下内容
/opt/script/autostart.sh

# 在centos7中，/etc/rc.d/rc.local的权限被降低了，所以需要执行如下命令赋予其可执行权限
chmod +x /etc/rc.d/rc.local
```

### 方法二

```bash
# 将脚本移动到/etc/rc.d/init.d目录下
mv  /opt/script/autostart.sh /etc/rc.d/init.d

# 增加脚本的可执行权限
chmod +x  /etc/rc.d/init.d/autostart.sh

# 添加脚本到开机自动启动项目中
cd /etc/rc.d/init.d
chkconfig --add autostart.sh
chkconfig autostart.sh on
```



