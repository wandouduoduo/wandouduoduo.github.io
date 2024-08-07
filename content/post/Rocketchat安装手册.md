---
title: Rocketchat安装手册
categories:
  - 运维技术
  - 服务部署
tags:
  - RocketChat
copyright: true
abbrlink: 1f64fa0e
date: 2019-07-16 19:19:23
---

## 目的

本文详细介绍了Chatops的实现服务Rocketchat的安装。

<!--more-->

## 安装

### **方法一：**

**1，启动mongodb实例：**

```bash
docker run --name db -d mongo:3.0 --smallfiles
```

**2，启动rocketchat server:**

注意替换your_public_ip

```bash
docker run --name rocketchat -p 80:3000 --env ROOT_URL=http://{your_public_ip} --link db -d rocket.chat:0.62
```

启动成功后，访问: http://{your_public_ip} 即可。

**3，hubot实例:（最新版本，脚本目录映射有问题，请自行去掉）**

添加robot前，确保server中已添加改账号，并设置了邮件为已验证。

```bash
docker run -it -d --name rocketchat-hubot -e ROCKETCHAT_URL=http://{rocket_chat_server_ip}:{port}  -e ROCKETCHAT_ROOM='general'  -e LISTEN_ON_ALL_PUBLIC=true   -e ROCKETCHAT_USER=bot   -e ROCKETCHAT_PASSWORD=password     -e ROCKETCHAT_AUTH=password    -e BOT_NAME=bot     -e EXTERNAL_SCRIPTS=hubot-pugme,hubot-help    -v $PWD/scripts:/home/hubot/scripts   rocketchat/hubot-rocketchat
```

说明（下面未提及，不用更改）:

```
rocket_chat_server_ip: server地址
ROCKETCHAT_ROOM: 默认加入的channel（房间），可以不填
ROCKETCHAT_USER: robot名字, 例如: cicd-robot, git-merge-robot
ROCKETCHAT_PASSWORD: 密码
$PWD/scripts:/home/hubot/scripts: 本地scripts脚本映射到容器
内
```

### 方法二：

1，编辑yaml文件

docker-compose.yml

```yaml
db:

  image: mongo:3.0
  command: mongod --smallfiles

rocketchat:

  image: rocket.chat:0.62

  environment:

    - MONGO_URL=mongodb://db:27017/rocketchat

    - ROOT_URL=http://10.10.0.137:3000

    - Accounts_UseDNSDomainCheck=False

  links:

    - db:db

  ports:

    - 3000:3000

hubot:

  image: rocketchat/hubot-rocketchat

  environment:

    - ROCKETCHAT_URL=http://10.10.0.137:3000

    - ROCKETCHAT_ROOM=GENERAL

    - ROCKETCHAT_USER=Hubot

    - ROCKETCHAT_PASSWORD=Sun123456

    - BOT_NAME=Hubot

    - EXTERNAL_SCRIPTS=hubot-help,hubot-seen,hubot-links,hubot-greetings
    
    - HUBOT_JENKINS_URL=10.10.0.137:8080

    - HUBOT_JENKINS_AUTH=admin:admin123

  links:

    - rocketchat:rocketchat
```

```shell
2, 安装docker-compose
pip install docker-compose
3, 启动容器
docker-compose up
```

4,  注册管理员账号

![img](1.png)

5，添加bot账号（账号要和docker-compose中定义的用户名和密码一致）

![img](2.png)

![img](3.png)

![img](4.png)

![img](5.png)

6，重启所有容器，docker-compose restart

7,  验证

![img](6.png)

8，测试脚本sun.coffee

```coffeescript
module.exports = (robot) ->
  # 匹配所有 hi 相关的输入，然后发送 hello 到聊天室
  robot.hear /hi/i, (res) ->
    res.send 'hello'
```

9, 复制脚本到容器中

```bash
docker cp ./sun.coffee root_hubot_1:/home/hubot/scripts
```

10，重启容器

```bash
docker restart root_hubot_1
docker exec -u root -it root_hubot_1 /bin/bash
```

11，验证

![img](7.png)