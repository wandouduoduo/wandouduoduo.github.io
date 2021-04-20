---
title: Docker快速安装jumperserver
categories:
  - 容器技术
tags:
  - Docker
  - Jumperserver
copyright: true
abbrlink: 4c63da33
date: 2021-04-09 11:57:50
---

Jumpserver堡垒机的作用和好处这里就不再赘述，本文教你快速用docker容器安装jumperserver，让你快速体验。本教程是在单机上操作，处于以后扩展的需求，强烈建议在多台服务器上搭建。

<!--more-->

## 安装

### 下载

```bash
cd /opt
yum -y install wget
wget https://github.com/jumpserver/installer/releases/download/v2.8.2/jumpserver-installer-v2.8.2.tar.gz
tar -xf jumpserver-installer-v2.8.2.tar.gz
cd jumpserver-installer-v2.8.2
```

### 配置

```bash
vim config-example.txt
所有配置都在此文件中，按照实际情况填写信息即可。
```



### 部署

```bash
./jmsctl.sh install

       ██╗██╗   ██╗███╗   ███╗██████╗ ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗
       ██║██║   ██║████╗ ████║██╔══██╗██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
       ██║██║   ██║██╔████╔██║██████╔╝███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
  ██   ██║██║   ██║██║╚██╔╝██║██╔═══╝ ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
  ╚█████╔╝╚██████╔╝██║ ╚═╝ ██║██║     ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
   ╚════╝  ╚═════╝ ╚═╝    ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝

                                                             Version:  v2.8.2


>>> 安装配置 Docker
1. 安装 Docker
开始下载 Docker 程序 ...
完成
开始下载 Docker Compose 程序 ...
完成

2. 配置 Docker
是否需要自定义 Docker 数据目录, 默认将使用 /var/lib/docker 目录? (y/n)  (默认为 n): n
完成

3. 启动 Docker
Docker 版本发生改变 或 Docker 配置文件发生变化，是否要重启? (y/n)  (默认为 y): y
完成

>>> 加载 Docker 镜像
Docker: Pulling from jumpserver/core:v2.8.2         [ OK ]
Docker: Pulling from jumpserver/koko:v2.8.2         [ OK ]
Docker: Pulling from jumpserver/luna:v2.8.2         [ OK ]
Docker: Pulling from jumpserver/nginx:alpine2       [ OK ]
Docker: Pulling from jumpserver/redis:6-alpine      [ OK ]
Docker: Pulling from jumpserver/lina:v2.8.2         [ OK ]
Docker: Pulling from jumpserver/mysql:5             [ OK ]
Docker: Pulling from jumpserver/guacamole:v2.8.2    [ OK ]

>>> 安装配置 JumpServer
1. 检查配置文件
配置文件位置: /opt/jumpserver/config
/opt/jumpserver/config/config.txt                 [ √ ]
/opt/jumpserver/config/nginx/lb_http_server.conf  [ √ ]
/opt/jumpserver/config/nginx/lb_ssh_server.conf   [ √ ]
/opt/jumpserver/config/core/config.yml   [ √ ]
/opt/jumpserver/config/koko/config.yml   [ √ ]
/opt/jumpserver/config/mysql/my.cnf      [ √ ]
/opt/jumpserver/config/redis/redis.conf  [ √ ]
完成

2. 配置 Nginx
配置文件位置:: /opt/jumpserver/config/nginx/cert
/opt/jumpserver/config/nginx/cert/server.crt  [ √ ]
/opt/jumpserver/config/nginx/cert/server.key  [ √ ]
完成

3. 备份配置文件
备份至 /opt/jumpserver/config/backup/config.txt.2021-03-19_08-01-51
完成

4. 配置网络
是否需要支持 IPv6? (y/n)  (默认为 n): n
完成

5. 配置加密密钥
SECRETE_KEY:     ICAgIGluZXQ2IDI0MDk6OGE0ZDpjMjg6ZjkwMTo6ZDRjLzEyO
BOOTSTRAP_TOKEN: ICAgIGluZXQ2IDI0
完成

6. 配置持久化目录
是否需要自定义持久化存储, 默认将使用目录 /opt/jumpserver? (y/n)  (默认为 n): n
完成

7. 配置 MySQL
是否使用外部mysql (y/n)  (默认为n): n

8. 配置 Redis
是否使用外部redis  (y/n)  (默认为n): n

>>> 安装完成了
1. 可以使用如下命令启动, 然后访问
./jmsctl.sh start

2. 其它一些管理命令
./jmsctl.sh stop
./jmsctl.sh restart
./jmsctl.sh backup
./jmsctl.sh upgrade
更多还有一些命令, 你可以 ./jmsctl.sh --help 来了解

3. Web 访问
http://192.168.100.248:8080
https://192.168.100.248:8443
默认用户: admin  默认密码: admin

4. SSH/SFTP 访问
ssh admin@192.168.100.248 -p2222
sftp -P2222 admin@192.168.100.248

5. 更多信息
我们的官网: https://www.jumpserver.org/
我们的文档: https://docs.jumpserver.org/
```

