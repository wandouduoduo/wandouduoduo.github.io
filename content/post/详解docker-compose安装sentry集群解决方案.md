---
title: 详解docker-compose安装sentry集群解决方案<一>
categories:
  - 运维技术
  - 服务部署
tags:
  - Sentry
copyright: true
abbrlink: 9e1f41fe
date: 2020-12-29 11:57:00
---

`Sentry`是一个开源的实时错误报告和日志聚合工具平台。它专门监测错误并提取所有有用信息用于分析，不再麻烦地依赖用户反馈来定位问题。支持 web 前后端、移动应用以及游戏，支持 Python、OC、Java、Go、Node.js、Django、RoR 等主流编程语言和框架 ，还提供了 GitHub、Slack、Trello 等常见开发工具的集成。因sentry版本、安装方式和smtp要求的不同，新版本sentry不支持集群方案，本篇文章旨在用于sentry9.1.2版本+支持ssl/tls加密的smtp服务的单节点安装指南和集群解决方案。



<!--more-->

## 架构图

![在这里插入图片描述](1.png)

## 环境

**版本**: sentry 9.1.2
**安装方式**: docker-compose
**系统环境**: centos7，docker 17.05.0+、docker-Compose 1.17.0+
**集群节点**：192.168.1.100、192.168.1.101、192.168.1.102



## 集群方案

**所有节点上都需要如下操作**

### 拉取sentry配置

