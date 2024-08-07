---
title: glusterfs集群横向扩容缩容
categories:
  - 数据库
tags:
  - GlusterFS
copyright: true
abbrlink: '9e838829'
date: 2021-05-26 11:14:28
---

glusterfs集群的搭建和使用这里就不再赘述了，可以看以前的教程文档。本文主要聊的是随着服务使用量的增加，那么存储集群势必要扩充空间。服务器迁移，需要先扩容后缩容等等。所以本文的主旨是聊glusterfs集群的横向优化：扩容和缩容。

<!--more-->

## 现状

**集群搭建这里忽略**
查看glusterfs的节点和客户端挂载情况得知，目前是三个节点的**分布式卷**。

```bash
#查看节点数量
root@wyl01:/gsclient# gluster peer status
Number of Peers: 2
Hostname: 192.168.52.123
Uuid: 0f07e396-fc0d-476c-884a-2cfb154f48d4
State: Peer in Cluster (Connected)
Hostname: 192.168.52.124
Uuid: 173df46f-a90a-4b0a-a5d0-834a17df17f6
State: Peer in Cluster (Connected)
#挂载 
root@wyl01:/# mount -t glusterfs 192.168.52.122:gv1 /gsclient/
root@wyl01:/gsclient# df -h
Filesystem Size Used Avail Use% Mounted on
udev 1.9G 0 1.9G 0% /dev
tmpfs 395M 972K 394M 1% /run
/dev/vda3 49G 3.4G 44G 8% /
tmpfs 2.0G 0 2.0G 0% /dev/shm
tmpfs 5.0M 0 5.0M 0% /run/lock
tmpfs 2.0G 0 2.0G 0% /sys/fs/cgroup
/dev/loop0 90M 90M 0 100% /snap/core/8039
/dev/loop1 89M 89M 0 100% /snap/core/6964
/dev/vda2 190M 80M 97M 46% /boot
tmpfs 395M 0 395M 0% /run/user/0
/dev/vdb 196G 62M 186G 1% /data
192.168.52.122:gv1 588G 8.1G 580G 2% /gsclient
```

创建20个文件

查看文件的分布情况如下：

```bash
# 第1台
root@wyl01:/data# ls
10.txt 11.txt 12.txt 14.txt 15.txt 16.txt 18.txt 1.txt 20.txt 2.txt 3.txt 6.txt lost+found

# 第2台
root@gluster002-hf-aiui:/data# ls
13.txt 17.txt 19.txt 4.txt 8.txt lost+found

# 第3台
root@gluster003-hf-aiui:/data# ls
5.txt 7.txt 9.txt lost+found

```

## 分布式卷优化

### 添加节点扩容

现要对集群进行扩容，增加一个节点 gluster004-hf-aiui.

```bash
# 添加一个节点
root@wyl01:/gsclient# gluster peer probe 192.168.52.125
peer probe: success.
root@wyl01:/gsclient# gluster peer status
Number of Peers: 3
Hostname: 192.168.52.123
Uuid: 0f07e396-fc0d-476c-884a-2cfb154f48d4
State: Peer in Cluster (Connected)
Hostname: 192.168.52.124
Uuid: 173df46f-a90a-4b0a-a5d0-834a17df17f6
State: Peer in Cluster (Connected)
Hostname: 192.168.52.125
Uuid: f6578f82-adb4-4529-b803-eedde37cb550
State: Peer in Cluster (Connected)

# 增加一个brick
root@wyl01:/gsclient# gluster volume add-brick gv1 192.168.52.125:/data force
volume add-brick: success

# 查看卷的信息
root@wyl01:/gsclient# gluster volume info
Volume Name: gv1
Type: Distribute
Volume ID: 110caace-b49f-4493-8792-bc2982319c23
Status: Started
Snapshot Count: 0
Number of Bricks: 4
Transport-type: tcp
Bricks:
Brick1: 192.168.52.122:/data
Brick2: 192.168.52.123:/data
Brick3: 192.168.52.124:/data
Brick4: 192.168.52.125:/data
Options Reconfigured:
performance.client-io-threads: on
transport.address-family: inet
nfs.disable: on
```

