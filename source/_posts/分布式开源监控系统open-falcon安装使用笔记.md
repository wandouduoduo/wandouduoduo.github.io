---
title: 分布式开源监控系统open-falcon安装使用笔记
categories: 
- 服务搭建
- 监控系统
tags: 
- Open-falcon
copyright: true
date: 2019-05-29 18:22:45
---

## 官方介绍

监控系统是整个运维环节，乃至整个产品生命周期中最重要的一环，事前及时预警发现故障，事后提供翔实的数据用于追查定位问题。监控系统作为一个成熟的运维产品，业界有很多开源的实现可供选择。当公司刚刚起步，业务规模较小，运维团队也刚刚建立的初期，选择一款开源的监控系统，是一个省时省力，效率最高的方案。之后，随着业务规模的持续快速增长，监控的对象也越来越多，越来越复杂，监控系统的使用对象也从最初少数的几个SRE，扩大为更多的DEVS，SRE。这时候，监控系统的容量和用户的“使用效率”成了最为突出的问题。

​        监控系统业界有很多杰出的开源监控系统。我们在早期，一直在用zabbix，不过随着业务的快速发展，以及互联网公司特有的一些需求，现有的开源的监控系统在性能、扩展性、和用户的使用效率方面，已经无法支撑了。

​        因此，我们在过去的一年里，从互联网公司的一些需求出发，从各位SRE、SA、DEVS的使用经验和反馈出发，结合业界的一些大的互联网公司做监控，用监控的一些思考出发，设计开发了小米的监控系统：Open-Falcon。

<!--more-->

## 特点：

- **数据采集免配置**：agent自发现、支持Plugin、主动推送模式

- **容量水平扩展**：生产环境每秒50万次数据收集、告警、存储、绘图，可持续水平扩展。

- **告警策略自发现**：Web界面、支持策略模板、模板继承和覆盖、多种告警方式、支持回调动作。
- **告警设置人性化**：支持最大告警次数、告警级别设置、告警恢复通知、告警暂停、不同时段不同阈值、支持维护周期，支持告警合并。
- **历史数据高效查询**：秒级返回上百个指标一年的历史数据。
- **Dashboard人性化**：多维度的数据展示，用户自定义Dashboard等功能。
- **架构设计高可用**：整个系统无核心单点，易运维，易部署

## **架构图：**

官网架构图

![](分布式开源监控系统open-falcon安装使用笔记/1.png)

其中虚线所在的aggregator组件还在设计开发阶段。

网友画的

![](分布式开源监控系统open-falcon安装使用笔记/2.png)

## 监控指标

每台服务器，都有安装falcon-agent，falcon-agent是一个golang开发的daemon程序，用于自发现的采集单机的各种数据和指标，这些指标包括不限于以下几个方面，共计200多项指标。

- CPU相关
- 磁盘相关
- IO
- Load
- 内存相关
- 网络相关
- 端口存活、进程存活
- ntp offset（插件）
- 某个进程资源消耗（插件）
- netstat、ss 等相关统计项采集
- 机器内核配置参数

只要安装了falcon-agent的机器，就会自动开始采集各项指标，主动上报，不需要用户在server做任何配置（这和zabbix有很大的不同），这样做的好处，就是用户维护方便，覆盖率高。当然这样做也会server端造成较大的压力，不过open-falcon的服务端组件单机性能足够高，同时都可以水平扩展，所以自动多采集足够多的数据，反而是一件好事情，对于SRE和DEV来讲，事后追查问题，不再是难题。

另外，falcon-agent提供了一个proxy-gateway，用户可以方便的通过http接口，push数据到本机的gateway，gateway会帮忙高效率的转发到server端。

falcon-agent，可以在我们的github上找到 : https://github.com/open-falcon/agent

## **数据流程图：**

![](分布式开源监控系统open-falcon安装使用笔记/3.jpg)

## 安装准备

### 系统环境：centos7.6

```
#源更新
yum -y update
#安装常用系统工具
yum -y install wget telnet git net-tools deltarpm epel-release
#关闭防火墙
sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config
setenforce 0
systemctl stop firewalld
systemctl disable firewalld
```

### 安装一些系统常用软件

