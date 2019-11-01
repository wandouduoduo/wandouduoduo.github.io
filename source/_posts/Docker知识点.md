---
title: Docker知识点
categories:
  - 容器化
  - Docker
tags:
  - Docker
copyright: true
abbrlink: 1e48ce52
date: 2019-10-24 22:08:06
---

## 目的

运维日常工作中常见服务的docker快速安装汇总。



cadvisor docker监控

```
docker run —cpu-period=100000 —cpu-quota=100000 -m 1g --volume=/:/rootfs:ro --volume=/var/run:/var/run:rw --volume=/sys:/sys:ro --volume=/var/lib/docker/:/var/lib/docker:ro --publish=9999:8080 --name=cadvisor google/cadvisor -storage_driver=influxdb -storage_driver_db=cadvisor -storage_driver_host=172.18.203.15:8086 -storage_driver_user=cadvisor -storage_driver_password=cadvisor
```

<!--more-->

启动postgresql容器

```
docker run pgsql -p 0.0.0.0:5432:5432 -e POSTGRES_PASSWORD=jftest123 -v /data/postgres:/var/lib/postgresql/data -d postgres
```



启动rocketmq namesrv 容器 

```
docker run --name rmq-namesrv \
--net=host \
-v $PWD/test/namesrv/logs:/opt/logs \
-v $PWD/test/namesrv/store:/opt/store \
-d registry-nexus.jr.qa.ly.com:10013/rocketmq-namesrv:4.2.0
```



启动rocketmq broker 容器

```
docker run --name rmq-broker \
--net=host \
-v $PWD/test/broker/logs:/opt/logs \
-v $PWD/test/broker/store:/opt/store \
-v $PWD/test/broker/conf:/opt/conf \
-d registry-nexus.jr.qa.ly.com:10013/rocketmq-broker:4.2.0 sh /opt/rocketmq-4.2.0/bin/mqbroker -c /opt/conf/broker.properties
```



过滤ip

```
grep -E -o "172.18.[0-9]{1,3}[\.][0-9]{1,3}" filename
```



linux删除乱码

```
find . ! -regex '.*\.jar\|.*\.war\|.*\.zip'|xargs rm
```



ansible命令

```
ansible rabbitmq -m shell -a "cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.20180315"
ansible rabbitmq -m shell -a "mv /etc/haproxy/template.cfg.bak /etc/haproxy/haproxy.bak"
ansible rabbitmq -m shell -a "mv /etc/haproxy/template.cfg /etc/haproxy/haproxy.cfg"
ansibel rabbitmq -m shell -a "/etc/init.d/haproxy restart"
```



inluxdb保留策略

```
SHOW RETENTION POLICIES ON cadvisor
CREATE RETENTION POLICY "15_days" ON "cadvisor" DURATION 15d REPLICATION 1 DEFAULT
drop retention POLICY "15_days" ON "cadvisor"
```



elasticsearch

标准配置

```
cluster.name: sunelk
node.name: node-195
path.data: /home/es/elasticsearch/data/
path.logs: /home/es/elasticsearch/logs/

bootstrap.memory_lock: false
bootstrap.system_call_filter: false

node.master: true   
node.data: false   
node.ingest: false   
search.remote.connect: false 

network.host: 0.0.0.0  

http.port: 9200

discovery.zen.ping.unicast.hosts: ["10.10.0.193", "10.10.0.194","10.10.0.195"]     
                                                                        
discovery.zen.minimum_master_nodes: 2 
      
http.cors.enabled: true                                                                                                                                                                                                   
http.cors.allow-origin: "*"
```



验证

http://10.10.0.195:9200/_cat/nodes?v

http://10.10.0.195:9200/_cluster/health

集群健康状况

curl '192.168.77.128:9200/_cluster/health?pretty'

集群详细情况

curl '192.168.77.128:9200/_cluster/state?pretty'