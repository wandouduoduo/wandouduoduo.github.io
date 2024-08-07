---
title: python项目+uwsgi+nginx+supervisor部署配置详解
categories:
  - 运维技术
  - 服务部署
tags:
  - Nginx
  - Uwsgi
  - Python
  - Supervisor
copyright: true
abbrlink: 3b8bdb1e
date: 2022-03-15 17:18:04
---

本文详细介绍了python项目（flask或django等）在部署到linux服务器上后，uwsgi常用配置和nginxd对应通信配置，以及supervisor常用配置详解。本篇为高级篇，至于怎么安装请参考博客中其他文档，谢谢。



<!--more-->

## uwsgi常用配置

作为模板uwsgi.ini，当然也可以根据uwsgi --help来查看或自定义。[官方参数详解](https://uwsgi-docs.readthedocs.io/en/latest/Options.html)

```bash
master = true 
#启动主进程，来管理其他进程，其它的uwsgi进程都是这个master进程的子进程，如果kill这个master进程，相当于重启所有的uwsgi进程。

project=tools  
# 项目名

base = /usr/local/sun/
# 项目根目录

home = %(base)/Env/%(project) 
# 设置项目虚拟环境,Docker部署时不需要,用virtualenv = %(base)/Env/%(project)也是可以的。

chdir=%(base)/%(project) 
# 设置工作目录

module=%(project).wsgi:app
# wsgi文件位置

py-autoreload=1  
#监控python模块mtime来触发重载，热加载 (只在开发时使用)

#uwsgi启动用户名和用户组
uid = www
gid = www

lazy-apps=true  
#在每个worker而不是master中加载应用

socket = %(base)/%(project)/%(project).sock 
#指定socket文件，也可以指定为127.0.0.1:9000，这样就会监听到网络套接字

# socket权限设置
chown-socket=www
chmod-socket=664

processes = 2 #启动2个工作进程，生成指定数目的worker/进程

workers = 4 #启动4个工人

threads=4 #启动4个线程

enable-threads=True #开启多线程模式

buffer-size = 32768 #设置用于uwsgi包解析的内部缓存区大小为64k。默认是4k。

daemonize = %(base)/%(project)/logs/myapp_uwsgi.log 
# 使进程在后台运行，并将日志打到指定的日志文件或者udp服务器

log-maxsize = 5000000 #设置最大日志文件大小

disable-logging = true #禁用请求日志记录

vacuum = true #当服务器退出的时候自动删除unix socket文件和pid文件。

listen = 120 #设置socket的监听队列大小（默认：100）

pidfile = %(base)/%(project)/uwsgi.pid #指定pid文件

enable-threads = true 
#允许用内嵌的语言启动线程。这将允许你在app程序中产生一个子线程

reload-mercy = 8 
#设置在平滑的重启（直到接收到的请求处理完才重启）一个工作子进程中，等待这个工作结束的最长秒数。这个配置会使在平滑地重启工作子进程中，如果工作进程结束时间超过了8秒就会被强行结束（忽略之前已经接收到的请求而直接结束）

max-requests = 5000 
#为每个工作进程设置请求数的上限。当一个工作进程处理的请求数达到这个值，那么该工作进程就会被回收重用（重启）。你可以使用这个选项来默默地对抗内存泄漏

limit-as = 256 
#通过使用POSIX/UNIX的setrlimit()函数来限制每个uWSGI进程的虚拟内存使用数。这个配置会限制uWSGI的进程占用虚拟内存不超过256M。如果虚拟内存已经达到256M，并继续申请虚拟内存则会使程序报内存错误，本次的http请求将返回500错误（当产生内存错误时，可能是内存使用数设置不足）

harakiri = 60 
#一个请求花费的时间超过了这个harakiri超时时间，那么这个请求都会被丢弃，并且当前处理这个请求的工作进程会被回收再利用（即重启）
```

## 配置wsgi启动文件的3种方式

### 第一种：wsgi-file和callable

```bash
# 指定加载的WSGI文件
wsgi-file=manager.py
# 指定uWSGI加载的模块中哪个变量将被调用
callable=app
```

### 第二种：模块：调用对象

```bash
# 模块名:可调用对象app
module=manager:app
```

### 第三种：module和callable

```bash
module=manager
callable=app
```



## uWSGI和Nginx 3种通信方式

其中上面配置有几处，是可以选择的。

uWSGI和Nginx之间有3种通信方式,: unix socket，TCP socket和http。而Nginx的配置必须与uwsgi配置保持一致

```bash
# 以下uwsgi与nginx通信手段3选一即可
# 选项1, 使用unix socket与nginx通信，仅限于uwsgi和nginx在同一主机上情形
# Nginx配置中uwsgi_pass应指向同一socket文件
socket=%(base)/%(project)/%(project).sock
 
 
# 选项2，使用TCP socket与nginx通信
# Nginx配置中uwsgi_pass应指向uWSGI服务器IP和端口
# socket=0.0.0.0:8000 或则 socket=:8000
 
 
# 选项3，使用http协议与nginx通信
# Nginx配置中proxy_pass应指向uWSGI服务器一IP和端口
# http=0.0.0.0:8000 
```

### 选项1：本地unix socket通信

如果你的nginx与uwsgi在同一台服务器上，优先使用本地机器的unix socket进行通信，这样速度更快。

即uwsgi配置了选项1，此时nginx的配置文件如下所示：

```bash
location / {     
    include /etc/nginx/uwsgi_params;
    uwsgi_pass unix:/run/uwsgi/project.sock;
}
```

### 选项2：异地tcp  socket通信

如果nginx与uwsgi不在同一台服务器上，可以使用选项2和3。这里使用TCP socket通信，nginx应如下配置：

```
location / {     
    include /etc/nginx/uwsgi_params;
    uwsgi_pass uWSGI_SERVER_IP:8000;
}
```

### 选项3：异地http通信

同样的，如果nginx与uwsgi不在同一台服务器上，用http协议进行通信，nginx配置如下：

```bash
location / {     
    # 注意：proxy_pass后面http必不可少哦！
    proxy_pass http://uWSGI_SERVER_IP:8000;
}
```

## 常用命令

```bash
#uwsgi --ini uwsgi.ini             # 启动
#uwsgi --reload uwsgi.pid          # 重启
#uwsgi --stop uwsgi.pid            # 关闭
```

## Supervisor常用配置

supervisor就是用Python开发的一套通用的进程管理程序，能将一个普通的命令行进程变为后台守护进程daemon，并监控进程状态，异常退出时能自动重启。

## 安装

1. 通过这种方式安装后，会自动设置为开机启动

   ```bash
   #Ubuntu：
   apt-get install supervisor
   
   #centos
   yum install epel-release
   yum install -y supervisor
   ```

2. 也可以通过 `pip install supervisor` 进行安装，但是需要手动启动，然后设置为开机启动（不推荐这种安装方式）

   ```bash
   systemctl start supervisord.service     #启动supervisor并加载默认配置文件
   systemctl enable supervisord.service    #将supervisor加入开机启动项
   
   #生成默认配置
   mkdir -m 755 -p /etc/supervisor/
   echo_supervisord_config > supervisord.conf
   ```

   

## Supervisor 配置

Supervisor 是一个 C/S 模型的程序，`supervisord` 是 server 端，`supervisorctl` 是 client 端。



### supervisord

下面介绍 supervisord 配置方法。supervisord 的配置文件默认位于 `/etc/supervisord.conf`，内容如下（`;`后面为注释）：

```conf
; supervisor config file

[unix_http_server]
file=/var/run/supervisor.sock   ; UNIX socket 文件，supervisorctl 会使用
chmod=0700      ; sockef file mode (default 0700) socket 文件的 mode，默认是 0700

[supervisord]
logfile=/var/log/supervisor/supervisord.log ; 日志文件，默认是 $CWD/supervisord.log
pidfile=/var/run/supervisord.pid ; (supervisord pidfile;default supervisord.pid) pid 文件
childlogdir=/var/log/supervisor            ; ('AUTO' child log dir, default $TEMP)

; the below section must remain in the config file for RPC
; (supervisorctl/web interface) to work, additional interfaces may be
; added by defining them in separate rpcinterface: sections
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///var/run/supervisor.sock ; use a unix:// URL  for a unix socket 通过 UNIX socket 连接 supervisord，路径与 unix_http_server 部分的 file 一致

; 在增添需要管理的进程的配置文件时，推荐写到 `/etc/supervisor/conf.d/` 目录下，所以 `include` 项，就需要像如下配置。
; 包含其他的配置文件
[include]
files = /etc/supervisor/conf.d/*.conf ; 引入 `/etc/supervisor/conf.d/` 下的 `.conf` 文件
```

### program 配置

program 的配置文件就写在，supervisord 配置中 `include` 项的路径下：`/etc/supervisor/conf.d/`，然后 program 的配置文件命名规则推荐：app_name.conf

```conf
[program:uwsgi]
command=/home/python/.virtualenvs/deploy/bin/uwsgi --ini /home/python/Desktop/flask_deploy/uwsgi.ini
user=root
autostart=true
autorestart=true
redirect_stderr=True  
stdout_logfile=/home/python/Desktop/flask_deploy/log/uwsgi_supervisor.log
stderr_logfile=/home/python/Desktop/flask_deploy/log/uwsgi_supervisor_err.log

解释：
- [program:module_name]表示supervisor的一个模块名  
- command 程序启动命令如: /usr/bin/python - app.py  
- user 进程运行的用户身份
- autostart=true  跟随Supervisor一起启动
- autorestart=true 挂掉之后自动重启
- 把 stderr 重定向到 stdout，默认 false
- stderr_logfile, stdout_logfile 标准输出，错误日志文件
```

### supervisorctl 操作

supervisorctl 是 supervisord 的命令行客户端工具，使用的配置和 supervisord 一样，这里就不再说了。下面，主要介绍 supervisorctl 操作的常用命令：

输入命令 `supervisorctl` 进入 supervisorctl 的 shell 交互界面（还是纯命令行😓），就可以在下面输入命令了。：

- help # 查看帮助
- status # 查看程序状态
- stop program_name # 关闭 指定的程序
- start program_name # 启动 指定的程序
- restart program_name # 重启 指定的程序
- tail -f program_name # 查看 该程序的日志
- update # 重启配置文件修改过的程序（修改了配置，通过这个命令加载新的配置)

也可以直接通过 shell 命令操作：

- supervisorctl status
- supervisorctl update

启动supervisor之后就可以通过`ip:9001`访问supervisor的管理页面，前提是配置中supervisorctl 配置这种http的访问方式，而不是像上面用socket套接字。

![img](1.jpg)