---
title: Zabbix Server增加微信告警
categories:
  - 监控技术
  - Zabbix
tags:
  - Zabbix
copyright: true
abbrlink: 63c5195d
date: 2019-10-29 17:06:37
---

## 目的

微信现在是我们手机中必不可少的软件，通过它可以和朋友亲人聊天视频等。作为运维，让监控系统通过微信报警，及时提醒我们，保证线上服务稳定运行，这是SRE的职责所在。通过本教程学习，让zabbix  server增加微信报警媒介。



## 环境

```bash
[root@p34044v ~]# cat /etc/redhat-release 
CentOS Linux release 7.7.1908 (Core)
[root@p34044v ~]# python -V
Python 2.7.5
[root@p34044v ~]# zabbix_server -V
zabbix_server (Zabbix) 4.0.13
Revision 4e383bb6c5 2 October 2019, compilation time: Oct  2 2019 08:45:35

Copyright (C) 2019 Zabbix SIA
License GPLv2+: GNU GPL version 2 or later <http://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it according to
the license. There is NO WARRANTY, to the extent permitted by law.

This product includes software developed by the OpenSSL Project
for use in the OpenSSL Toolkit (http://www.openssl.org/).

Compiled with OpenSSL 1.0.1e-fips 11 Feb 2013
Running with OpenSSL 1.0.1e-fips 11 Feb 2013
[root@p34044v ~]# zabbix_agentd -V
zabbix_agentd (daemon) (Zabbix) 4.0.9
Revision 97a69d5d5a 5 June 2019, compilation time: Jun  7 2019 08:45:50

Copyright (C) 2019 Zabbix SIA
License GPLv2+: GNU GPL version 2 or later <http://gnu.org/licenses/gpl.html>.
This is free software: you are free to change and redistribute it according to
the license. There is NO WARRANTY, to the extent permitted by law.

This product includes software developed by the OpenSSL Project
for use in the OpenSSL Toolkit (http://www.openssl.org/).

Compiled with OpenSSL 1.0.1e-fips 11 Feb 2013
Running with OpenSSL 1.0.1e-fips 11 Feb 2013
[root@p34044v ~]# 

```

<!--more-->

## 申请企业微信号

#### 申请企业号并记录相关信息

```bash
https://qy.weixin.qq.com

后边需要用到的几个信息：
    1.登录网页 - 我的企业 - 企业ID：xxxxx
        或者：企业微信客户端：工作台 - 管理企业 - 企业信息 - 企业ID
```

#### 创建应用

```bash
登录网页 - 应用与小程序 - 创建应用。创建完成后记录以下信息：
    AgentId：xxxxx
    Secret：SacUM-xxxxxxxxxx
```

#### 添加通讯录（添加后才可接受告警消息）

```bash
登录网页 - 通讯录 - 添加成员
```

## 设置Python脚本

#### 安装依赖

```bash
yum install -y python-requests
```

#### 准备Python脚本

```bash
附录内有具体脚本内容，这里是使用Python脚本来实现的。
脚本内有3项内容是必须根据自己情况做修改的。详情请看脚本备注

# 1.查看Zabbix Server脚本目录设置
[root@localhost ~]# grep AlertScriptsPath /etc/zabbix/zabbix_server.conf
### Option: AlertScriptsPath
# AlertScriptsPath=${datadir}/zabbix/alertscripts
AlertScriptsPath=/usr/lib/zabbix/alertscripts

# 2.编辑Python脚本
vim /usr/lib/zabbix/alertscripts/weixin.py
添加附录内脚本内容

# 3.给脚本执行权限
chmod 755 /usr/lib/zabbix/alertscripts/weixin.py

# 4.测试脚本
/usr/lib/zabbix/alertscripts/weixin.py name test 123456
    name：收件人账号（登录企业微信网站 - 通讯录 - 打开某个收件人 - 账号）
    test：标题?
    123456：具体需要发送的内容

如果没有错误的话，收件人将可以在手机APP企业微信上收到此消息。
```

#### 手动建立日志文件并赋予写入权限

```bash
因为Python脚本设置了记录日志，但是脚本所在路径隶属于root组
而Zabbix Server是使用zabbix用户运行的，对此目录没有写入权限
所以这里先手动建立一个空的log文件，并赋予所有用户写入权限

touch /usr/lib/zabbix/alertscripts/weixin.log
chmod 766 /usr/lib/zabbix/alertscripts/weixin.log
```

## 设置Zabbix Server开启微信告警

#### 添加告警媒介

