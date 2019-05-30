---
title: 阿里Java神级诊断工具arthas
categories: 
- 编程语言
- Java
tags: 
- Java
copyright: true
date: 2019-05-30 16:56:21
---

## 介绍

在阿里巴巴内部，有很多自研工具供开发者使用，其中有一款工具，是几乎每个Java开发都使用过的工具，那就是**Arthas**，这是一款**Java诊断工具**，是一款牛逼**带闪电的工具**。该工具已于2018年9月份开源。

[GitHub 地址](https://github.com/alibaba/arthas)

[用户文档](https://alibaba.github.io/arthas/)

![](阿里Java神级诊断工具arthas/1.png)

在日常开发中，你是否遇到过以下问题：

> 1. 这个类从哪个 jar 包加载的？为什么会报各种类相关的 Exception？
> 2. 我改的代码为什么没有执行到？难道是我没 commit？分支搞错了？
> 3. 遇到问题无法在线上 debug，难道只能通过加日志再重新发布吗？
> 4. 线上遇到某个用户的数据处理有问题，但线上同样无法 debug，线下无法重现！
> 5. 是否有一个全局视角来查看系统的运行状况？
> 6. 有什么办法可以监控到JVM的实时运行状态？

以上问题，通通可以通过Arthas来进行问题诊断！！！是不是很好很强大。

<!--more-->

Arthas支持JDK 6+，采用命令行交互模式，同时提供丰富的 `Tab` 自动补全功能，进一步方便进行问题的定位和诊断。

## Arthas 安装

### 使用arthas-boot 安装

下载arthas-boot.jar，然后用java -jar的方式启动：

1. ```bash
   wget https://alibaba.github.io/arthas/arthas-boot.jar
   java -jar arthas-boot.jar
   ```

   如果下载速度比较慢，可以使用aliyun的镜像：

   ```bash
   java -jar arthas-boot.jar --repo-mirror aliyun --use-http
   
   #下载完后出现：
   [INFO] Download arthas success.
   [INFO] arthas home: /root/.arthas/lib/3.0.5/arthas
   [INFO] Try to attach process 1664
   [INFO] Attach process 1664 success.
   [INFO] arthas-client connect 127.0.0.1 3658
     ,---.  ,------. ,--------.,--.  ,--.  ,---.   ,---.                           
    /  O  \ |  .--. ''--.  .--'|  '--'  | /  O  \ '   .-'                          
   |  .-.  ||  '--'.'   |  |   |  .--.  ||  .-.  |`.  `-.                          
   |  | |  ||  |\  \    |  |   |  |  |  ||  | |  |.-'    |                         
   `--' `--'`--' '--'   `--'   `--'  `--'`--' `--'`-----'                          
                                                                                   
    
   wiki: https://alibaba.github.io/arthas
   version: 3.0.5
   pid: 1664
   time: 2018-12-09 14:19:13
   ```

### 使用脚本一键安装

Arthas 支持在 Linux/Unix/Mac 等平台上一键安装，请复制以下内容，并粘贴到命令行中，敲 回车 执行即可：

```bash
curl -L https://alibaba.github.io/arthas/install.sh | sh
```

上述命令会下载启动脚本文件 as.sh 到当前目录，你可以放在任何地方或将其加入到 $PATH 中。

直接在shell下面执行./as.sh，就会进入交互界面。

也可以执行./as.sh -h来获取更多参数信息。