---
title: 神级的Go开源项目
date: 2019-05-27 14:05:01
categories: Go
tags:
- Go

---


## golang/go
介绍：  
Go（又称Golang）是Google开发的一种静态强类型、编译型、并发型，并具有垃圾回收功能的编程语言。go本身，也是用go语言实现的，包括他的编译器。与C++相比，Go并不包括如枚举、异常处理、继承、泛型、断言、虚函数等功能，但增加了 切片(Slice) 型、并发、管道、垃圾回收、接口（Interface）等特性的语言级支持。Go 2.0版本将支持泛型，对于断言的存在，则持负面态度，同时也为自己不提供类型继承来辩护。

star数：53789  
地址：
[https://github.com/golang/go](https://github.com/golang/go)

<!-- more -->
## Docker
介绍：  
Docker项目在2014年9月份就拿到了C轮4000万美元融资，版本迭代速度超快，目前从GitHub看到已有78个版本，而它仅仅是再2013年初才正式开始的一个项目而已。目前，国内Docker技术推广也进行的如火如荼，比如 Docker中文社区，CSDN也建立了 Docker专区。CSDN CODE也将在近期与Docker中文社区合作，推出Docker技术文章翻译活动，届时也请大家多多关注，及时关注与参与。Docker团队之所以喜欢用Go语言，主要是Go具有强大的标准库、全开发环境、跨平台构建的能力。  

star数：52339  
地址：
[https://github.com/moby/moby](https://github.com/moby/moby)（Docker的新马甲）

## Kubernetes
介绍：  
Kubernetes是Google开源的一个容器编排引擎，它支持自动化部署、大规模可伸缩、应用容器化管理。在生产环境中部署一个应用程序时，通常要部署该应用的多个实例以便对应用请求进行负载均衡。在Kubernetes中，我们可以创建多个容器，每个容器里面运行一个应用实例，然后通过内置的负载均衡策略，实现对这一组应用实例的管理、发现、访问，而这些细节都不需要运维人员去进行复杂的手工配置和处理。  

star数：48830  
地址：
[https://github.com/kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)

## Lantern
介绍：  
蓝灯，翻墙利器。  

star数：40492  
地址：
[https://github.com/getlantern/lantern](https://github.com/getlantern/lantern)

## ETCD
介绍：  
etcd是由CoreOS开发并维护键值存储系统，它使用Go语言编写，并通过Raft一致性算法处理日志复制以保证强一致性。目前，Google的容器集群管理系统Kubernetes、开源PaaS平台Cloud Foundry和CoreOS的Fleet都广泛使用了etcd。Fleet则是一个分布式的初始化系统。它们之所以选择使用Go语言，则是因为Go语言对跨平台的良好支持，以及其背后的强大社区。  

star数：23187  
地址：
[https://github.com/etcd-io/etcd](https://github.com/etcd-io/etcd)

## InfluxDB
介绍：  
一个Go语音编写的开源分布式的时序、事件和指标数据库，无需外部依赖。其设计目标是实现分布式和水平伸缩扩展。  

star数：15681  
地址：
[https://github.com/influxdata/influxdb](https://github.com/influxdata/influxdb)

## Hugo
介绍：  
一款极速的静态页面生成器，让你可以很快的搭建个人网站，提供了多套主题可供使用，并且可以自己定制，和NodeJS的Hexo是一样的。  

star数：33044  
地址：
[https://github.com/gohugoio/hugo](https://github.com/gohugoio/hugo)

## grafana
介绍：  
一款开源监控度量的看板系统，可以接Graphite,Elasticsearch,InfluxDB等数据源，定制化很高。  

star数：27027  
地址：
[https://github.com/grafana/grafana](https://github.com/grafana/grafana)

## Codis
介绍：  
Codis是一个分布式Redis解决方案,其实就是一个数据库代理，让你在使用Redis集群的时候，就像使用单机版的Redis是一样的，对开发者透明。  

star数：8840  
地址：
[https://github.com/CodisLabs/codis](https://github.com/CodisLabs/codis)

## gin & beego
介绍：  
两个快速开发Go应用的http框架，很好用很简洁，笔者亲测。  

star数：分别为24692和19086  
地址：
分别为[https://github.com/gin-gonic/gin](https://github.com/gin-gonic/gin)和[https://github.com/astaxie/beego](https://github.com/astaxie/beego)

## prometheus
介绍：  
Prometheus是一个开源监控系统，它前身是SoundCloud的警告工具包。从2012年开始，许多公司和组织开始使用Prometheus。该项目的开发人员和用户社区非常活跃，越来越多的开发人员和用户参与到该项目中。目前它是一个独立的开源项目，且不依赖与任何公司。为了强调这点和明确该项目治理结构，Prometheus在2016年继Kurberntes之后，加入了Cloud Native Computing Foundation。  

star数：22325  
地址：
[https://github.com/prometheus/prometheus](https://github.com/prometheus/prometheus)

## Consul
介绍：  
Consul 是 HashiCorp 公司推出的开源工具，用于实现分布式系统的服务发现与配置。与其他分布式服务注册与发现的方案，Consul的方案更“一站式”，内置了服务注册与发现框架、分布一致性协议实现、健康检查、Key/Value存储、多数据中心方案，不再需要依赖其他工具（比如ZooKeeper等）。  

star数：15040  
地址：
[https://github.com/hashicorp/consul](ttps://github.com/hashicorp/consul)

## nsq
介绍：  
NSQ是Go语言编写的，开源的分布式消息队列中间件，其设计的目的是用来大规模地处理每天数以十亿计级别的消息。NSQ 具有分布式和去中心化拓扑结构，该结构具有无单点故障、故障容错、高可用性以及能够保证消息的可靠传递的特征，是一个成熟的、已在大规模生成环境下应用的产品。  

star数：14559  
地址：
[https://github.com/nsqio/nsq](https://github.com/nsqio/nsq)

## awesome-go
介绍：  
这不是一个go项目，他是一个学习go的资料网站，属于著名的awesome系列，里面关于go的资源非常详细。  

star数：40465  
地址：
[https://github.com/avelino/awesome-go](https://github.com/avelino/awesome-go)

## open-falcon
介绍：  
越来越fashion的监控系统，小米开源。  

star数：4267  
地址：
[https://github.com/open-falcon/falcon-plus](https://github.com/open-falcon/falcon-plus)

## TiDB
介绍：  
TiDB 是一个分布式 NewSQL 数据库。它支持水平弹性扩展、ACID 事务、标准 SQL、MySQL 语法和 MySQL 协议，具有数据强一致的高可用特性，是一个不仅适合 OLTP 场景还适合 OLAP 场景的混合数据库。    

star数：17508  
地址：
[https://github.com/pingcap/tidb](https://github.com/pingcap/tidb)
