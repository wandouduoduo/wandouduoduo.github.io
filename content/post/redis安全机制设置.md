---
title: redis安全机制设置
categories:
  - 数据库
  - NoSQL
  - Redis
tags:
  - Redis
copyright: true
abbrlink: 3f430996
date: 2019-06-27 09:31:03
---

## 背景

redis作为一个高速数据库，在互联网上广泛使用，但是在生产环境必须有对应的安全机制来进行保护。那么怎么保护呢？

<!--more-->



### **方法一：采用绑定IP的方式来进行控制**。

 请在redis.conf文件找到如下配置

```
# If you want you can bind a single interface, if the bind option is not
# specified all the interfaces will listen for incoming connections.
#
# bind 127.0.0.1
```

把# bind 127.0.0.1前面的 注释#号去掉，然后把127.0.0.1改成你允许访问你的redis服务器的ip地址，表示只允许该ip进行访问

这种情况下，我们在启动redis服务器的时候不能再用:redis-server，改为:redis-server path/redis.conf 即在启动的时候指定需要加载的配置文件,其中path/是你上面修改的redis配置文件所在目录，这个方法有一点不太好，我难免有多台机器访问一个redis服务。

### **方法二：设置密码，以提供远程登陆**

打开redis.conf配置文件，找到requirepass，然后修改如下:

```shell
requirepass yourpassword
# yourpassword就是redis验证密码，*设置密码以后发现可以登陆，但是无法执行命令了。
```

命令如下:

```shell
redis-cli -h yourIp -p yourPort//启动redis客户端，并连接服务器
keys * //输出服务器中的所有key
```

*报错如下(error) ERR operation not permitted*


这时候你可以用授权命令进行授权，就不报错了

命令如下:

```shell
auth youpassword
```

另外，在连接服务器的时候就可以指定登录密码，避免单独输入上面授权命令

命令如下:

```shell
redis-cli -h  yourIp-p yourPort  -a youPassword
```

 除了在配置文件redis.conf中配置验证密码以外，也可以在已经启动的redis服务器通过命令行设置密码，但这种方式是临时的，当服务器重启了密码必须重设。命令行设置密码方式如下：

```shell
config set requirepass yourPassword
```

 有时候我们不知道当前redis服务器是否有设置验证密码，或者忘记了密码是什么，我们可以通过命令行输入命令查看密码，命令如下：

```
config get requirepass
```

 如果redis服务端没有配置密码，会得到nil，而如果配置了密码，但是redis客户端连接redis服务端时，没有用密码登录验证，会提示：operation not permitted,这时候可以用命令：auth yourpassword 进行验证密码，再执行 config set requirepass，就会显示yourpassword

由于redis并发能力极强，仅仅搞密码，攻击者可能在短期内发送大量猜密码的请求，很容易暴力破解，所以建议密码越长越好，比如20位。（密码在 conf文件里是明文，所以不用担心自己会忘记）