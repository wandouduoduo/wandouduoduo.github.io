---
title: Centos7文件共享服务Samba的部署
categories:
  - 运维技术
  - 服务部署
tags:
  - Samba
copyright: true
abbrlink: bf19f399
date: 2020-09-15 19:15:38
---

搭建Samba服务器是为了实现Linux共享目录之后，在Windows可以直接访问该共享目录。

<!--more-->



## 教程

### **关闭selinux服务**

*该服务不关闭会导致Windows没有访问权限*

#### **临时关闭**

```bash
setenforce 0（只对当前有效，重启后，该服务又会重新启动。）
```

#### **永久关闭**

打开selinux的配置文件：

```bash
vi /etc/sysconfig/selinux
```

将SELINUX=enforcing修改为SELINUX=disabled



### 关闭防火墙

```bash
#关闭防火墙
systemctl stop firewalld
#关闭防火墙开机启动
systemctl disable firewalld
```



### 查看是已安装samba包

```bash
rpm -qa | grep samba
------------------------------------
samba-common-4.8.3-4.el7.noarch
samba-client-libs-4.8.3-4.el7.x86_64
samba-client-4.8.3-4.el7.x86_64
samba-common-libs-4.8.3-4.el7.x86_64
------------------------------------
```

这里列出所有已安装的samba包，但是现在samba服务还未安装。



### **安装Samba服务**

```bash
yum install -y samba
```

使用yum安装是因为安装时会自动检测需要的依赖并安装。



### Samba配置

至此，我们已经将Samba安装完毕，现在进行Samba的配置。

#### **创建共享目录**

在home目录新建共享目录

```bash
mkdir /home/share
```

赋予目录权限

```bash
chmod 777 /home/share
```

#### 添加samba服务器用户

首先创建一个普通用户

```
adduser sun
passwd sun
```

将该用户添加到samba服务列表中

```
smbpasswd –a sun
------------------------
New SMB password:
Retype new SMB password:
Added user fenxiang.
------------------------
出现Added user *表示添加成功
```

#### 修改Samba配置文件

首先备份Samba配置文件：

```bash
cp /etc/samba/smb.conf /etc/samba/smb.conf.bak 
```

打开配置文件：

```bash
vi /etc/samba/smb.conf

做如下修改：
security = user
#这里是设置samba的共享级别，share表示共享级访问，服务器不对客户机进行身份认证，user表示用户级访问，被访问的samba服务器要对客户机进行身份验证
```

在配置文件最后添加以下内容：

```bash
[share]
comment = my share
#对该共享资源的说明
path = /home/share
#共享资源的路径
valid user = sun
#设置允许访问共享的用户或组的列表
writable = yes
#指定共享的路径是否可写
browseable = yes
#是否可以浏览共享目录
create mode = 0777
#指定客户机在共享目录中创建文件的默认权限
directory mode = 0777
#指定客户机共享目录中创建文件目录的默认权限
```

保存退出

#### **启动samba服务**

```bash
#开启服务
systemctl start smb 
systemctl start nmb
#将服务加入到开机启动中
systemctl enable smb
systemctl enable nmb
```

#### **Windows访问**

![](1.png)

