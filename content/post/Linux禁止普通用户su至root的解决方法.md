---
title: Linux禁止普通用户su至root的解决方法
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 952bb64d
date: 2021-08-31 17:38:53
---

很多朋友不清楚linux如何禁止普通用户su到root，这里需要修改两个配置文件，具体详细配置大家通过本文了解下吧


<!--more-->

## 概述

为禁止普通用户su至root，需要分别修改/etc/pam.d/su和/etc/login.defs两个配置文件。

## 配置

(1)**去除**/etc/pam.d/su文件中如下行的注释：

```sh
#auth      required    pam_wheel.so use_uid
```


(2)在／etc/login.defs文件中加入如下配置项：

```sh
SU_WHEEL_ONLY  yes
```


经过上述配置后，普通用户将被禁止su至root，如果希望指定普通用户su至root，可以执行如下命令将该用户添加至wheel组中：

```sh
usermod -G wheel username
```

## 示例

```sh
[root@titan ~]# id apple
uid=1001(apple) gid=1001(fruit) 组=1001(fruit),10(wheel)
[root@titan ~]# id banana
uid=1002(banana) gid=1001(fruit) 组=1001(fruit)

```

验证apple

```sh
[apple@titan ~]$ su - root
[root@titan ~]#
```

验证banana

```
[banana@titan ~]$ su - root
su: 拒绝权限
[banana@titan ~]$
```



## 总结

以上所述是站长给大家介绍的Linux禁止普通用户su至root的解决方法，希望对大家有所帮助，如果大家有任何疑问请给我留言，站长会及时回复大家的。

