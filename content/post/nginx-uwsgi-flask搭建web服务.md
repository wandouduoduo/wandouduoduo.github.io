---
title: nginx+uwsgi+flask搭建web服务
categories:
  - 运维技术
  - 服务部署
tags:
  - Nginx
  - Uwsgi
  - Flask
copyright: true
abbrlink: e67f5ae2
date: 2019-06-03 14:42:05
---

# 1，目的

在生产环境下，可以通过Nginx+uwsgi+Flask部署Web服务，从而达到高并发高稳定性的要求。
 如果要部署多个APP，可以采用单个Nginx，多个uwsgi+Flask的方式来实现，如下图所示。

![img](1.png)

<!--more-->

# 2，安装过程

## 2.1，升级软件包

```
sudo apt-get update
```

## 2.2，安装virtualenv和python环境 

```
sudo apt-get install build-essential python-dev python-pip 
sudo pip install virtualenv
```

## 2.3，在virtualenv中部署flask app，并测试

- 创建存放网站的目录

```
mkdir mysite
```

- 配置virtualenv和安装flask

进入mysite目录，然后创建虚拟环境.env，激活虚拟环境，然后安装flask

```
cd mysite 
virtualenv .env # 创建Python虚拟环境 
source .env/bin/activate # 进入Python虚拟环境，退出命令是deactivate 
pip install flask # 在虚拟环境下安装flask
```

- 在mysite目录下创建hello.py

```
from flask import Flask
app = Flask(__name__)

@app.route("/app1/")
def hello():
    return "Hello World!"

@app.route("/app1/flask/")
def hello_flask():
    return "Hello World! Hello Flask!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
```

需要注意的是，app.run()只是开发时测试使用，故需要放置在`if __name__ == "__main__"`下，这样uwsgi才不会执行app.run()方法。而host需要设置为0.0.0.0，表示让flask监听机器的所有ip地址的8080端口。

- 启动测试
   执行以下命令，可以启动Flask。通过浏览器访问192.168.1.32:8080/app1/，如果返回“Hello World!”，则证明启动OK。

```
python hello.py
```

## 2.4，在virtualenv中部署uwsgi，并测试

- 进入到Python虚拟环境，并安装uwsgi

```
source .env/bin/activate # 进入Python虚拟环境，退出命令是deactivate 
pip install uwsgi # 在虚拟环境下安装uwsgi

#uwsgi的启动可以把参数加载命令行中，也可以是配置文件 .ini, .xml, .yaml 配置文件中，个人用的比较多得是 .ini 文件。

#通过uwsgi --help可以查看得到：
-x|--xmlconfig                         load config from xml file
-x|--xml                               load config from xml file
--ini                                  load config from ini file
-y|--yaml                              load config from yaml file
-y|--yml                               load config from yaml file
```

- 创建uwsgi目录，做好目录规划如下 

```
(.env) kevin@orange:~/web/flask/mysite$ tree .
.
├── hello.py
├── hello.pyc
├── uwsgi
│   ├── uwsgi.log
│   ├── uwsgi.pid
│   ├── uwsgi.sock
│   └── uwsgi.status
└── uwsgi.ini
```

- 修改uwsgi配置文件 

```
(.env) kevin@orange:~/web/flask/mysite$ vi uwsgi.ini 
[uwsgi]
chdir=/home/kevin/web/flask/mysite/
home=/home/kevin/web/flask/mysite/.env
module=hello
callable=app
master=true
processes=2
chmod-socket=666
logfile-chmod=644
uid=kevin_web
gid=kevin_web
procname-prefix-spaced=mysite
py-autoreload=1
#http=0.0.0.0:8080

vacuum=true
socket=%(chdir)/uwsgi/uwsgi.sock
stats=%(chdir)/uwsgi/uwsgi.status
pidfile=%(chdir)/uwsgi/uwsgi.pid
daemonize=%(chdir)/uwsgi/uwsgi.log
```

