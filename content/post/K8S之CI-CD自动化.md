---
title: K8S之CI/CD自动化
categories:
  - 容器编排
  - K8s
tags:
  - K8s
copyright: true
abbrlink: 8a3a5c96
date: 2020-06-28 17:27:59
---

## 简介

CICD 是 持续集成（Continuous Integration）和持续部署（Continuous Deployment）简称。指在开发过程中自动执行一系列脚本来减低开发引入 bug 的概率，在新代码从开发再到部署的过程中，尽量减少人工的介入。

![](1.png)

<!--more-->

## 部署流程

### 流程图

大致的部署流程是这样的：开发人员把写好的项目代码通过git提交到gitlab，然后通过gitlab  webhook触发Jenkins自动构建，先从代码仓库gitlab上拉取代码，进行打包、生成镜像。然后自动把镜像推送到镜像仓库Harbor；在部署的时k8s集群从镜像仓库Harbor上拉取镜像进行创建容器和启动，最终发布完成，然后可以用外网访问。

仓库流程：代码仓库（git，svn）-->镜像仓库（maven，harbor）-->k8s集群

![](2.png)

当然啦，上面只是粗略的，请看下图才更加形象。

![](3.png)

