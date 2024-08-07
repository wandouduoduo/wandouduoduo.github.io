---
title: nginx之location匹配优先级及顺序
categories:
  - Web服务
  - Nginx
tags:
  - Nginx
copyright: true
abbrlink: 292b349b
date: 2021-06-04 17:12:43
---

nginx的使用范围和影响越来越广，很多大厂都在使用，但有些工作多年的同学可能都搞不清楚nginx中location的匹配优先级和匹配顺序是怎样的。今天又有同事不清楚，写配置时总是达不到业务需求，问到我这边帮他搞定了。那么本文就给大家详细聊聊这个问题。

<!--more-->

## 干货

nginx的安装和搭建这里就不再赘述了。无论你是直接命令包库yum或apt-get安装还是下载源码包编译安装等等，看你喜好。

nginx是通过server块中location的配置用来匹配不同url访问：

location配置匹配方式主要包括三种：**精准匹配**、**普通匹配**和**正则匹配**

**定义**

location = expression   精准匹配
location expression      普通匹配
location ^~ expression 普通匹配
location ~ regex 正则匹配（区分大小写）
location ~* regex 正则匹配（不区分大小写）

**要求**

精准匹配要求uri与表达式（expression）完全匹配。
普通匹配要求uri与表达式满足前缀匹配。
正则匹配要求uri与正则表达式匹配。



**匹配优先级和顺序规则**

**精准匹配（=）**  >  **普通匹配（^~）**  >  **正则匹配（~或~*）** >  **普通匹配（直接目录）**

1、首先精准匹配，如能匹配，则进行转发。如未能匹配成功，则进行普通匹配（^~）。
2、nginx将uri和所有^~类型的普通匹配规则进行匹配。如有多条规则均命中，则选择最长匹配。匹配成功后，进行转发。否则，则进行正则匹配。
3、正则匹配与顺序有关，按编写顺序进行匹配，一旦匹配成功，则转发请求并停止匹配。匹配不成功，则进行普通匹配（location expression ）
4、进行普通匹配（location expression），匹配成功则转发，不成功则返回错误码。



