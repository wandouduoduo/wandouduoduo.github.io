---
title: CentOS7下CMDBuild源码安装
categories:
  - 系统运维
tags:
  - Cmdb
copyright: true
abbrlink: a46a113c
date: 2019-07-16 18:12:45
---

## 目的

本文对CMDBuild的安装配置进行了详细说明。 

<!--more-->

## 环境

#### 操作系统

系统：[CentOS](http://www.linuxidc.com/topicnews.aspx?tid=14)-7-x86_64-Everything-1511

#### 版本控制

jdk版本(cmdb推荐版本1.8，采用1.8.0_131)：[http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html) 

tomcat版本(cmdb推荐版本7.068，采用7.0.79)：[http://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.4.10/zookeeper-3.4.10.tar.gz](http://mirror.bit.edu.cn/apache/zookeeper/zookeeper-3.4.10/zookeeper-3.4.10.tar.gz) 

 postgresql版本(cmdb推荐版本9.3，采用9.6.3)：https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-7-x86_64/pgdg-centos96-9.6-3.noarch.rpm 



## Tomcat安装配置 

### 安装jdk

#### 1）下载jdk

```bash
cd /usr/local/src/
wget http://download.Oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.rpm?AuthParam=1499065226_0efcc513ff7eb3edb189b0ee0eb7f2d1
```

#### 2）安装jdk

```shell
#安装完成后可使用"java --version"查看环境是否准备就绪
rpm -ivh jdk-8u131-linux-x64.rpm
```

### 安装tomcat 

#### 1）下载tomcat

```bash
#注意是下载二进制包，非src包" apache-tomcat-7.0.79-src.tar.gz"
wget http://mirrors.hust.edu.cn/apache/tomcat/tomcat-7/v7.0.79/bin/apache-tomcat-7.0.79.tar.gz
```

#### 2）解压&设置tomcat

```bash
tar -zxvf apache-tomcat-7.0.79.tar.gz -C /usr/local/
cd /usr/local/
mv apache-tomcat-7.0.79/ tomcat7/
```

#### 3）设置环境变量

```bash
#"tomcat7.sh"中的"tomcat7"部分自定义
vim /etc/profile.d/tomcat7.sh

CATALINA_HOME=/usr/local/tomcat7
export PATH=$PATH:$CATALINA_HOME/bin

source /etc/profile
```

#### 4）设置iptables

```bash
#tcp5432是postgresql的监听端口，tcp8080是tomcat的监听端口
vim /etc/sysconfig/iptables

-A INPUT -p tcp -m state --state NEW -m tcp --dport 5432 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 8080 -j ACCEPT

service iptables restart
```

#### 5）设置开机启动（CentOS7.x）

**增加tomcat启动参数**

```bash
#文件名“setenv.sh”固定，catalina.sh启动的时候会调用；
#“tomcat.pid”文件会在tomcat启动后生成在$TOMCAT_HOME目录下
vim /usr/local/tomcat7/bin/setenv.sh
#add tomcat pid  
CATALINA_PID="$CATALINA_BASE/tomcat.pid"
```

**增加tomcat.service**

```bash
#“tomcat.service”中的“tomcat”部分自定义；
#或者在/etc/rc.d/rc.local添加启动脚本。
vim /usr/lib/systemd/system/tomcat.service

[Unit]
Description=Tomcat  
After=syslog.target network.target remote-fs.target nss-lookup.target  
   
[Service]  
Type=forking  
PIDFile=/usr/local/tomcat7/tomcat.pid
ExecStart=/usr/local/tomcat7/bin/startup.sh
ExecReload=/bin/kill -s HUP $MAINPID  
ExecStop=/bin/kill -s QUIT $MAINPID  
PrivateTmp=true  
   
[Install]  
WantedBy=multi-user.target

systemctl enable tomcat.service
```

#### 6）启动&验证tomcat

##### **启动tomcat**

```bash
#或者使用systemctl命令
catalina.sh start
```

##### 查看端口

```bash
netstat -tunlp
```

##### web访问

浏览器：http://ip:8080



## 部署cmdbuild 

### 下载cmdbbuild

```bash
cd /usr/local/src
wget https://ncu.dl.sourceforge.net/project/cmdbuild/2.4.3/cmdbuild-2.4.3.zip
```

### 部署cmdbuild

```bash
unzip cmdbuild-2.4.3.zip
cd cmdbuild-2.4.3

#复制解压目录下的“cmdbuild-2.4.3.war”到$TOMCAT_HOME的webapps目录下，并更名为” cmdbuild.war”;
#复制解压目录下的“extras/tomcat-libs/6.0\ or\ higher/postgresql-9.4.1207.jar”到$TOMCAT_HOME的lib目录下，版本与postgresql不一致可忽略;
#配置后需要重启tomcat，war包在tomcat启动会被解析
cp cmdbuild-2.4.3.war /usr/local/tomcat7/webapps/cmdbuild.war
cp extras/tomcat-libs/6.0\ or\ higher/postgresql-9.4.1207.jar /usr/local/tomcat7/lib/
```



## 设置PostgreSQL

PostgreSQL安装略

### 设置pg_hba.conf

```bash
vim /var/lib/pgsql/9.6/data/pg_hba.conf

# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5

systemctl restart postgresql-9.6
```

### 创建cmdbuild数据库与账号

```bash
su - postgres

-bash-4.2$ psql
postgres=# create user cmdbadmin with password 'cmdbadmin@123';
postgres=# create database cmdbuild owner cmdbadmin;
postgres=# grant all privileges on database cmdbuild to cmdbadmin;
```

### 导入数据表

```bash
#此数据表是cmdb安装包中自带的1个demo表；
#注意导入的数据库
su - postgres

-bash-4.2$ psql -U cmdbadmin -d cmdbuild -f /usr/local/tomcat7/webapps/cmdbuild/WEB-INF/sql/sample_schemas/demo_schema.sql
Password for user cmdbadmin:
```

### 重启tomcat

```bash
#重启cmdb后生效，可在部署cmdb包到tomcat之后直接重启
-bash-4.2$ exit
catalina.sh stop
systemctl start tomcat
```

## 初始化cmdb

浏览器访问：http://ip:8080/cmdbuild/

登录后设置数据库