再创建30个文件，如下所示：

```bash
root@wyl01:/gsclient# touch {101..130}.txt
# 第 1 台
root@wyl01:/gsclient# ls /data/
101.txt 107.txt 10.txt 112.txt 114.txt 117.txt 11.txt 122.txt 12.txt 14.txt 15.txt 16.txt 18.txt 1.txt 20.txt 2.txt 3.txt 6.txt lost+found

# 第 2 台
root@wyl02:/data# ls
105.txt 115.txt 116.txt 124.txt 125.txt 127.txt 128.txt 129.txt 13.txt 17.txt 19.txt 4.txt 8.txt lost+found

# 第 3 台
root@wyl03-hf-aiui:/data# ls
102.txt 103.txt 104.txt 106.txt 108.txt 109.txt 110.txt 111.txt 121.txt 130.txt 5.txt 7.txt 9.txt lost+found

# 第 4 台
root@wyl04-hf-aiui:/data# ls
113.txt 118.txt 119.txt 120.txt 123.txt 126.txt lost+found
```

结论：可以看出当扩容后，原先的数据不会均衡到第四台glusterfs上，但是新增加的文件是可以的。

### 分布式卷数据rebalance

```bash
root@wyl01:/gsclient# gluster volume rebalance gv1 start
volume rebalance: gv1: success: Rebalance on gv1 has been started successfully. Use rebalance status command to check status of the rebalance process.
ID: 76b07497-b26d-438f-bd6f-7659a9aba251
root@wyl01:/gsclient# gluster volume rebalance gv1 status
Node Rebalanced-files size scanned failures skipped status run time in h:m:s

------

192.168.52.123 4 0Bytes 13 0 0 completed 0:00:00
192.168.52.124 1 0Bytes 14 0 0 completed 0:00:00
192.168.52.125 0 0Bytes 6 0 0 completed 0:00:00
localhost 12 0Bytes 18 0 0 completed 0:00:01
volume rebalance: gv1: success
#第 1 台
root@wyl01:/gsclient# ls /data/
101.txt 107.txt 112.txt 114.txt 117.txt 122.txt 13.txt 17.txt 4.txt 8.txt lost+found
#第 2 台
root@wyl02-hf-aiui:/data# ls
105.txt 115.txt 116.txt 124.txt 125.txt 127.txt 128.txt 129.txt 19.txt 9.txt lost+found
#第 3 台
root@wyl03-hf-aiui:/data# ls
100.txt 102.txt 103.txt 104.txt 106.txt 108.txt 109.txt 110.txt 111.txt 121.txt 130.txt 2.txt 5.txt 7.txt lost+found
#第 4 台
root@wyl04-hf-aiui:/data# ls
10.txt 113.txt 118.txt 119.txt 11.txt 120.txt 123.txt 126.txt 12.txt 14.txt 15.txt 16.txt 18.txt 1.txt 20.txt 3.txt 6.txt lost+found
```

可以看到，数据rebalance，第 4 台上的数据明显增加了。

这里有一个需要注意的地方，当数据量太大的时候，对数据进行rebalance必须要考虑的一个问题就是性能，不能因为数据rebalance而影响我们的存储的正常使用。Glusterfs也考虑到了这个问题，在进行数据rebalance时，根据实际场景不同设计了三种不同的“级别”：

**lazy**：每次仅可以迁移一个文件
**normal**：默认设置，每次迁移2个文件或者是(CPU逻辑个数-4)/2,哪个大，选哪个
**aggressive**：每次迁移4个文件或者是(CPU逻辑个数-4)/2
通过以下命令进行配置：

```
gluster volume set VOLUME-NAME cluster.rebal-throttle [lazy|normal|aggressive]
```

