---
title: sentry版本升级教程
categories:
  - 运维技术
  - 服务部署
tags:
  - Sentry
copyright: true
abbrlink: beb68893
date: 2023-05-19 11:03:36
---

因sentry从9.1.2后开始改版，并加入了很多中间组件，整个集群系统变得更加复杂，由原来的不到10个组件容器一下增加到30个左右的容器组件。组件增加，整个架构体系全面调整，系统也更复杂，搭建和维护排查难度成指数级增加。sentry官方一直鼓励升级到最新版本。升级到最新版的优点是可以使用很多最新功能，而且官方对于性能和稳定性也做了相应优化。如果你想升级，下面这篇教程可以帮到你少走弯路。

<!--more-->

## 资料

[官方文档](https://develop.sentry.dev/)



## 升级教程

### 旧版本教程

#### **确定版本**

如果你要升级，首先要确认自己当前版本号。可以看系统左下角，如下图

![](1.png)

#### **版本升级路径**

我的版本是9.1.2。因版本跨度很大，所以不是一下子就可以升级到最新版本，是需要逐步升级。升级过程会对数据库结构和组件搭配等自动做调整的。官方升级路径如下图：

![](2.png)

#### 执行动作

在确定好我们当前版本和版本升级路径后，我们需要对当前旧版本系统做停止动作。

```bash
#到旧版本的安装包下，执行
docker-compose stop
```



### 新版本教程

#### 程序包下载

从[官方包](https://github.com/getsentry/self-hosted/releases)下载对应版本的包，然后解压。

```bash
wget https://codeload.github.com/getsentry/self-hosted/tar.gz/refs/tags/21.5.0/self-hosted-21.5.0.tar.gz

tar -xzvf self-hosted-21.5.0.tar.gz
```

#### 升级

```bash
#直接执行安装动作即可
cd self-hosted-21.5.0
./install.sh
```

#### 优化

因升级过程中需要拉取很多文件，并打包镜像。而打包镜像又使用了debian的官方的源，造成总是下载或超时失败。我们可以去改为国内源就会对升级过程加快很多。需要对Dockerfile文件做调整

```bash
cd self-hosted-21.5.0/cron/

vim Dockerfile

#在apt-get update前，对源文件进行替换
COPY sources.list /etc/apt/sources.list

#添加源文件,下面源只用一个即可
vim sources.list

Debian 10
#网易镜像源
deb http://mirrors.163.com/debian/ buster main non-free contrib
deb http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb-src http://mirrors.163.com/debian/ buster main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-updates main non-free contrib
deb-src http://mirrors.163.com/debian/ buster-backports main non-free contrib
deb http://mirrors.163.com/debian-security/ buster/updates main non-free contrib
deb-src http://mirrors.163.com/debian-security/ buster/updates main non-free contrib

#阿里云镜像源
deb https://mirrors.aliyun.com/debian/ buster main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ buster main non-free contrib
deb https://mirrors.aliyun.com/debian-security buster/updates main
deb-src https://mirrors.aliyun.com/debian-security buster/updates main
deb https://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ buster-updates main non-free contrib
deb https://mirrors.aliyun.com/debian/ buster-backports main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ buster-backports main non-free contrib

Debian 11
#阿里云镜像源
deb https://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ bullseye main non-free contrib
deb https://mirrors.aliyun.com/debian-security/ bullseye-security main
deb-src https://mirrors.aliyun.com/debian-security/ bullseye-security main
deb https://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ bullseye-updates main non-free contrib
deb https://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib
deb-src https://mirrors.aliyun.com/debian/ bullseye-backports main non-free contrib

#网易镜像源
deb http://mirrors.163.com/debian/ bullseye main non-free contrib
deb-src http://mirrors.163.com/debian/ bullseye main non-free contrib
deb http://mirrors.163.com/debian-security/ bullseye-security main
deb-src http://mirrors.163.com/debian-security/ bullseye-security main
deb http://mirrors.163.com/debian/ bullseye-updates main non-free contrib
deb-src http://mirrors.163.com/debian/ bullseye-updates main non-free contrib
deb http://mirrors.163.com/debian/ bullseye-backports main non-free contrib
deb-src http://mirrors.163.com/debian/ bullseye-backports main non-free contrib
```

## sentry 历史数据清理

### SENTRY数据软清理 

**清理完不会释放磁盘，如果很长时间没有运行，清理时间会很长**

```sql
#登录worker容器
docker exec -it sentry_onpremise_worker_1 /bin/bash 
#保留多少天的数据，cleanup使用delete命令删除postgresql数据，但对于delete,update等操作，只是将对应行标志为DEAD，并没有真正释放磁盘空间
sentry cleanup --days  (num)
```

### POSTGRES数据清理 

**清理完后会释放磁盘空间**

```bash
#登录postgres容器
docker exec -it sentry_onpremise_postgres_1 /bin/bash
#运行清理
vacuumdb -U postgres -d postgres -v -f --analyze
# 数据量大时要选择低峰期操作，此步骤消耗大量的io和cpu 会使得大部分API被阻塞
```

### 定时清理脚本

```bash
### 写入cronjob，切记低峰期操作
0 0 * * * cd /yourpath/onpremise && docker-compose run --rm worker cleanup --days nums  &> /var/log/cleanup.log
0 1 * * * { time docker exec -i $(docker ps --format "table {{.Names}}"|grep postgres) vacuumdb -U postgres -d postgres -v -f --analyze; } &> /var/logs/vacuumdb.log
```

### 清理kafka 数据

```makefile
#.env 默认配置
KAFKA_LOG_RETENTION_HOURS=24
KAFKA_LOG_RETENTION_BYTES=53687091200   #50G
KAFKA_LOG_SEGMENT_BYTES=1073741824      #1G
KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS=300000
KAFKA_LOG_SEGMENT_DELETE_DELAY_MS=60000

# 减少kafka 数据的原则是 调小KAFKA_LOG_RETENTION_HOURS 和 KAFKA_LOG_SEGMENT_BYTES

docker exec -it sentry_onpremise_kafka_1 /bin/bash
kafka-configs --alter --bootstrap-server kafka:9092 --add-config retention.ms=46400000,segment.bytes=264572800   --topic events
kafka-configs --alter --bootstrap-server kafka:9092 --add-config retention.ms=46400000,segment.bytes=264572800   --topic ingest-transactions
```



## 总结

根据上面教程方法，就可以把当前版本按照版本升级路径逐步升级到最新的版本。