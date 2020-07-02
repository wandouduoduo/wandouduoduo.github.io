---
title: Centos7安装gitlab详细教程
categories:
  - 运维技术
  - 服务部署
tags:
  - Git
copyright: true
abbrlink: adf03e2d
date: 2020-06-30 18:09:38
---

## 目的

博客中有docker直接启动gitlab服务，这里再补充下直接裸机部署gitlab服务的教程。



<!--more-->



## 环境

操作系统：centos7.5

服务端：192.168.0.74

客户端：192.168.0.73



## 安装

#### 服务端终端操作

```bash
#打开系统防火墙HTTP和SSH访问
yum install curl policycoreutils openssh-server openssh-clients -y
systemctl enable sshd
systemctl start sshd
yum install postfix -y
systemctl enable postfix
systemctl start postfix
firewall-cmd --permanent --add-service=http
systemctl reload firewalld 

#添加GitLab镜像源并安装
curl -sS http://packages.gitlab.com.cn/install/gitlab-ce/script.rpm.sh | sudo bash

#这是官方的yum源，安装速度会比较慢，可以使用国内源，修改如下文件即可：
cat>>/etc/yum.repos.d/gitlab_gitlab-ce.repo<<EOF
[gitlab-ce]
name=gitlab-ce
baseurl=http://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7
repo_gpgcheck=0
gpgcheck=0
enabled=1
gpgkey=https://packages.gitlab.com/gpg.key
EOF

#安装
yum install gitlab-ce -y

#修改配置，指定服务器ip和自定义端口
vim /etc/gitlab/gitlab.rb

external_url 'http://192.168.0.94:8081'       #本地ip+端口
#注意这里设置的端口不能被占用，默认是8080端口，如果8080已经使用，请自定义其它端口，并在防火墙设置开放相对应得端口

# 重置GitLab
gitlab-ctl reconfigure   #需要很长时间不要按ctrl+c  每次修改配置文件都需要重置，否则不生效

#出现如下结果表明重置成功
Running handlers:
Running handlers complete
Chef Client finished, 454/655 resources updated in 04 minutes 29 seconds
gitlab Reconfigured!

# 启动GitLab
gitlab-ctl start

ok: run: gitlab-git-http-server: (pid 3922) 1s
ok: run: logrotate: (pid 3929) 0s
ok: run: nginx: (pid 3936) 1s
ok: run: postgresql: (pid 3941) 0s
ok: run: redis: (pid 3950) 0s
ok: run: sidekiq: (pid 3955) 0s
ok: run: unicorn: (pid 3961) 1s
#提示“ok: run:”表示启动成功

# 停止gilab
gitlab-ctl stop

# 重启
gitlab-ctl restart
```

#### 服务端页面操作

```bash
#如果没有域名，直接输入服务器ip和指定端口进行访问
#第一次访问GitLab，系统会重定向页面到重定向到重置密码页面，你需要输入初始化管理员账号的密码，管理员的用户名为root，初始密码为5iveL!fe。重置密码后，新密码即为刚输入的密码。

http://192.168.0.94:8081

#初始账户: root 密码: 5iveL!fe
#第一次登录需要修改密码
#修改密码为：
jenkins@123

#重新登录
root/jenkins@123

# 创建项目
#创建一个hello项目 --> 点击小扳手（管理区域）--> 新建项目

Project name为项目的名称
Import project from从其他代码仓库导入代码
Project description项目说明
Visibility Level项目等级
private只有你自己跟你指定的人能看
internal只有拥有gitlab账号的用户可以查看与拉取
public该项目能被所有人访问到并clone
```

#### 客户端操作

```bash
#安装git
yum install -y git

#生成ssh密钥
ssh-keygen -t rsa -f /root/.ssh/id_rsa -P ""

#添加ssh-key公钥到gitlab， 需要连接gitlab服务器，就需要把他的公钥添加到gitlab服务器上
#查看
cat ~/.ssh/id_rsa.pub

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCxiS/XYe2x+iwhU6PuiV8XTmNgQ9w3FMgC4JuPkyHwIhHxh+1M/Evj7AqGJIURcrl1CHqJKng8d/M8WT+NoqwlA524hKpjv4RgEW2dl1kLfQLVVJmoB9NOvr5+cdmQ1V8xuhhxtcLw7JhigXu7HNCEs6bJ+MVwD83oc9jV7HVB3mgmZrk2+Ntxz8cr/W9MoLmkqEQJ3JYmsXmJsofcMPOQJNpmIScAu7kWJ4tIJAN5SuhNjQTw+v5HgLJT/LTdf/0DUCP55ulsDWP03ilIsEMT1FX1mz2tkQsopim2Z/Tqtk96OTNYB5svNb+nJXkRUskbQ+pYjU3hr0kxkAr/NEzX root@test3

#页面登录gitlab，在右上角设置中找到SSH密钥
#将刚才生成的公钥内容复制到密钥中，标题名字随意

#克隆项目
mkdir /root/test/
cd /root/test/
git clone git@192.168.0.94:root/hello.git
#这里有个警告，因为刚才创建的版本库是空的，所以这里提醒，克隆了一个空库

#推送代码
#创建一个文件
cd /root/test/hello/
touch read.txt
echo "Hello world" >> read.txt 

#将文件添加到仓库
git add read.txt

#配置用户名和邮箱
git config --global user.email "wandouduoduo@163.com"
git config --global user.name "wandouduoduo"

#提交文件到仓库
git commit -m "wandouduoduo"    
#2nd Commit是本次提交的说明

#创建tag版本
git tag 1.0.2

#查看git版本号
git tag

#推送
git push origin master

#在gitlab上看到，已经推送成功了
```




## 汉化

```bash
#创建目录
mkdir /home/local/gitlab
cd /home/local/gitlab

#安装git
yum install -y git

#下载最新的汉化包：
git clone https://gitlab.com/xhang/gitlab.git
#如果是要下载老版本的汉化包，需要加上老版本的分支。以10.0.2为例，可以运行如下语句：
git clone https://gitlab.com/xhang/gitlab.git -b v10.0.2-zh

#停止GitLab并执行如下语句：
gitlab-ctl stop
\cp -rf /home/local/gitlab/* /opt/gitlab/embedded/service/gitlab-rails/ 

#配置和重启
sudo gitlab-ctl reconfigure
sudo gitlab-ctl restart 
```



## 常用命令

```bash
#启动所有服务
gitlab-ctl start

#启动单独一个服务
gitlab-ctl start nginx

#查看日志，查看所有日志
gitlab-ctl tail

#查看具体一个日志,类似tail -f
gitlab-ctl tail nginx
```