```
yum -y install gcc gcc-c++ autoconf libjpeg libjpeg-devel libpng libpng-devel freetype freetype-devel libxml2 libxml2-devel zlib zlib-devel glibc glibc-devel glib2 glib2-devel bzip2 bzip2-devel zip unzip ncurses ncurses-devel curl curl-devel e2fsprogs e2fsprogs-devel krb5-devel libidn libidn-devel openssl openssh openssl-devel libxslt-devel libevent-devel ntp  libtool-ltdl bison libtool vim-enhanced python wget lsof iptraf strace lrzsz kernel-devel kernel-headers pam-devel Tcl/Tk  cmake  ncurses-devel bison setuptool popt-devel net-snmp screen perl-devel pcre-devel net-snmp screen tcpdump rsync sysstat man iptables sudo idconfig git system-config-network-tui bind-utils update arpscan tmux elinks numactl iftop  bwm-ng
```

### 安装pip

```
wget https://bootstrap.pypa.io/get-pip.py --no-check-certificate

python get-pip.py

#使用国内豆瓣源

mkdir /root/.pip

vi /root/.pip/pip.conf

[global]

index-url = [http://pypi.douban.com/simple](http://pypi.douban.com/simple)
trusted-host = pypi.douban.com
```

### 安装数据库

```
wget http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
rpm -ivh mysql-community-release-el7-5.noarch.rpm
yum install mysql-community-server
systemctl start mysql
systemctl enable mysqld
```

### 安装redis

```
yum install redis
systemctl start redis
systemctl enable redis
```

### 安装go环境**（若使用编译好的二进制文件，此步骤可忽略）**

```
yum install golang
go version
go version go1.6.3 linux/amd64
```

### 初始化数据库

```
mkdir /opt/openfalcon
cd /opt/openfalcon
git clone https://github.com/open-falcon/scripts.git
#导入表结构
cd scripts
mysql -h localhost -u root --password="" < db_schema/graph-db-schema.sql
mysql -h localhost -u root --password="" < db_schema/dashboard-db-schema.sql
mysql -h localhost -u root --password="" < db_schema/portal-db-schema.sql
mysql -h localhost -u root --password="" < db_schema/links-db-schema.sql
mysql -h localhost -u root --password="" < db_schema/uic-db-schema.sql
```

### 下载编译好的组件

```
mkdir /opt/openfalcon/tmp
cd /opt/openfalcon/tmp

wget https://github.com/open-falcon/of-release/releases/download/v0.1.0/open-falcon-v0.1.0.tar.gz

tar -zxf https://github.com/open-falcon/of-release/releases/download/v0.1.0/open-falcon-v0.1.0.tar.gz

rm -rf https://github.com/open-falcon/of-release/releases/download/v0.1.0/open-falcon-v0.1.0.tar.gz

cd /opt/openfalcon

for x in `find ./tmp/ -name "*.tar.gz"`;do app=`echo $x|cut -d'-' -f2`;mkdir -p $app;tar -zxf $x -C $app; done
```

## 开始安装

### **第一部分：绘图组件安装**

**组件列表：**

| **组件名称** | **用途**                                                     | **服务端口**                      | **备注**                                              |
| :----------: | ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------- |
|    Agent     | 部署在目标机器采集机器监控项                                 | http: 1988                        |                                                       |
|   Transfer   | 数据接收端，转发数据到后端Graph和Judge                       | http: 6060 rpc: 8433 socket: 4444 |                                                       |
|    Graph     | 操作rrd文件存储监控数据                                      | http: 6070 rpc: 6071              | 1.可部署多实例做集群 2.需要连接数据库graph            |
|    Query     | 查询各个Graph数据，提供统一http查询接口                      | http: 9966                        |                                                       |
|  Dashboard   | 查询监控历史趋势图的web端                                    | http: 8081                        | 1.需要python虚拟环境 2.需要连接数据库dashborad、graph |
|     Task     | 负责一些定时任务，索引全量更新、垃圾索引清理、自身组件监控等 | http: 8002                        | 1.需要连接数据库graph                                 |

**安装Agent**

