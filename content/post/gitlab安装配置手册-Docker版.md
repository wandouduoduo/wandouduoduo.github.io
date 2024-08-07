---
title: gitlab安装配置手册(Docker版)
categories:
  - 容器技术
tags:
  - Git
  - Docker
copyright: true
abbrlink: 87b11c95
date: 2019-07-24 14:32:39
---

## 目的

使用Docker容器来快速安装配置和使用的gitlab



## 参考

[gitlab官网镜像](https://hub.docker.com/r/twang2218/gitlab-ce-zh/)

<!--more-->

## 安装

```yaml
# 构建外挂目录
mkdir -p /data/gitlab/{config,logs,data}

# 编辑docker-compose.yml
# 其中访问ip,访问port,ssh_port根据自己情况，自己替换
version: '3'
services:
    web:
      image: 'twang2218/gitlab-ce-zh:10.5'
      container_name: sungitlab
      restart: always
      hostname: '访问ip'
      environment:
        TZ: 'Asia/Shanghai'
        GITLAB_OMNIBUS_CONFIG: |
          external_url 'http://访问ip:访问port'
          gitlab_rails['gitlab_shell_ssh_port'] = ssh_port
          unicorn['port'] = 8888
          nginx['listen_port'] = 8080
      ports:
        - '访问port:8080'
        - '8443:443'
        - 'ssh_port:22'
      volumes:
        - /data/gitlab/config:/etc/gitlab
        - /data/gitlab/data:/var/opt/gitlab
        - /data/gitlab/logs:/var/log/gitlab

# 启动
docker-compost up -d
```



## 配置优化

### **限制worker进程数**

默认配置中，worker进程数与本机CPU个数一致，会大量占用内存，导致容器的内存持续增长，直至服务宕机，报5xx

解决方案：修改/data/gitlab/config/gitlab.rb中配置

```shell
############################################################
## GitLab Unicorn
##! Tweak unicorn settings.
##! Docs: https://docs.gitlab.com/omnibus/settings/unicorn.html
############################################################

# unicorn['worker_timeout'] = 60
###! Minimum worker_processes is 2 at this moment
###! See https://gitlab.com/gitlab-org/gitlab-ce/issues/18771
unicorn['worker_processes'] = 2 # 去除原注释，指定worker数和分配的CPU个数一致
```

**然后重启**

### 启用邮件通知

编辑 /data/gitlab/config/gitlab.rb

```shell
……之前配置略……
### Email Settings
# gitlab_rails['gitlab_email_enabled'] = true
gitlab_rails['gitlab_email_from'] = 'xxxxx'
# gitlab_rails['gitlab_email_display_name'] = 'xxxxx'
# gitlab_rails['gitlab_email_reply_to'] = 'noreply@example.com'
gitlab_rails['gitlab_email_subject_suffix'] = '[xxx.gitlab]'
……
### GitLab email server settings
###! Docs: https://docs.gitlab.com/omnibus/settings/smtp.html
###! **Use smtp instead of sendmail/postfix.**
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "xxxx"
gitlab_rails['smtp_port'] = 25
gitlab_rails['smtp_user_name'] = "xxxxx"
gitlab_rails['smtp_password'] = "xxxxx"
# gitlab_rails['smtp_domain'] = "xxxxx"
gitlab_rails['smtp_authentication'] = "login"
gitlab_rails['smtp_enable_starttls_auto'] = true
# gitlab_rails['smtp_tls'] = false
……
```

## 使用

### 备份操作

##### **Gitlab的备份目录路径设置**

```shell
vim /data/gitlab/config/gitlab.rb

gitlab_rails['manage_backup_path'] = true
gitlab_rails['backup_path'] = "/data/gitlab/backups"   //gitlab备份目录
gitlab_rails['backup_archive_permissions'] = 0644      //生成的备份文件权限
gitlab_rails['backup_keep_time'] = 7776000             //备份保留天数为3个月（即90天，这里是7776000秒）

mkdir -p /data/gitlab/backups
chown -R git.git /data/gitlab/backups
chmod -R 777 /data/gitlab/backups

gitlab-ctl reconfigure  #重新加载配置
```

##### **GItlab备份操作**

```shell
# 手动备份
cd /data/gitlab/backups/
gitlab-rake gitlab:backup:create
#上面步骤是自动备份，查看备份文件
ll 
-rw-r--r-- 1 git git 245760 Nov 12 15:33 1510472027_2017_11_12_9.4.5_gitlab_backup.tar
```

```shell
#自动备份
cd /data/gitlab/backups/
#编写备份脚本
vim gitlab_backup.sh

#!/bin/bash
/usr/bin/gitlab-rake gitlab:backup:create CRON=1

注意：环境变量CRON=1的作用是如果没有任何错误发生时， 抑制备份脚本的所有进度输出

#编写备份脚本，结合crontab实施自动定时备份，比如每天0点、6点、12点、18点各备份一次
0 0,6,12,18 * * * /bin/bash -x /data/gitlab/backups/gitlab_backup.sh > /dev/null 2>&1
```

### 恢复操作

注意：GItlab只能还原到与备份文件相同的gitlab版本。

##### 停止相关数据连接服务

```shell
gitlab-ctl stop unicorn
gitlab-ctl stop sidekiq
gitlab-ctl status
```

##### 恢复

```shell
#进入目录
cd /data/gitlab/backups
#查看备份
ll
-rw-r--r-- 1 git git 245760 Nov 12 15:33 1510472027_2017_11_12_9.4.5_gitlab_backup.tar
#Gitlab的恢复操作会先将当前所有的数据清空，然后再根据备份数据进行恢复
gitlab-rake gitlab:backup:restore BACKUP=1510472027_2017_11_12_9.4.5
# 启动
gitlab-ctl start
# 验证检查
gitlab-rake gitlab:check SANITIZE=true
```

