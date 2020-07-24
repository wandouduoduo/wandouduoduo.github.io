---
title: Linux中swap分区详解
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 273ef9c3
date: 2020-07-22 14:08:21
---

## 介绍

在Linux下，swap的作用类似Windows系统下的“虚拟内存”。当物理内存不足时，拿出部分硬盘空间当SWAP分区（虚拟成内存）使用，从而解决内存容量不足的情况。

swap意思是交换，顾名思义，当某进程向OS请求内存发现不足时，OS会把内存中暂时不用的数据交换出去，放在swap分区中，这个过程称为SWAP OUT。当某进程又需要这些数据且OS发现还有空闲物理内存时，又会把swap分区中的数据交换回物理内存中，这个过程称为SWAP IN。

当然，swap大小是有上限的，一旦swap使用完，操作系统会触发OOM-Killer机制，把消耗内存最多的进程kill掉以释放内存。

<!--more-->

## swap阈值设定

swap阈值的设定意义是物理内存使用多少时，就使用swap交换分区。

#### 查看当前系统swap阈值 

```bash
# cat/proc/sys/vm/swappiness 
60 
```

如上面得到的阈值，就表示 内存在使用到100-60=40%的时候，就开始使用swap交换分区

**两个极限值设定**

当swappiness设置为0时，表示最大限度使用物理内存, 所有物理内存都用完后，才使用swap空间。 
当swappiness设定为100时，表示积极使用swap分区，并且把内存上的数据及时的搬运到swap空间中。 



#### 临时设定 

```bash
sudosysctlvm.swappiness=10
```



#### 永久设定 

```bash
echo "vm.swappiness=10" >>/etc/sysctl.conf 
sudosysctl -p 
cat /proc/sys/vm/swappiness

10 
```



## 创建swap分区

```bash
# 创建一个4G的文件作为swap分区
dd if=/dev/zero of=swapfile bs=1M count=4096 
# 每个块大小为1M，数量为4096个，则总大小为4G的文件。

# 格式化成swap分区
mkswap swapfile 

# 启用swap分区
swapon swapfile

#开机自动挂载
vim /etc/fstab (在fstab中增加一条记录如下)

/opt/swapfile swap swap defaults 0 0

# 关闭swap分区
swapoff  swapfile 
free  -m 
```




