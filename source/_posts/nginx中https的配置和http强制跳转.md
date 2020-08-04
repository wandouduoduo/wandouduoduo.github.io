---
title: nginx中https的配置和http强制跳转
categories:
  - Web服务
  - Nginx
tags:
  - Nginx
copyright: true
abbrlink: ebb4cd52
date: 2019-09-20 19:11:13
---

## 背景

随着现在网络互联网的告诉发展，给人们带来的很多便利，但也出现了很多隐患。作为站长，网站的安全至关重要。怎么做才安全呢？建议把http改为https，因为增加了证书认证，相对来说就会安全很多，并且对用户的体验也比较好，谁也不想访问个网站，在地址栏中显示不安全或直接显示不安全等。



<!--more-->



## 环境

centos7



## 前提

1，nginx有安装ssl模块，这样才可以使用证书。[参考文档](https://wandouduoduo.github.io/articles/88000f44.html)

2，购买或申请获取的证书文件。



## 配置教程

### 放置证书

```
mkdir -p /usr/local/nginx/conf/ssl
cp 证书.zip /usr/local/nginx/conf/ssl/
cd /usr/local/nginx/conf/ssl/
unzip 证书.zip
```

### 配置https

```bash
server {
    listen       443 ssl;

    server_name wandouduoduo.com;
    root /opt/www/webapps/;
    index index.html index.htm;
	
	include block.conf;

    ssl_session_cache shared:SSL:100m;
    ssl_session_timeout  5m;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    ssl_certificate     ssl/证书.pem;
    ssl_certificate_key ssl/证书.key;

    #禁止在header中出现服务器版本，防止黑客利用版本漏洞攻击
    server_tokens off;

    location / {
         try_files $uri $uri/ =404;
    }

}
```

### 配置强制跳转

```bash

server {
    listen      80;
    server_name xxxxx;
    rewrite ^(.*) https://$server_name$1 permanent;
    }

```

## 总结

根据上述配置就可实现https，并让http强制跳转到https。



## 补充

nginx防SQL注入与文件注入等相关安全设置

可以把下面内容写个配置文件block.conf，在server块中include。如上面配置教程中

```bash
#禁止sql注入
if ($query_string ~* ".*[\;\'\<\>].*" ){
    return 404;
}
if ($request_uri ~* "(cost\()|(concat\()") {
    return 404;
}
if ($request_uri ~* "[+|(%20)]union[+|(%20)]") {
    return 404;
}
if ($request_uri ~* "[+|(%20)]and[+|(%20)]") {
    return 404;
}
if ($request_uri ~* "[+|(%20)]select[+|(%20)]") {
    return 404;
}
if ($query_string ~ "(<|%3C).*script.*(>|%3E)") {
    return 404;
}
if ($query_string ~ "GLOBALS(=|[|%[0-9A-Z]{0,2})") {
    return 404;
}
if ($query_string ~ "_REQUEST(=|[|%[0-9A-Z]{0,2})") {
    return 404;
}
if ($query_string ~ "proc/self/environ") {
    return 404;
}
if ($query_string ~ "mosConfig_[a-zA-Z_]{1,21}(=|%3D)") {
    return 404;
}
if ($query_string ~ "base64_(en|de)code(.*)") {
    return 404;
}
if ($query_string ~ "select") {
    return 404;
}
 
#禁止文件注入 
## Block file injections
set $block_file_injections 0;
if ($query_string ~ "[a-zA-Z0-9_]=(\.\.//?)+") {
set $block_file_injections 1;
}
if ($query_string ~ "[a-zA-Z0-9_]=/([a-z0-9_.]//?)+") {
    set $block_file_injections 1;
}
if ($block_file_injections = 1) {
    return 444;
}
 
## 禁掉溢出攻击
set $block_common_exploits 0;
if ($query_string ~ "(<|%3C).*script.*(>|%3E)") {
set $block_common_exploits 1;
}
if ($query_string ~ "GLOBALS(=|[|%[0-9A-Z]{0,2})") {
    set $block_common_exploits 1;
}
if ($query_string ~ "_REQUEST(=|[|%[0-9A-Z]{0,2})") {
    set $block_common_exploits 1;
}
if ($query_string ~ "proc/self/environ") {
    set $block_common_exploits 1;
}
if ($query_string ~ "mosConfig_[a-zA-Z_]{1,21}(=|%3D)") {
    set $block_common_exploits 1;
}
if ($query_string ~ "base64_(en|de)code(.*)") {
    set $block_common_exploits 1;
}
if ($block_common_exploits = 1) {
    return 444;
}
 
## 禁spam字段
set $block_spam 0;
if ($query_string ~ "b(ultram|unicauca|valium|viagra|vicodin|xanax|ypxaieo)b") {
set $block_spam 1;
}
if ($query_string ~ "b(erections|hoodia|huronriveracres|impotence|levitra|libido)b") {
set $block_spam 1;
}
if ($query_string ~ "b(ambien|bluespill|cialis|cocaine|ejaculation|erectile)b") {
set $block_spam 1;
}
if ($query_string ~ "b(lipitor|phentermin|pro[sz]ac|sandyauer|tramadol|troyhamby)b") {
set $block_spam 1;
}
if ($block_spam = 1) {
    return 444;
}
 
## 禁掉user-agents
set $block_user_agents 0;
# Don’t disable wget if you need it to run cron jobs!
#if ($http_user_agent ~ "Wget") {
# set $block_user_agents 1;
#}
# Disable Akeeba Remote Control 2.5 and earlier
if ($http_user_agent ~ "Indy Library") {
set $block_user_agents 1;
}
# Common bandwidth hoggers and hacking tools.
if ($http_user_agent ~ "libwww-perl") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "GetRight") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "GetWeb!") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "Go!Zilla") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "Download Demon") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "Go-Ahead-Got-It") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "TurnitinBot") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "GrabNet") {
set $block_user_agents 1;
}
if ($http_user_agent ~ "WebBench") {
    set $block_user_agents 1;
}
if ($http_user_agent ~ "ApacheBench") {
    set $block_user_agents 1;
}
if ($http_user_agent ~ ^$) {
    set $block_user_agents 1;
}
if ($http_user_agent ~ "Python-urllib") {
    set $block_user_agents 1;
}
if ($block_user_agents = 1) {
return 444;
}
```