agent用于采集机器负载监控指标，比如cpu.idle、load.1min、disk.io.util等等，每隔60秒push给Transfer。agent与Transfer建立了长连接，数据发送速度比较快，agent提供了一个http接口/v1/push用于接收用户手工push的一些数据，然后通过长连接迅速转发给Transfer。

每台机器上，都需要部署agent。修改配置并启动

```
cd/opt/openfalcon/agent/
mv cfg.example.json cfg.json

vim cfg.json
修改 transfer这个配置项的enabled为 true，表示开启向transfer发送数据的功能
修改 transfer这个配置项的addr为：["127.0.0.1:8433"] (改地址为transfer组件的监听地址, 为列表形式，可配置多个transfer实例的地址，用逗号分隔)
#默认情况下（所有组件都在同一台服务器上），保持cfg.json不变即可
#cfg.json中的各配置项，可以参考 https://github.com/open-falcon/agent/blob/master/README.md

#启动
./control start
#查看日志
./control tail
```

**安装Transfer**

transfer默认监听在:8433端口上，agent会通过jsonrpc的方式来push数据上来。

```
cd /opt/openfalcon/transfer/
mv cfg.example.json cfg.json
# 默认情况下（所有组件都在同一台服务器上），保持cfg.json不变即可
# cfg.json中的各配置项，可以参考 https://github.com/open-falcon/transfer/blob/master/README.md
# 如有必要，请酌情修改cfg.json

# 启动transfer
./control start
# 校验服务,这里假定服务开启了6060的http监听端口。检验结果为ok表明服务正常启动。
curl -s "http://127.0.0.1:6060/health"
#查看日志
./control tail
```

**安装Graph**

graph组件是存储绘图数据、历史数据的组件。transfer会把接收到的数据，转发给graph。

\#创建存储数据目录

mkdir -p /opt/openfalcon/data/6070

```
cd /opt/openfalcon/graph/
mv cfg.example.json cfg.json
# 默认情况下（所有组件都在同一台服务器上），绘图数据我改为了/opt/openfalcon/data/6070，还有就是数据库密码需要加上
# cfg.json中的各配置项，可以参考 https://github.com/open-falcon/graph/blob/master/README.md

# 启动
./control start
# 查看日志
./control tail
# 校验服务,这里假定服务开启了6071的http监听端口。检验结果为ok表明服务正常启动。
curl -s "http://127.0.0.1:6071/health"
```

**安装Query**

query组件，绘图数据的查询接口，query组件收到用户的查询请求后，会从后端的多个graph，查询相应的数据，聚合后，再返回给用户。

```
cd/opt/openfalcon/query/
mv cfg.example.json cfg.json
# 默认情况下（所有组件都在同一台服务器上），保持cfg.json不变即可
# cfg.json中的各配置项，可以参考 https://github.com/open-falcon/query/blob/master/README.md

# 启动
./control start
# 查看日志
./control tail
```

**安装Dashboard**

dashboard是面向用户的查询界面，在这里，用户可以看到push到graph中的所有数据，并查看其趋势图。

```
#安装依赖和虚拟环境
yum install -y python-virtualenv mysql-community-delvel
cd /opt/openfalcon/dashboard/
virtualenv ./env
./env/bin/pip install -r pip_requirements.txt

#配置
# config的路径为 $WORKSPACE/dashboard/rrd/config.py，里面有数据库相关的配置信息，如有必要，请修改。默认情况下(所有组件都在同一台服务器上)，保持默认配置即可
# 数据库表结构初始化，请参考前面的 环境准备 阶段

#启动
./control start
#浏览器访问
http://IP:8081
#查看日志
./control tail
```

**安装Task**

task是监控系统一个必要的辅助模块。定时任务，实现了如下几个功能：

- index更新。包括图表索引的全量更新 和 垃圾索引清理。

- falcon服务组件的自身状态数据采集。定时任务了采集了transfer、graph、task这三个服务的内部状态数据。

- falcon自检控任务。

  ```
  # #修改配置, 配置项含义见下文
  mv cfg.example.json cfg.json
  
  vim cfg.json
  
  # 启动服务
  ./control start
  # 校验服务,这里假定服务开启了8002的http监听端口。检验结果为ok表明服务正常启动。
  curl -s "127.0.0.1:8002/health"
  ```

  