---
title: Linux用法技巧
categories:
  - 学习教程
  - Linux详解
tags:
  - Linux
copyright: true
abbrlink: 1d19f8d4
date: 2019-06-06 11:46:28
---

## 目的

根据自己多年的工作经历和经验，对日常中的细节技巧和用法进行归纳和总结。

持续更新中...

<!--more-->

## 技巧详解

### 指定特定用户执行命令

```shell
sudo -H -u www bash -c 'nohup /home/web/ke/upfileserver /home/web/ke/up/conf.json &'
```

### 统计机器中网络连接各个状态个数

```shell
netstat` `-an | ``awk` `'/^tcp/ {++S[$NF]}  END {for (a in S) print a,S[a]} '
```