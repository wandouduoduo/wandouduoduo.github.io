---
title: python操作gitlab API接口
categories:
  - 编程积累
  - Python
tags:
  - Git
  - Python
copyright: true
abbrlink: 79cf2ce7
date: 2019-06-10 17:09:34
---

使用 `python-gitlab` 模块来调用gitlab的API来管理和操作gitlab。

## 参考

[官方文档](http://python-gitlab.readthedocs.io/en/stable/)

<!--more-->

## 安装

```
pip install python-gitlab
# 如果是安装到Python3使用可以使用如下命令
pip3 install python-gitlab
```

## 配置

为了保护API 用到的 private_token，一般会将其写到系统的配置文件中去
`/etc/python-gitlab.cfg` 或者 `~/.python-gitlab.cfg`

配置示例：

```shell
vim ~/.python-gitlab.cfg

[global]
default = sun
ssh_verify = False
timeout = 8

[sun]
url = http://10.0.0.6
private_token = xxxxx-V4Yxxxxxxks7u
api_version = 3
```

## 实例

在程序中使用的时候可以直接用如下方式调用

```shell
## login
gl = gitlab.Gitlab.from_config('sun', ['~/.python-gitlab.cfg'])
## 得到第一页project列表
projects = gl.projects.list()
## 得到所有project
projects = gl.projects.list(all=True)
projects = gl.projects.all()
```

## 附件脚本

自定义脚本获取指定用户或者分组或者全部的代码仓库地址

```python
#!/usr/bin/env python3
# encoding: utf-8

__Author__ = 'Sun'
__Date__ = '2019--6-10'

import gitlab
import os
import sys

class GitlabAPI(object):
    def __init__(self, *args, **kwargs):
        if os.path.exists('/etc/python-gitlab.cfg'):
            self.gl = gitlab.Gitlab.from_config('sun', ['/etc/python-gitlab.cfg'])
        elif os.path.exists(os.getenv('HOME') + '/.python-gitlab.cfg'):
            self.gl = gitlab.Gitlab.from_config('kaishugit', [os.getenv('HOME') + '/.python-gitlab.cfg'])
        else:
            print('You need to make sure there is a file named "/etc/python-gitlab.cfg" or "~/.python-gitlab.cfg"')
            sys.exit(5)

    def get_user_id(self, username):
        user = self.gl.users.get_by_username(username)
        return user.id

    def get_group_id(self, groupname):
        group = self.gl.users.search(groupname)
        return group[0].id

    def get_all_projects(self):
        projects = self.gl.projects.list(all=True)
        result_list = []
        for project in projects:
            result_list.append(project.http_url_to_repo)
        return result_list

    def get_user_projects(self, userid):
        projects = self.gl.projects.owned(userid=userid, all=True)
        result_list = []
        for project in projects:
            result_list.append(project.http_url_to_repo)
        return result_list

    def get_group_projects(self, groupname):
        projects = self.gl.projects.owned(groupname=groupname, all=True)
        result_list = []
        for project in projects:
            result_list.append(project.http_url_to_repo)
        return result_list

if __name__ == '__main__':
    git = GitlabAPI()
    userprojects = git.get_user_projects()
    print(userprojects)
```