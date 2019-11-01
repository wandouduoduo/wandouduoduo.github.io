---
title: Centos7上配置最新版openldap服务多主模式(镜像模式)
categories:
  - 运维技术
  - 服务部署
tags:
  - Openldap
copyright: true
abbrlink: 3337f7d4
date: 2019-08-28 13:54:54
---

## 目的

在实际产线运维环境下，使用最多的就是镜像模式，当然多IDC机房的情况下也会结合使用其他模式，例如主从模式。

镜像模式只允许2个主节点，如果超过2个节点其他节点只会同步获取前面2个节点的配置（这个是博客文档里面看到的，没有验证）

## 环境

|    主机名称     |     地址     |     版本      |             角色              |  备注  |
| :-------------: | :----------: | :-----------: | :---------------------------: | :----: |
| sysldap-shylf-1 | 10.116.72.11 | CentOS7.6 min | openLdap, httpd, phpldapadmin | 主节点 |
| sysldap-shylf-2 | 10.116.72.12 | CentOS7.6 min | openLdap, httpd, phpldapadmin | 主节点 |
| systerm-shylf-1 | 10.116.72.15 | CentOS7.6 min |        openLdap client        |        |

前提条件，为了方便配置防火墙以及禁用selinux
配置示例:dc=example,dc=com

<!--more-->

## OpenLDAP服务基础配置

本文档假设2个节点都已经设置好了[OpenLDAP服务基础配置](https://wandouduoduo.github.io/articles/be8d00d3.html#more)

## 配置OpenLDAP 双主结构（mirrormode）

### OpenLDAP的2个主节点都需要添加模块syncprov

**`2个主节点都需要执行`**

```bash
vim mod_syncprov.ldif

dn: cn=module,cn=config
objectClass: olcModuleList
cn: module
olcModulePath: /usr/lib64/openldap
olcModuleLoad: syncprov.la

# 发送配置使之生效
ldapadd -Y EXTERNAL -H ldapi:/// -f mod_syncprov.ldif

#--------------------------------------
vim syncprov.ldif
dn: olcOverlay=syncprov,olcDatabase={2}hdb,cn=config
objectClass: olcOverlayConfig
objectClass: olcSyncProvConfig
olcOverlay: syncprov
olcSpSessionLog: 100

# 发送配置使之生效
ldapadd -Y EXTERNAL -H ldapi:/// -f syncprov.ldif
```

### 主节点1配置(10.116.72.11)同步

需要根据实际情况修改的参数：
provider 同步来源，也就是主节点，可以包含多个主节点
binddn 主节点管理账户
credentials 主节点管理账户密码
searchbase 根目录
**`特别主机：2个主节点属性 olcServerID的值不能相同，provider指向对方`**

```bash
vim master_node_1.ldif
dn: cn=config
changetype: modify
replace: olcServerID
olcServerID: 0

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcSyncRepl
olcSyncRepl: rid=001
  provider=ldap://10.116.72.12:389/
  bindmethod=simple
  binddn="cn=Manager,dc=example,dc=com"
  credentials=openldap
  searchbase="dc=example,dc=com"
  scope=sub
  schemachecking=on
  type=refreshAndPersist
  retry="30 5 300 3"
  interval=00:00:05:00
-
add: olcMirrorMode
olcMirrorMode: TRUE

dn: olcOverlay=syncprov,olcDatabase={2}hdb,cn=config
changetype: add
objectClass: olcOverlayConfig
objectClass: olcSyncProvConfig
olcOverlay: syncprov

# 发送配置使之生效
ldapadd -Y EXTERNAL -H ldapi:/// -f master_node_1.ldif
```

### 主节点2配置(10.116.72.12)同步

**特别主机：2个主节点属性 olcServerID的值不能相同，provider指向对方**

```bash
vim master_node_2.ldif

dn: cn=config
changetype: modify
replace: olcServerID
olcServerID: 1

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcSyncRepl
olcSyncRepl: rid=001
  provider=ldap://10.116.72.11:389/
  bindmethod=simple
  binddn="cn=Manager,dc=example,dc=com"
  credentials=openldap
  searchbase="dc=example,dc=com"
  scope=sub
  schemachecking=on
  type=refreshAndPersist
  retry="30 5 300 3"
  interval=00:00:05:00
-
add: olcMirrorMode
olcMirrorMode: TRUE

dn: olcOverlay=syncprov,olcDatabase={2}hdb,cn=config
changetype: add
objectClass: olcOverlayConfig
objectClass: olcSyncProvConfig
olcOverlay: syncprov

# 发送配置使之生效
ldapadd -Y EXTERNAL -H ldapi:/// -f master_node_2.ldif 
```

- 验证

```bash
从服务节点验证数据是否同步正常
ldapsearch -x -b 'ou=People,dc=example,dc=com'
[输出内容省略]

验证是OK的。
```

### 远程主机配置（客户端 10.116.72.15）

客户端 可以指定多个openldap uri 修改配置如下（当然也可以只配置其中1个）

```bash
authconfig --enableldap --enableldapauth --ldapserver="10.116.72.11,10.116.72.12" --ldapbasedn="dc=example,dc=com" --update
```

- 验证

```bash
ssh  800001@10.116.72.15
Warning: Permanently added '10.116.72.15' (ECDSA) to the list of known hosts.
800001@10.116.72.15's password: 
Last login: Thu Jul  4 17:59:32 2019 from 10.116.71.200

[800001@systerm-shylf-1 ~]$ 
```

