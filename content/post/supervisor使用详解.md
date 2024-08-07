---
title: supervisor使用详解
categories:
  - 操作系统
  - Linux
tags:
  - Supervisor
copyright: true
abbrlink: f13b8f05
date: 2019-07-11 17:08:40
---

## 简介

supervisor是用Python开发的一个client/server服务，是Linux/Unix系统下的一个进程管理工具。可以很方便的监听、启动、停止、重启一个或多个进程。用supervisor管理的进程，当一个进程意外被杀死，supervisor监听到进程死后，会自动将它重启，很方便的做到进程自动恢复的功能，不再需要自己写shell脚本来控制。

<!--more-->



## 安装

配置好yum源后，可以直接安装

```shell
yum install supervisor
```

## 配置

安装好后在/etc/会生成一个supervisord.conf文件及一个supervisord.d文件目录

supervisord.conf是一些默认配置，可自行修改：

```shell
[unix_http_server]

file=/tmp/supervisor.sock ;UNIX socket 文件，supervisorctl 会使用

;chmod=0700 ;socket文件的mode，默认是0700

;chown=nobody:nogroup ;socket文件的owner，格式：uid:gid

 

;[inet_http_server] ;HTTP服务器，提供web管理界面

;port=127.0.0.1:9001 ;Web管理后台运行的IP和端口，如果开放到公网，需要注意安全性

;username=user ;登录管理后台的用户名

;password=123 ;登录管理后台的密码

 

[supervisord]

logfile=/tmp/supervisord.log ;日志文件，默认是 $CWD/supervisord.log

logfile_maxbytes=50MB ;日志文件大小，超出会rotate，默认 50MB，如果设成0，表示不限制大小

logfile_backups=10 ;日志文件保留备份数量默认10，设为0表示不备份

loglevel=info ;日志级别，默认info，其它: debug,warn,trace

pidfile=/tmp/supervisord.pid ;pid 文件

nodaemon=false ;是否在前台启动，默认是false，即以 daemon 的方式启动

minfds=1024 ;可以打开的文件描述符的最小值，默认 1024

minprocs=200 ;可以打开的进程数的最小值，默认 200

 

[supervisorctl]

serverurl=unix:///tmp/supervisor.sock ;通过UNIX socket连接supervisord，路径与unix_http_server部分的file一致

;serverurl=http://127.0.0.1:9001 ; 通过HTTP的方式连接supervisord

 

; [program:xx]是被管理的进程配置参数，xx是进程的名称

[program:xx]

command=/opt/apache-tomcat-8.0.35/bin/catalina.sh run ; 程序启动命令

autostart=true ; 在supervisord启动的时候也自动启动

startsecs=10 ; 启动10秒后没有异常退出，就表示进程正常启动了，默认为1秒

autorestart=true ; 程序退出后自动重启,可选值：[unexpected,true,false]，默认为unexpected，表示进程意外杀死后才重启

startretries=3 ; 启动失败自动重试次数，默认是3

user=tomcat ; 用哪个用户启动进程，默认是root

priority=999 ; 进程启动优先级，默认999，值小的优先启动

redirect_stderr=true ; 把stderr重定向到stdout，默认false

stdout_logfile_maxbytes=20MB ; stdout 日志文件大小，默认50MB

stdout_logfile_backups = 20 ; stdout 日志文件备份数，默认是10

; stdout 日志文件，需要注意当指定目录不存在时无法正常启动，所以需要手动创建目录（supervisord 会自动创建日志文件）

stdout_logfile=/opt/apache-tomcat-8.0.35/logs/catalina.out

stopasgroup=false ;默认为false,进程被杀死时，是否向这个进程组发送stop信号，包括子进程

killasgroup=false ;默认为false，向进程组发送kill信号，包括子进程

 

;包含其它配置文件

[include]

files = relative/directory/*.ini ;可以指定一个或多个以.ini结束的配置文件
```

注意：[include]默认配置是制定*.ini，因个人习惯命名为*.conf文件，因此修改配置如下：

```shell
[include]
files = relative/directory/*.conf
```

supervisord.d目录用来存放用户自定义的进程配置，参考：

```shell
[program:es]

command=/opt/software/elasticsearch/bin/elasticsearch

user=es

stdout_logfile=/opt/supervisor_test/run.log

autostart=true

autorestart=true

startsecs=60

stopasgroup=true

ikillasgroup=true

startretries=1

redirect_stderr=true
```

注意: supervisor不能监控后台进程，command 不能为后台运行命令

服务段启动

```shell
supervisord -c /etc/supervisord.conf 
```



## 常用命令

supervisorctl 是 supervisord的命令行客户端工具

```shell
supervisorctl status：查看所有进程的状态

supervisorctl stop es：停止es

supervisorctl start es：启动es

supervisorctl restart es: 重启es

supervisorctl update ：配置文件修改后可以使用该命令加载新的配置

supervisorctl reload: 重新启动配置中的所有程序

把es 换成all 可以管理配置中的所有进程

直接输入：supervisorctl 进入supervisorctl 的shell交互界面，上面的命令不带supervisorctl 可直接使用
```

直接输入：supervisorctl 进入supervisorctl 的shell交互界面，上面的命令不带supervisorctl 可直接使用

![img](1.png)

## 踩过的坑

1、unix:///var/run/supervisor/supervisor.sock no such file

​     问题描述：安装好supervisor没有开启服务直接使用supervisorctl报的错

​     解决办法：supervisord -c /etc/supervisord.conf 



2、command中指定的进程已经起来，但supervisor还不断重启

​     问题描述：command中启动方式为后台启动，导致识别不到pid，然后不断重启，本人使用的是elasticsearch，command                        指定的是$path/bin/elasticsearch -d，踩到的坑

​     解决办法：supervisor无法检测后台启动进程的pid，而supervisor本身就是后台启动守护进程，因此不用担心这个



3、启动了多个supervisord服务，导致无法正常关闭服务

​    问题描述：在运行supervisord -c /etc/supervisord.conf 之前，我直接运行过supervisord -c /etc/supervisord.d/xx.conf                         ，导致有些进程被多个superviord管理，无法正常关闭进程。

​    解决办法： 使用 ps -fe | grep supervisord 查看所有启动过的supervisord服务，kill相关的进程。