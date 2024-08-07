---
title: ansible实例
categories:
  - 配置管理
  - Ansible
tags:
  - Ansible
copyright: true
abbrlink: 1d90220
date: 2020-07-13 16:19:23
---

## 目录

实例一：执行curl命令发送post请求

实例二：直接发送post请求



<!--more-->



## 实例一

执行curl命令发送post请求进行报警

```yaml
---
- hosts: tengine
  remote_user: root
  tasks:
    - name: Rsync tengine config
      synchronize: src=/root/tengine-inte-conf/inte-conf/{{ ansible_host }}/ dest=/opt/tengine/conf/conf.d/ delete=yes compress=yes
    
    - name: Test tengine config
      command: /opt/tengine/sbin/nginx -t
      register: result
      ignore_errors: true

    - name: Reload config
      command: /opt/tengine/sbin/nginx -s reload 
      when: result is not failed

    - name: Send Alert
      command: curl -H "Content-Type:application/json"  -X POST -d "{'app':'e7775bf8-3855-509d-d924-7c7e3efd7df0','eventId':'88888','eventType':'trigger','alarmName':'TengineConfError','entityName':'{{ ansible_host }}-tengineconf','entityId':'88888','alarmContent':'{{ ansible_host }}-tengineconf','priority':'2'}" http://api.onealert.com/alert/api/event/zabbix/v3 
      when: result is failed
```

## 实例二

直接发送post请求进行报警

```
---
- hosts: tengine
  remote_user: root
  tasks:
    - name: Rsync tengine config
      synchronize: src=/root/tengine-inte-conf/inte-conf/{{ ansible_host }}/ dest=/opt/tengine/conf/conf.d/ delete=yes compress=yes
    
    - name: Test tengine config
      command: /opt/tengine/sbin/nginx -t
      register: result
      ignore_errors: true

    - name: Reload config
      command: /opt/tengine/sbin/nginx -s reload 
      when: result is not failed

    - name: Send Alert
      uri:
         url: http://api.onealert.com/alert/api/event/zabbix/v3 
         method: POST
         body: "{'app':'e7775bf8-3855-509d-d924-7c7e3efd7df0','eventId':'88888','eventType':'trigger','alarmName':'TengineConfError','entityName':'{{ ansible_host }}-tengineconf','entityId':'88888','alarmContent':'{{ ansible_host }}-tengineconf','priority':'2'}"
         body_format: json
         force_basic_auth: no
         headers:
             Content-Type: "application/json"
      when: result is failed
```