如将volume repvol设置为lazy

```bash
[root@nwyl01 ~]# gluster volume set gv1 cluster.rebal-throttle lazy
volume set: success
```

### 分布式卷缩容

缩容之前我们先需要将数据迁移到其他的brick上，假设我们移除gluster004-hf-aiui节点

```bash
root@wyl01:/gsclient# gluster volume remove-brick gv1 gluster004-hf-aiui:/data help
Usage:
volume remove-brick <VOLNAME> [replica <COUNT>] <BRICK> ... <start|stop|status|commit|force>

root@wyl01:/gsclient# gluster volume remove-brick gv1 gluster004-hf-aiui:/data start
Running remove-brick with cluster.force-migration enabled can result in data corruption. It is safer to disable this option so that files that receive writes during migration are not migrated.
Files that are not migrated can then be manually copied after the remove-brick commit operation.
Do you want to continue with your current cluster.force-migration settings? (y/n) y
volume remove-brick start: success
ID: e30a9e72-53ef-4e79-a394-38dcac9061ba

#查看移除节点的状态
root@wyl01:/gsclient# gluster volume remove-brick gv1 gluster004-hf-aiui:/data status
Node Rebalanced-files size scanned failures skipped status run time in h:m:s

------

192.168.52.125 17 0Bytes 17 0 0 completed 0:00:00

# 移除前先将数据同步到其他brick上
root@wyl01:/gsclient# gluster volume remove-brick gv1 gluster004-hf-aiui:/data commit
volume remove-brick commit: success
Check the removed bricks to ensure all files are migrated.
If files with data are found on the brick path, copy them via a gluster mount point before re-purposing the removed brick.
```


移除后，我们看数据的分布情况

```bash
# 第 1 台
root@wyl01:/gsclient# ls /data/
101.txt 107.txt 112.txt 114.txt 117.txt 122.txt 13.txt 17.txt 4.txt 8.txt lost+found

# 第 2 台
root@wyl02-hf-aiui:/data# ls
105.txt 115.txt 116.txt 124.txt 125.txt 127.txt 128.txt 129.txt 19.txt 9.txt lost+found

# 第 3 台
root@wyl03-hf-aiui:/data# ls
100.txt 103.txt 106.txt 109.txt 110.txt 113.txt 119.txt 120.txt 123.txt 12.txt 14.txt 16.txt 1.txt 2.txt 5.txt 7.txt
102.txt 104.txt 108.txt 10.txt 111.txt 118.txt 11.txt 121.txt 126.txt 130.txt 15.txt 18.txt 20.txt 3.txt 6.txt lost+found
```

可以看到文件被迁移到其他的brick上了。

## 复制卷的扩容rebalance缩容

```bash
root@wyl01:/gsclient# gluster volume info # 卷的基本信息
Volume Name: gv1
Type: Replicate
Volume ID: ff65e899-4f30-4249-9cf4-532a7d4eab74
Status: Started
Snapshot Count: 0
Number of Bricks: 1 x 2 = 2
Transport-type: tcp
Bricks:
Brick1: 192.168.52.122:/data
Brick2: 192.168.52.123:/data
Options Reconfigured:
transport.address-family: inet
nfs.disable: on
performance.client-io-threads: off

# 创建20个文件
root@wyl01:/gsclient# touch {1..20}.txt

# 查看分布情况
# 第 1 台
root@wyl01:/gsclient# ls /data/
10.txt 11.txt 12.txt 13.txt 14.txt 15.txt 16.txt 17.txt 18.txt 19.txt 1.txt 20.txt 2.txt 3.txt 4.txt 5.txt 6.txt 7.txt 8.txt 9.txt lost+found

# 第 2 台
root@wyl02-hf-aiui:/data# ls
10.txt 11.txt 12.txt 13.txt 14.txt 15.txt 16.txt 17.txt 18.txt 19.txt 1.txt 20.txt 2.txt 3.txt 4.txt 5.txt 6.txt 7.txt 8.txt 9.txt lost+found
添加gluster003和gluster004两个节点
```

