---
title: git拉取项目下单个目录
categories:
  - 应用运维
tags:
  - Git
copyright: true
abbrlink: 25be17f8
date: 2019-10-24 22:13:58
---

有时git库里的东西比较多，我们只希望像SVN一样，只拉取git库的一个目录。

例如：基础代码仓库infra-code_ops有很多基础代码，我们只想拉取仓库里nginx-conf目录的文件。

```bash
$ git init infra-code_ops-nginx && cd  infra-code_ops-nginx          //初始化仓库,并进入该目录
$ git remote add -f origin http:``//gitlab.xxx.com/ops/infra-code_ops.git   //添加远程仓库地址
$ git config core.sparsecheckout ``true    //开启sparse checkout功能
$ echo ``"nginx-conf/"` `>> .git/info/sparse-checkout   //将nginx-conf/目录写入到该文件中
$ cat .git/info/sparse-checkout   //确认查看该文件内容
$ git pull origin master    //拉取远程master分支
```

