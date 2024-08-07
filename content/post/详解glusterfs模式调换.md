---
title: 详解glusterfs模式调换
categories:
  - 数据库
tags:
  - GlusterFS
copyright: true
abbrlink: 895840ae
date: 2020-09-28 15:11:41
---

`glusterfs`集群存储有七种模式，在搭建集群时选择的模式，可能在使用过一段时间后发现当前的模式不是最优的方案，换种模式可能会更好。那么怎么在保证数据安全的情况下，对`glusterfs`集群更改模式，以最优适配我们的使用，最大化资源利用呢？本文就这一痛点详细说明。

<!--more-->

## 环境说明

**glusterfs集群**

搭建好的glusterfs集群，这里不再赘述。如有疑问，请参考[CentOS7安装GlusterFS集群教程](https://wandouduoduo.github.io/articles/afd78e52.html)

![](1.png)

**模式更改**

从复制模式改为扩展模式。搭建是可能是出于数据安全考虑，采用复制模式，但我们是作为日志存储来使用的，那么大的磁盘空间就是首要考虑的，所以采用扩展模式更好些。

![](2.png)

## 教程步骤

### 移除brick

```bash
语法：
gluster volume remove-brick 卷名 brick所在的IP：brick所在的地址

gluster volume remove-brick gsfs gs02:/opt/gluster/data gs03:/opt/gluster/data commit

Removing brick(s) can result in data loss. Do you want to Continue? (y/n) y
volume remove-brick commit: failed: Removing bricks from replicate configuration is not allowed without reducing replica count explicitly.
```

根据上面命令语法执行，但是失败了，根据提示需要先减少replica的数量

```bash
gluster volume remove-brick gsfs replica 1 gs02:/opt/gluster/data gs03:/opt/gluster/data force

Removing brick(s) can result in data loss. Do you want to Continue? (y/n) y
volume remove-brick commit force: success
```

执行上面的命令将复本数从3降到1。

![](3.png)

### GlusterFS磁盘操作

```bash
# 停止磁盘
gluster volume stop gsfs

# 删除磁盘
gluster volume delete gsfs
```

为什么要删除呢？删除了是否会影响数据安全行呢？

答案是：GlusterFS在选择模式创建的磁盘是虚拟磁盘，删除虚拟磁盘，实际磁盘上的数据并不会有影响。安全性和可靠性是没有问题的，数据全部存在实际磁盘上。而要删除的必要性是因为更改模式时，还要创建虚拟磁盘，如果不删除，就会报磁盘存在而创建不成功。

### 更改扩展模式

```bash
gluster volume create gsfs gs01:/opt/gluster/data gs02:/opt/gluster/data gs03:/opt/gluster/data force

volume create: gsfs: success: please start the volume to access data
```

![](4.png)

```
# 磁盘启动
gluster volume start gsfs
# 重新挂载
mount -t glusterfs gs01:gsfs /mnt
# 查看
df -h
# 检查挂载盘
ls -lrt /mnt/ 
```

![](5.png)

模式已经更改为扩展模式了。

![](6.png)

可以看到挂载后的磁盘包含了原复制模式下的3份文件，而且都是相同的。这是因为实际文件是存在磁盘上，而集群的虚拟磁盘把他们汇总了。只需要把其他两个节点上数据删除，就只保留一份文件了。以后的文件会平衡分配到集群节点，也可以执行磁盘平衡命令手动平衡。

```
gluster volume models lay-outstart
```

## 总结

根据上面教程，复制模式就变为了扩展模式。这两种模式日常用的最多。其他的模式，大家可以根据上面思路，自行测试。要摘除节点需要先移除brick，要移除brick需先减少复制文本的份数。