### 添加gluster003 节点
```
root@wyl01:/gsclient# gluster peer probe 192.168.52.124
peer probe: success.
```

### 添加gluster04 节点
```
root@wyl01:/gsclient# gluster peer probe 192.168.52.125
peer probe: success.
```

### 查看peer信息
```bash
root@wyl01:/gsclient# gluster peer status
Number of Peers: 3
Hostname: 192.168.52.123
Uuid: 0f07e396-fc0d-476c-884a-2cfb154f48d4
State: Peer in Cluster (Connected)
Hostname: 192.168.52.124
Uuid: 173df46f-a90a-4b0a-a5d0-834a17df17f6
State: Peer in Cluster (Connected)
Hostname: 192.168.52.125
Uuid: f6578f82-adb4-4529-b803-eedde37cb550
State: Peer in Cluster (Connected)

# 扩容brick

root@wyl01:/gsclient# gluster volume add-brick gv1 replica 2 192.168.52.124:/data 192.168.52.125:/data force
volume add-brick: success

# 查看卷的信息

root@wyl01:/gsclient# gluster volume info
Volume Name: gv1
Type: Distributed-Replicate
Volume ID: ff65e899-4f30-4249-9cf4-532a7d4eab74
Status: Started
Snapshot Count: 0
Number of Bricks: 2 x 2 = 4
Transport-type: tcp
Bricks:
Brick1: 192.168.52.122:/data
Brick2: 192.168.52.123:/data
Brick3: 192.168.52.124:/data
Brick4: 192.168.52.125:/data
Options Reconfigured:
transport.address-family: inet
nfs.disable: on
performance.client-io-threads: off
```


发现现在变成2*2了模式了。重新写入20个txt文件，扩容后这里需要注意的是必须先rebalance。然后重新写入文件才会hash到新的节点上。之前的旧数据也会被rebalance。

```bash
root@wyl01:/gsclient# gluster volume rebalance gv1 start
volume rebalance: gv1: success: Rebalance on gv1 has been started successfully. Use rebalance status command to check status of the rebalance process.
ID: 90df529c-d950-4010-9248-19ffa7c83853
```


节点的缩容，这里是分布式复制，所以缩容也是成对节点的一起缩容，操作如下：

```bash
# 开始移除节点

root@wyl01:/gsclient# gluster volume remove-brick gv1 replica 2 wyl03-hf-aiui:/data wyl04-hf-aiui:/data start
Replica 2 volumes are prone to split-brain. Use Arbiter or Replica 3 to avaoid this. See: http://docs.gluster.org/en/latest/Administrator%20Guide/Split%20brain%20and%20ways%20to%20deal%20with%20it/.
Do you still want to continue?
(y/n) y
Running remove-brick with cluster.force-migration enabled can result in data corruption. It is safer to disable this option so that files that receive writes during migration are not migrated.
Files that are not migrated can then be manually copied after the remove-brick commit operation.
Do you want to continue with your current cluster.force-migration settings? (y/n) y
volume remove-brick start: success
ID: d4ce7df1-30c9-4124-9986-c9634986609f

# 移除前先将数据同步到其他brick上
root@wyl01:/gsclient# gluster volume remove-brick gv1 replica 2 wyl03-hf-aiui:/data wyl04-hf-aiui:/data commit
Replica 2 volumes are prone to split-brain. Use Arbiter or Replica 3 to avaoid this. See: http://docs.gluster.org/en/latest/Administrator%20Guide/Split%20brain%20and%20ways%20to%20deal%20with%20it/.
Do you still want to continue?
(y/n) y
volume remove-brick commit: success
Check the removed bricks to ensure all files are migrated.
If files with data are found on the brick path, copy them via a gluster mount point before re-purposing the removed
```


