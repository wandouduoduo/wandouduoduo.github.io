---
title: 自制yum源离线安装开发代码时的对应版本ansible
categories:
  - 配置管理
  - Ansible
tags:
  - Ansible
copyright: true
abbrlink: fe96187b
date: 2019-08-16 16:59:17
---

## 背景

由于在工作环境中，经常遇到批量安装的服务器，不具备连接互联网的条件。同时通过简单的下载安装 ansible 源码安装，又会遇到各种奇葩问题，推荐使用自制 yum 源方法，然后使用 yum安装 ansible。不得不说，ansible很好用，ansible团队也一致在维护和更新。但是，版本之间存在比较大的差异。以前写的代码，现在直接安装新版本的ansible后可能就不能用了，你想想下：代码中用到的类没有了，模块消失了，变量不见了等等，当然可以查看新的文档更改代码适应新版本，但是代码沉淀时间久了，做迁移还是会遇到这种问题，这个问题困扰了很多Devops。如何安装写代码时的版本，如何在断网模式下安装代码对应版本的ansible, 这成为了一种刚需和痛点，本文就以安装旧版本：2.3.1为例，详细阐述。

<!--more-->



## 环境

**操作系统版本**：Centos7.2

**Python版本**：  Python2.7.5



## 操作步骤

### 旧代码机器操作

##### 安装 yumdownloader

准备一台可以连接互联网的相同版本系统的操作系统(安装环境一样)，使用yumdownloader工具下载ansible安装包以及所有依赖包。并以 root 身份安装 yumdownloader工具：

```bash
yum  -y install  yum-utils
```

##### 创建文件夹

用于存放依赖的安装包

```bash
mkdir   /root/packages
```

##### 更新国内yum源

由于默认的源里没有 ansible，需要安装国内快速稳定的yum源, 这里选择阿里源：

```bash
mv /etc/yum.repos.d/epel-7.repo /etc/yum.repos.d/epel-7.repo.bak
wget -O /etc/yum.repos.d/epel-7.repo  http://mirrors.aliyun.com/repo/epel-7.repo 
yum clean all     # 清除系统所有的yum缓存
yum makecache     # 生成yum缓存
yum update 
```



##### 下载 ansible 和 所有依赖包

```bash
#下载ansible依赖包
yumdownloader --resolve --destdir /root/packages   ansible
#下载createrepo依赖包
yumdownloader --resolve --destdir /root/packages   createrepo

# 压缩安装包
tar -Jcvf  packages.tar.xz   packages
```

### 新机器操作

将上面下载的所有 rpm 安装包打包，传输到需要批量的新服务器上，并解压到指定的文件夹里面

```bash
# 新机器解压到/mnt/下
tar -Jxvf  packages.tar.xz   -C  /mnt/

链接：https://pan.baidu.com/s/1FtZxpXk1AzZ_WcGVJFGE5w
提取码：0sf2
```



##### 首先创建 安装createrepo   

进入 /mnt/packages 目录中

```bash
rpm -ivh deltarpm-3.6-3.el7.x86_64.rpm
rpm -ivh python-deltarpm-3.6-3.el7.x86_64.rpm
rpm -ivh createrepo-0.9.9-28.el7.noarch.rpm
```

##### 然后使用createrepo生成符合要求的yum仓库

```bash
# cd  /mnt
# createrepo /packages

Spawning worker 0 with 25 pkgs
Workers Finished
Saving Primary metadata
Saving file lists metadata
Saving other metadata
Generating sqlite DBs
Sqlite DBs complete
```



##### 配置本地 yum源

把当前存在 yum 做备份，并移走别的目录

```bash
# vim  /etc/yum.repos.d/ansible.repo
[ansibel]
name=sun local ansible
baseurl=file:///mnt/packages
enabled=1
gpgcheck=0

保存退出，然后执行：
yum clean all
yum makecache
```



##### 使用 yum安装 ansible

```bash
yum -y install ansible
```



##### 验证安装成功：

```bash
# ansible --version
ansible 2.3.1.0
  config file = /etc/ansible/ansible.cfg
  configured module search path = Default w/o overrides
  python version = 2.7.5 (default, Jun 20 2019, 20:27:34) [GCC 4.8.5 20150623 (Red Hat 4.8.5-36)]
```

参考：https://www.jianshu.com/p/9a34d458de29

