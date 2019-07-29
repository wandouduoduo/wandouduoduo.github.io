---
title: tmux参考手册
categories:
  - 应用运维
tags:
  - Linux
copyright: true
abbrlink: a5e32f5
date: 2019-07-29 09:21:26
---

tmux可以在一个屏幕中创建多个session，window，pane等，可以从一个屏幕中分离并继续在后台运行，以后可以重新连接。

<!--more-->

### Session控制:

```shell
`#直接创建session``tmux`` ``#查看session``tmux ``ls`` ``#创建名字为wkl39883的session``tmux new -s wkl39883`` ``#attach到名字为wkl39883的session``tmux a -t wkl39883`` ``#attch到session, 同时踢掉其他所有attac``tmux a -t wkl39883 -d`
```

 

![img](file:///var/folders/13/5_qy4sz928nbrf6spnjzf5kr0000gn/T/WizNote/17de5170-40f4-494a-8bb4-680a07f210f9/index_files/52787115.png)

![img](file:///var/folders/13/5_qy4sz928nbrf6spnjzf5kr0000gn/T/WizNote/17de5170-40f4-494a-8bb4-680a07f210f9/index_files/52798175.png)