sentry的配置可以在[官方github](https://github.com/getsentry/onpremise/releases/tag/9.1.2)里面下载release版本

```shell
[root@bogon ~]$ mkdir sentry && cd sentry
[root@bogon sentry]$ wget https://github.com/getsentry/onpremise/archive/9.1.2.tar.gz
[root@bogon sentry]$ tar -zxvf 9.1.2.tar.gz 
[root@bogon sentry]$ tree
.
├── 9.1.2.tar.gz
└── onpremise-9.1.2
    ├── config.yml				# 配置文件yaml，键值对yaml格式导入
    ├── docker-compose.yml		# docker-compose文件，用于构建镜像
    ├── Dockerfile
    ├── install.sh				# 自动安装脚本
    ├── LICENSE
    ├── Makefile
    ├── README.md
    ├── requirements.txt		# 依赖包声明
    ├── sentry.conf.py			# 配置文件python，通过python程序导入
    └── test.sh

1 directory, 11 files
```



### 修改配置文件

这里主要修改邮件模块配置。但有个小问题，需要区分你的邮件服务器是用普通smtp 25端口还是ssl/tls的465/587端口。

以下这个gmail表格解释的比较清楚，以便使用正确的信息更新您的客户端

| 项目                         | Value                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| 接收邮件 (IMAP) 服务器       | imap.gmail.com 要求 SSL：是 端口：993                        |
| 发送邮件 (SMTP) 服务器       | smtp.gmail.com 要求 SSL：是 要求 TLS：是（如适用） 使用身份验证：是 SSL 端口：465 TLS/STARTTLS 端口：587 |
| 完整名称或显示名称           | 您的姓名                                                     |
| 帐号名、用户名或电子邮件地址 | 您的完整电子邮件地址                                         |
| 密码                         | 您的 Gmail 密码                                              |

如果你的smtp服务器支持ssl/tls，或者只支持这两种方式（可以提前telnet 服务器和端口验证），那么需要改动几个地方，下面以163邮箱为例：

**config.yml文件**

邮箱服务器支持ssl安全的，配置如下：

```shell
[root@VM_0_5_centos onpremise-9.1.2]# cat config.yml 
###############
# Mail Server #
###############

#mail.backend: 'smtp'  # Use dummy if you want to disable email entirely
mail.host: 'smtp.163.com'
mail.port: 465
mail.username: 'wandouduoduo@163.com'
mail.password: '************'
mail.use-tls: true
mail.from: 'wandouduoduo@163.com'
```

若邮件smtp服务器只支持普通的25端口，配置如下：

```yaml
[root@VM_0_5_centos onpremise-9.1.2]# cat config.yml 
###############
# Mail Server #
###############

mail.backend: 'smtp'  # Use dummy if you want to disable email entirely
mail.host: 'smtp.xxxx.com'
mail.port: 25
mail.username: 'wandouduoduo@xxxx.com'
mail.password: '**********'
mail.use-tls: false
mail.from: 'root@localhost'
```

**修改requirements.txt文件**

通过pip安装上一步配置里面用到的`django_stmp_ssl`模块，在requirements.txt里面的模块会在所有相关容器里面自动安装，如邮件为普通25端口，省略此步：

```shell
[root@VM_0_5_centos onpremise-9.1.2]# cat requirements.txt 
# Add plugins here
django-smtp-ssl==1.0
```

**修改sentry.conf.py文件**

在头部插入如下两行代码，如邮件为普通25端口，省略此步：

```python
import socket
socket.setdefaulttimeout(20)
```

主要是为了解决邮件模块socket超时的问题，默认的socket超时时间是5s。否则很容易报错，特别是邮件用ssl协议的，如下图：
![在这里插入图片描述](2.png)

**修改docker-compose.yml文件**

主要修改配置邮件和pg数据库相关的环境变量：
（1）修改：`x-defaults.environment.SENTRY_EMAIL_HOST: smtp.163.com`
（2）新增：`x-defaults.environment.SENTRY_DB_PASSWORD: postgres`
（3）新增：`services.postgres.environment.POSTGRES_PASSWORD=postgres`

完整配置如下：

```yml
# NOTE: This docker-compose.yml is meant to be just an example of how
# you could accomplish this on your own. It is not intended to work in
# all use-cases and must be adapted to fit your needs. This is merely
# a guideline.

# See docs.getsentry.com/on-premise/server/ for full
# instructions

version: '3.4'

x-defaults: &defaults
  restart: unless-stopped
  build:
    context: .
  depends_on:
    - redis
    - postgres
    - memcached
    - smtp
  env_file: .env
  environment:
    SENTRY_MEMCACHED_HOST: memcached
    SENTRY_REDIS_HOST: redis
    SENTRY_POSTGRES_HOST: postgres
    SENTRY_DB_PASSWORD: postgres
    SENTRY_EMAIL_HOST: smtp.126.com
  volumes:
    - sentry-data:/var/lib/sentry/files


services:
  smtp:
    restart: unless-stopped
    image: tianon/exim4

  memcached:
    restart: unless-stopped
    image: memcached:1.5-alpine

  redis:
    restart: unless-stopped
    image: redis:3.2-alpine

  postgres:
    restart: unless-stopped
    image: postgres:9.5
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - sentry-postgres:/var/lib/postgresql/data

  web:
    <<: *defaults
    ports:
      - '9000:9000'

  cron:
    <<: *defaults
    command: run cron

  worker:
    <<: *defaults
    command: run worker


volumes:
    sentry-data:
      external: true
    sentry-postgres:
      external: true
```

### 自动安装并启动

#### 准备并构建镜像

```shell
# 准备构建镜像
./install.sh
```

构建过程中在终端里需要创建用户账号，输入正确的邮箱和密码，设置为超级管理员即可。如下所示：
![在这里插入图片描述](3.png)

如如果没有弹出来让你填写或者填错了取消也都没关系，在intall.sh脚本跑完之后可以单独创建用户，如下：

```bash
docker-compose run --rm web createuser
```

#### 启动应用

```shell
# 启动
docker-compose up -d
```

然后通过docker命令可以看到容器都起来了，如开头的框架图，sentry服务默认用到了7个容器。

```shell
[root@VM_0_5_centos onpremise-9.1.2]# docker ps |grep onpremise
8ec4557197f4        onpremise-912_worker                                "/entrypoint.sh run …"   14 hours ago        Up 14 hours            9000/tcp                    onpremise-912_worker_1
9c173154c5a6        onpremise-912_web                                   "/entrypoint.sh run …"   14 hours ago        Up 14 hours            0.0.0.0:9000->9000/tcp      onpremise-912_web_1
0b513728479b        onpremise-912_cron                                  "/entrypoint.sh run …"   14 hours ago        Up 14 hours            9000/tcp                    onpremise-912_cron_1
e4e98dbaf0e2        postgres:9.5                                        "docker-entrypoint.s…"   23 hours ago        Up 22 hours            5432/tcp                    onpremise-912_postgres_1
dc4281107dad        tianon/exim4                                        "docker-entrypoint.s…"   23 hours ago        Up 22 hours            25/tcp                      onpremise-912_smtp_1
c888e6567f55        redis:3.2-alpine                                    "docker-entrypoint.s…"   23 hours ago        Up 22 hours            6379/tcp                    onpremise-912_redis_1
d4a3f95533ba        memcached:1.5-alpine                                "docker-entrypoint.s…"   23 hours ago        Up 22 hours            11211/tcp                   onpremise-912_memcached_1
```

这几个容器应用的作用：

| 名称      | 描述                                 |
| --------- | ------------------------------------ |
| cron      | 定时任务，使用的是celery-beat        |
| memcached | memcached                            |
| postgres  | pgsql数据库                          |
| redis     | 运行celery需要的服务                 |
| smtp      | 邮件服务                             |
| web       | 使用django+drf写的一套Sentry Web界面 |
| worker    | celery的worker服务，用来跑异步任务的 |

**离线安装**

上述都是在线安装的，涉及到的所有docker image都是从docker hub registry当中远程拉取的。如果是本地局域网或离线安装，需要哪些镜像呢？

在docker-compose.yml和docker-compose build执行中找到答案。其中的sentry镜像经过docker-compose build会基于它构建出三个镜像，分别是：web、cron和worker。从执行结果中可知，最终就得到了sentry系统7个容器镜像：

```shell
 [root@VM_0_5_centos onpremise-9.1.2]# docker-compose build
 smtp uses an image, skipping
 memcached uses an image, skipping
 redis uses an image, skipping
 postgres uses an image, skipping
 Building web
 Step 1/2 : ARG SENTRY_IMAGE
 Step 2/2 : FROM ${SENTRY_IMAGE:-sentry:9.1.2}-onbuild
 Successfully built 1ce74ed80f84
 Successfully tagged onpremise-912_web:latest
 Building cron
 Step 1/2 : ARG SENTRY_IMAGE
 Step 2/2 : FROM ${SENTRY_IMAGE:-sentry:9.1.2}-onbuild
 Successfully built 1ce74ed80f84
 Successfully tagged onpremise-912_cron:latest
 Building worker
 Step 1/2 : ARG SENTRY_IMAGE
 Step 2/2 : FROM ${SENTRY_IMAGE:-sentry:9.1.2}-onbuild
 Successfully built 1ce74ed80f84
 Successfully tagged onpremise-912_worker:latest
1234567891011121314151617181920
```

所以，离线安装只需要将上述5个容器镜像提前下载下来并导入到内网即可：

- sentry:9.1.2-onbuild
- redis:3.2-alpine
- postgres:9.5
- tianon/exim4
- memcached:1.5-alpine

```shell
docker save -o xxx.tar xxxx:latest
docker load -i xxx.tar
```

## 验证

### 页面访问验证

浏览器中输入http://xxxx:9000访问，输入在install时创建的超级管理员账号密码登陆即可。
![在这里插入图片描述](4.png)

**调整了配置要重启应用**

```shell
docker-compose build							# 重新构建镜像
docker-compose run --rm web upgrade				# 同步数据
docker-compose up -d        					# 重新启动容器
```

### 验证邮箱

在web界面上，用户下拉，管理-->Email-->测试发送邮件
![在这里插入图片描述](6.png)
然后在邮箱中即可收到验证测试邮件。

### 配置SDK并验证异常捕获及通知

创建一个python的除0异常测试项目来验证，比较简单。页面中会给出了使用提示。即在项目运行环境中安装sdk，然后在项目代码里面插入模块即可。
![在这里插入图片描述](7.png)
运行python程序，页面可以看到这个错误并收到了邮件通知。大功告成！！！
![在这里插入图片描述](8.png)
![在这里插入图片描述](9.png)

## 优化

### 调整语言

默认为英文，这里改为中文。在界面左上角Sentry账户那下拉选择User Settings，然后再Account Detail里面选择language为Simplified Chinese，看到提示成功后刷新页面即可。
![在这里插入图片描述](5.png)

### 集成其它模块示例

如果要集成其它模块，如钉钉通知，只需要两步：

#### 在requirements.txt里面添加模块

```shell
# Add plugins here
django-smtp-ssl~=1.0  # 发邮件支持SSL协议
sentry-dingding~=0.0.2  # 钉钉通知插件
redis-py-cluster==1.3.4  # redis-cluster连接
```

#### 配置通知

页面中任意选择一个项目 --> 设置 --> 点击Legacy Integrations --> 搜索到DingDing开启并配置钉钉机器人Access Token即可完成。

### 清理历史数据

#### 只保留60天数据

命令cleanup删除postgresql数据，但postgrdsql对于delete, update等操作，只是将对应行标志为DEAD，属于”软删除“，并没有真正释放磁盘空间

```bash
$ docker exec -it sentry_worker_1 bash
$ sentry cleanup  --days 60
```

#### postgres数据清理 

清理完后会彻底删除数据，并释放磁盘空间

```bash
$ docker exec -it sentry_postgres_1 bash
$ vacuumdb -U postgres -d postgres -v -f --analyze
```

#### 定时清理脚本

直接设定定时执行上述两步，避免每次要手动清理或时间太久难以清理

```bash
#!/usr/bin/env bash
docker exec -i sentry_worker_1 sentry cleanup --days 60 && docker exec -i -u postgres sentry_postgres_1 vacuumdb -U postgres -d postgres -v -f --analyze
```

### 升级

Sentry有非常好的数据迁移的设计，升级Sentry非常方便。每次使用pip更新Sentry包之后执行升级命令”sentry upgrade"即可。对应到docker-compose的方式，原则上我们只需要dockerfile里面更新sentry的docker镜像的版本号（如果是离线版本则要提前下载新镜像），然后按照上面提到的命令重启容器即可：

```shell
docker-compose build							# 重新构建镜像
docker-compose run --rm web upgrade				# 同步数据
docker-compose up -d        					# 重新启动容器
```



## 排错

如果报错没有组织团队，需要进入到db里面查看，可能是数据库没有初始化：

### 进入postgres数据库容器

```
docker exec -it onpremise_postgres_1 bash
```

### 进入postgres数据库

```bash
psql -h 127.0.0.1 -d postgres -U postgres
```

### 查看数据表

查看sentry_project，sentry_organization两个表是否有数据

```shell
postgres=# select * from sentry_project;
postgres=# select * from sentry_organization ;
```

如果确认是没有数据，进行创建。

### 打开shell

进入sentry的web的shell里面，其实就是一个python端：

```
docker-compose run --rm web shell
```

### 初始化数据

```python
from sentry.models import Project
from sentry.receivers.core import create_default_projects
create_default_projects([Project])
```

### 退出shell创建用户

```
docker-compose run --rm web createuser
```



## 总结

本文详细介绍了单节点sentry9.1.2容器化搭建过程，并详解了邮件和其他集成的组件的优化等等。但限于篇幅问题，本文就写到这里，下一篇详细介绍集群方案。