配置参数的含义，可参考[http://www.jianshu.com/p/c3b13b5ad3d7](https://www.jianshu.com/p/c3b13b5ad3d7)

常用命令

```
uwsgi --ini uwsgi.ini             # 启动
uwsgi --reload uwsgi.pid          # 重启
uwsgi --stop uwsgi.pid            # 关闭
```

- 启动uwsgi（在虚拟环境下），并测试

```
(.env) kevin@orange:~/web/flask/mysite$ uwsgi --ini uwsgi.ini
[uWSGI] getting INI configuration from uwsgi.ini
(.env) kevin@orange:~/web/flask/mysite$ ps -ef | grep mysite
zhangsh+  2270     1  0 16:15 ?        00:00:00 mysite uWSGI master
zhangsh+  2273  2270  0 16:15 ?        00:00:00 mysite uWSGI worker 1
zhangsh+  2274  2270  0 16:15 ?        00:00:00 mysite uWSGI worker 2
zhangsh+  2278  2171  0 16:15 pts/1    00:00:00 grep --color=auto mysite
```

## 2.5，安装nginx，并配置测试

- 安装nginx（不在python虚拟环境下）

```
sudo apt-get install nginx
```

- 编辑配置文件：/etc/nginx/conf.d/flask.conf

```
server {
    listen 81;
    server_name www.mysite.com;
    charset utf-8;

    client_max_body_size 5M;

    location /app1/ {
         include uwsgi_params;
         uwsgi_pass unix:/home/kevin/web/flask/mysite/uwsgi/uwsgi.sock;
     }

     location /static {
         alias /home/kevin/web/flask/mysite/static;
     }
}
```

- nginx启动测试

```
kevin@orange:~/web/flask/mysite$ sudo service nginx start
kevin@orange:~/web/flask/mysite$ ps -ef | grep nginx
root      2324     1  0 16:19 ?        00:00:00 nginx: master process /usr/sbin/nginx
www-data  2325  2324  0 16:19 ?        00:00:00 nginx: worker process
www-data  2326  2324  0 16:19 ?        00:00:00 nginx: worker process
www-data  2327  2324  0 16:19 ?        00:00:00 nginx: worker process
www-data  2328  2324  0 16:19 ?        00:00:00 nginx: worker process
zhangsh+  2330  2171  0 16:20 pts/1    00:00:00 grep --color=auto nginx
```



## 2.6，服务测试

- Http访问测试，一切OK

```
kevin@Blue:~$ curl http://192.168.1.32:81/app1/flask/
Hello World! Hello Flask!
kevin@Blue:~$ curl http://192.168.1.32:81/app1/
Hello World!
```

- 浏览器访问测试，一切OK

# 3，服务监控

- 读取uwsgi实时状态

  ```
  uwsgi --connect-and-read uwsgi/uwsgi.status
  ```

读取的结果是个json串，包括每个总的状态，每个work是状态，响应时间等，非常全面，也有一些开源的监控可以使用

- 实时动态查看状态 - uwsgitop

  这里有个uwsgi官方制作的实用工具 uwsgitop, 下面看下效果。

  

  ```shell
  # pip install uwsgitop
  # uwsgitop uwsgi/uwsgi.status
  uwsgi-2.0.9 - Mon Sep 14 11:20:44 2015 - req: 0 - RPS: 0 - lq: 0 - tx: 0
  node: lzz-rmbp - cwd: /Users/liuzhizhi/erya/portal - uid: 501 - gid: 20 - masterpid: 12748
   WID    %       PID     REQ     RPS     EXC     SIG     STATUS  AVG     RSS     VSZ     TX      RunT
   1      0.0     12749   0       0       0       0       idle    0ms     0       0       0       0
   2      0.0     12750   0       0       0       0       idle    0ms     0       0       0       0
   3      0.0     12751   0       0       0       0       idle    0ms     0       0       0       0
   4      0.0     12752   0       0       0       0       idle    0ms     0       0       0       0
   5      0.0     12753   0       0       0       0       idle    0ms     0       0       0       0
   6      0.0     12754   0       0       0       0       idle    0ms     0       0       0       0
   7      0.0     12755   0       0       0       0       idle    0ms     0       0       0       0
   8      0.0     12756   0       0       0       0       idle    0ms     0       0       0       0
  ```

  

# 4，参考资料

- 如何理解Nginx, WSGI, Flask之间的关系
  [http://blog.csdn.net/lihao21/article/details/52304119](https://link.jianshu.com?t=http://blog.csdn.net/lihao21/article/details/52304119)
- uWSGI的安装与配置
  [http://blog.csdn.net/chenggong2dm/article/details/43937433](https://link.jianshu.com?t=http://blog.csdn.net/chenggong2dm/article/details/43937433)
- uWSGI实战之操作经验
  [http://blog.csdn.net/orangleliu/article/details/48437319](https://link.jianshu.com?t=http://blog.csdn.net/orangleliu/article/details/48437319)
- nginx配置参考
  [http://wiki.nginx.org/HttpUwsgiModule#uwsgi_param](https://link.jianshu.com?t=http://wiki.nginx.org/HttpUwsgiModule#uwsgi_param)
- uwsgi安装参考
  [http://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html](https://link.jianshu.com?t=http://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html)
- uwsgi配置参考
  [http://uwsgi-docs.readthedocs.io/en/latest/Options.html#vacuum](https://link.jianshu.com?t=http://uwsgi-docs.readthedocs.io/en/latest/Options.html#vacuum)
- Nginx+uWSGI
  [https://my.oschina.net/guol/blog/121418](https://link.jianshu.com?t=https://my.oschina.net/guol/blog/121418)

例子

```ini
[uwsgi]
#http=0.0.0.0:8888
chdir=/home/dubboTestTool/
pythonpath=/usr/bin/python3
py-autoreload = 1
module=start
callable=app
master=true
processes=1
threads=10
disable-logging=true
buffer-size=65536
harakiri=60
vacuum=True
socket=127.0.0.1:8888
stats=%(chdir)/uwsgi/uwsgi.status
pidfile=%(chdir)/uwsgi/uwsgi.pid
daemonize=%(chdir)/uwsgi/uwsgi.log
logformat-strftime=true
log-date=%%Y-%%m-%%d %%H:%%M:%%S
log-format=[%(ftime)] pid: %(pid) %(addr) => host: %(host)%(uri)(%(method)) in %(secs)s %(status) total-size: %(size) bytes
```

