---
title: Docker安装zabbix5.0LTS教程和优化
categories:
  - 监控技术
  - Zabbix
tags:
  - Zabbix
  - Docker
copyright: true
abbrlink: a16acd4c
date: 2020-11-18 14:57:48
---

在操作系统上直接部署安装zabbix太麻烦了，最近在搞k8s，正好研究下用docker容器来安装zabbix5.0LTS长期支持版。

<!--more-->

## 环境

操作系统：centos7



## 前期准备

### 配置阿里源

```bash
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

### 安装阿里的docker源

```
sudo yum-config-manager --add-repo \
https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

sudo yum makecache fast
```

### 安装系统需要的工具

```bash
yum install -y bind-utils net-tools wget unzip 
yum install -y yum-utils device-mapper-persistent-data lvm2
```

### 安装Docker

```bash
sudo yum -y install docker-ce
systemctl start docker
#设置开机自动启动
systemctl enable docker
```

### Docker使用国内的仓库

```bash
#编辑docker配置文件，使用国内仓库进行镜像下载
vi /etc/docker/daemon.json
{
    "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
#重启docker加载配置
systemctl restart docker
```

## 安装教程

### 创建MySQL容器

注意！指定UTF8字符集为重要参数，否则安装后在配置过程中，不能使用中文字符。

```bash
docker run --name sunmysql -t \
-e MYSQL_DATABASE="zabbix" \
-e MYSQL_USER="zabbix" \
-e MYSQL_PASSWORD="zabbix123$%^" \
-e MYSQL_ROOT_PASSWORD="root_123$%^" \
-v /data/zabbix/mysql:/var/lib/mysql \
-d mysql:5.7 \
--character-set-server=utf8 --collation-server=utf8_bin
```

### 创建java-gateway容器

默认zabbix不支持对java的监控，需要安装java-gateway来支持。

```bash
docker run --name zabbix-java-gateway -t \
-d zabbix/zabbix-java-gateway:centos-5.0-latest
```

### 创建Zabbix服务端容器

```bash
docker run --name zabbix-server -t \
--link sunmysql:mysql \
--link zabbix-java-gateway:zabbix-java-gateway \
-v /etc/localtime:/etc/localtime \
-v /etc/timezone:/etc/timezone \
-v /data/zabbix/alertscripts:/usr/lib/zabbix/alertscripts \
-v /data/zabbix/externalscripts:/usr/lib/zabbix/externalscripts \
-e DB_SERVER_HOST="sunmysql" \
-e MYSQL_DATABASE="zabbix" \
-e MYSQL_USER="zabbix" \
-e MYSQL_PASSWORD="zabbix_123$%^" \
-e MYSQL_ROOT_PASSWORD="root_123$%^" \
-e ZBX_CACHESIZE=2G \
-p 10051:10051 \
-d zabbix/zabbix-server-mysql:centos-5.0-latest
```

### 创建Zabbix前端页面容器

```bash
docker run --name zabbix-web -t \
--link sunmysql:mysql \
--link zabbix-server:zabbix-server \
-e DB_SERVER_HOST="sunmysql" \
-e MYSQL_DATABASE="zabbix" \
-e MYSQL_USER="zabbix" \
-e MYSQL_PASSWORD="zabbix_123$%^" \
-e MYSQL_ROOT_PASSWORD="root_123$%^" \
-e PHP_TZ="Asia/Shanghai" \
-p 80:8080 \
-d zabbix/zabbix-web-nginx-mysql:centos-5.0-latest
```

### 验证

直接浏览器访问http://ip/即可。默认用户名和密码是：Admin/zabbix

![](1.png)

## 优化教程

### 安装python环境

很多报警媒介原来都是用python写的，但是用docker安装zabbix默认没有python环境。

```bash
# 用root用户权限进入zabbix server容器中
docker exec -it --user root zabbix-server  /bin/bash
#下载依赖包
yum install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc* make -y
#下载python3的安装包
yum install wget -y
wget https://www.python.org/ftp/python/3.5.2/Python-3.5.2.tar.xz
#解压安装包
tar -Jxvf Python-3.5.2.tar.xz
#配置安装环境（切入解压目录下）
cd Python-3.5.2
./configure prefix=/usr/local/python3
#编译安装
make && make install
#配置软链接（如果有软连可省略）
ln -s /usr/local/python3/bin/python3 /usr/bin/python3
ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3
#添加默认软连
ln -s /usr/bin/python3 /usr/bin/python
ln -s /usr/bin/pip3 /usr/bin/pip 
```

### 时间设置

默认docker启动的zabbix-server用的是utc时间，那么在报警时的时间点就不准了。所以需要对时间进行设置。

**方法一**

把本机时区复制到宿主机即可：

```
docker cp /etc/localtime a9c27487faf4:/etc/localtime
```

然后重启容器。

**方法二**

容器内修改时区

```bash
docker exec -it <容器名> /bin/bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai    /etc/localtime
docker restart <容器名>
```

当然，你也可以在docker run创建容器时对localtime做映射，保证容器中和宿主机时间一致。



### 绘制图形中文字符乱码

需要安装中文字体来解决

```bash
#找字体文件，这里以下载文泉驿中文字体为例
wget http://xze.197946.com/wenquanyiziti.zip
unzip wenquanyiziti.zip
#将解压缩的字体拷贝到容器中
docker cp ~/文泉驿点阵正黑.ttf zabbix-web:/usr/share/zabbix/assets/fonts/wqy.ttf
#进入容器返回的终端进行之后配置，我覆盖了默认字体文件
docker exec --user root -it zabbix-web bash
cd /usr/share/zabbix/assets/fonts/
cp DejaVuSans.ttf DejaVuSans.ttf.bak
mv wqy.ttf DejaVuSans.ttf
```

到这来zabbix服务教程已完成。

## agent批量安装和自动注册

每台服务器上安装运行zabbix-agent，改好配置启动，然后要在服务端web页面逐个添加太麻烦。这里就用shell脚本批量安装zabbix-agent，然后自动去注册添加。

### 编写脚本

这里以4.0  lst agent为例。[离线包官方下载地址](https://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/)

```bash
#!/bin/bash

vernum=`cat /etc/redhat-release|sed -r 's/.* ([0-9]+)\..*/\1/'`

#在线
rpm -ivh http://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm
yum install zabbix-sender zabbix-agent

#离线
\cp -f zabbix-agent-4.0.9-3.el${vernum}.x86_64.rpm /root/
rpm -ivh /root/zabbix-agent-4.0.9-3.el${vernum}.x86_64.rpm

ipaddr=$(ifconfig eth0|grep -w inet|awk '{print $2}')

sed -i.ori 's#Server=127.0.0.1#Server=xxxxxxxx#' /etc/zabbix/zabbix_agentd.conf
sed -i.ori 's#ServerActive=127.0.0.1#ServerActive=xxxxxxxxxx#' /etc/zabbix/zabbix_agentd.conf
sed -i.ori 's#Hostname=Zabbix server#Hostname='${ipaddr}'#' /etc/zabbix/zabbix_agentd.conf
sed -i.ori '180a HostMetadataItem=system.uname' /etc/zabbix/zabbix_agentd.conf

service zabbix-agent start

if [ $vernum == 6 ];then
        chkconfig --add zabbix-agent
        chkconfig zabbix-agent on
else
        systemctl enable  zabbix-agent.service
fi
```

### 页面操作

添加自动注册规则

![](2.png)

注意：zabbix_server页面配置agent代理程序的接口地址为“172.17.0.1”。而zabbix_agentd.conf中server的地址也为server容器的内网地址，例如172.17.0.3。

## 多机房zabbix  proxy创建

### 容器创建

```bash
# 按照上面步骤按照docker。
# 按照上面教程创建mysql和java gateway容器

#运行zabbix proxy容器
docker run --name zabbix-proxy -t \
--link  sunmysql:mysql \
--link zabbix-java-gateway:zabbix-java-gateway \
-e DB_SERVER_HOST="sunmysql" \
-e ZBX_SERVER_HOST="101.198.176.99" \
-e MYSQL_DATABASE="zabbix" \
-e MYSQL_USER="zabbix" \
-e MYSQL_PASSWORD="zabbix123$%^" \
-e ZBX_HOSTNAME="Beijing-zabbix-proxy" \
-e ZBX_TIMEOUT=30 \
-e ZBX_CONFIGFREQUENCY="300" \
-e ZBX_DATASENDERFREQUENCY=3 \
-v /etc/localtime:/etc/localtime:ro \
-p 10051:10051 \
-d zabbix/zabbix-proxy-mysql:centos-5.0-latest
```

### 页面操作

![](3.png)

![](4.png)

## 钉钉告警

### 脚本一：关键字

```python
#!/usr/bin/env python
#coding:utf-8
import requests,json,sys,os,datetime
webhook="https://oapi.dingtalk.com/robot/send?access_token=xxxxxxxx"
user=sys.argv[1]
text=sys.argv[3]

data={
    "msgtype": "text",
    "text": {
        "content": text
    },
    "at": {
        "atMobiles": [
        ],
        "isAtAll": True
    }
}
headers = {'Content-Type': 'application/json'}
x=requests.post(url=webhook,data=json.dumps(data),headers=headers)
if os.path.exists("/tmp/dingding.log"):
    f=open("/tmp/dingding.log","a+")
else:
    f=open("/tmp/dingding.log","w+")
f.write("\n"+"--"*30)

if x.json()["errcode"] == 0:
    f.write("\n"+str(datetime.datetime.now())+"    "+str(user)+"    "+"发送成功"+"\n"+str(text))
    f.close()
else:
    f.write("\n"+str(datetime.datetime.now()) + "    " + str(user) + "    " + "发送失败" + "\n" + str(text))
    f.close()
```

### 脚本二：加签

```python

#!/usr/bin/python
# -*- coding: utf-8 -*-
import sys
import json
import requests
import time
import hmac
import hashlib
import base64
import urllib

def send_msg(url,data):
        headers = {'Content-Type': 'application/json;charset=utf-8'}
        r = requests.post(url,data = json.dumps(data),headers=headers)
        return r.text

def auth(secret):
        timestamp = long(round(time.time() * 1000))
        secret = secret
        secret_enc = bytes(secret).encode('utf-8')
        string_to_sign = '{}\n{}'.format(timestamp, secret)
        string_to_sign_enc = bytes(string_to_sign).encode('utf-8')
        hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
        sign = urllib.quote_plus(base64.b64encode(hmac_code))
        authlist=[timestamp,sign]
        return authlist

if __name__ == '__main__':
 content = sys.argv[1]

 data = {
 "msgtype": "text",
 "text": {
  "content": content
  },
  "at":{
        "isAtAll": True
  }
 }

 authlist = auth("SEC946d89502be22297135dca79f844e34d6b26c4e0e045a6a2e13a149a59ea430c")
 url = "https://oapi.dingtalk.com/robot/send?access_token=xxxxxxxxxxx"+"&timestamp="+str(authlist[0])+"&sign="+authlist[1]
 print(send_msg(url,data))
```