```bash
管理 - 报警媒介类型 - 创建媒体类型
    名称：微信
    类型：脚本
    脚本名称：weixin.py
    脚本参数：
        {ALERT.SENDTO}
        {ALERT.SUBJECT}
        {ALERT.MESSAGE}
```

#### 为用户添加报警媒介

```bash
管理 - 用户 - 报警媒介 - 添加
    类型：微信
    收件人：收件人账号（登录企业微信网站 - 通讯录 - 打开某个收件人 - 账号）
    当启用时：1-7,00:00-24:00
    如果存在严重性则使用：根据自己需要选择发送告警类型
    已启用：必须勾选
```

#### 打开触发器动作

```bash
1.管理 - 动作：这里默认是停用状态，需要手动开启

2.管理 - 动作 - Report problems to Zabbix administrators
    操作 - 编辑：查看【仅送到】选项是否是所有或者微信。
    
    关于这里的操作细节：
    步骤：1-1（假如故障持续了1个小时，它也只发送一次。）
             （如果改成1-0，0是表示不限制.无限发送)
              (发送间隔是下边的【步骤持续时间】）
```

### 模拟测试

```bash
将新某台被监控主机关机或zabbix-agentd暂停，查看是否能收到微信告警。
```

## 附录：使用普通微信接受消息

```bash
成员无需下载企业微信客户端，直接用微信扫码关注微工作台，即可在微信中接收企业通知和使用企业应用。

方法：登录企业微信管理页面 - 我的企业 - 微工作台 - 邀请关注的二维码
    关注后即可。
```

## 附录：Python脚本内容

```python
#!/usr/bin/env python
#-*- coding: utf-8 -*-
#author: 1327133225@qq.com
#date: 2019-01-13
#comment: zabbix接入微信报警脚本

import requests
import sys
import os
import json
import logging

# 设置记录日志
logging.basicConfig(level = logging.DEBUG, format = '%(asctime)s, %(filename)s, %(levelname)s, %(message)s',
                datefmt = '%a, %d %b %Y %H:%M:%S',
                filename = os.path.join('/usr/lib/zabbix/alertscripts','weixin.log'),
                filemode = 'a')

# 必须修改1:企业ID
corpid='wwxxxxxx'

# 必须修改2：Secret
appsecret='xxxxxxxxxxxxxxxxxxxxxxxxxx'

# 必须修改3:AgentId
agentid=xxxxxxxxx
#获取accesstoken
token_url='https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpid + '&corpsecret=' + appsecret
req=requests.get(token_url)
accesstoken=req.json()['access_token']

#发送消息
msgsend_url='https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + accesstoken

touser=sys.argv[1]
subject=sys.argv[2]
#toparty='3|4|5|6'
message=sys.argv[3]

params={
        "touser": touser,
#       "toparty": toparty,
        "msgtype": "text",
        "agentid": agentid,
        "text": {
                "content": message
        },
        "safe":0
}

req=requests.post(msgsend_url, data=json.dumps(params))
logging.info('sendto:' + touser + ';;subject:' + subject + ';;message:' + message)
```

## 附录：shell脚本内容(待验证)

```bash

#! /bin/bash
#set -x
CorpID="wwbc27916706540977"                   #我的企业下面的CorpID
Secret="6cMYoDUUdOiLjawS487dLr4SNp1Gku_nQTq22uV9gNM"            #创建的应用那有Secret
GURL="https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$CorpID&corpsecret=$Secret"
Token=$(/usr/bin/curl -s -G $GURL |awk -F\": '{print $4}'|awk -F\" '{print $2}')
#echo $Token
PURL="https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=$Token"
function body(){
        local int agentid=1000002   #改为AgentId 在创建的应用那里看
        local UserID=$1             #发送的用户位于$1的字符串
        local PartyID=2           #第一步看的通讯录中的部门ID
        local Msg=$(echo "$@" | cut -d" " -f3-)
        printf '{\n'
        printf '\t"touser": "'"$UserID"\"",\n"
        printf '\t"toparty": "'"$PartyID"\"",\n"
        printf '\t"msgtype": "text",\n'
        printf '\t"agentid": "'"$agentid"\"",\n"
        printf '\t"text": {\n'
        printf '\t\t"content": "'"$Msg"\""\n"
        printf '\t},\n'
        printf '\t"safe":"0"\n'
        printf '}\n'
}
/usr/bin/curl --data-ascii "$(body $1 $2 $3)" $PURL
```

## 附录：github脚本

```bash
https://github.com/OneOaaS/weixin-alert
使用教程参考：https://blog.51cto.com/11975865/2344314?source=dra
```

