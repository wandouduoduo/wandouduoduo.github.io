---
title: proxy_pass后加不加斜杠的区别
categories:
  - Web服务
  - Nginx
tags:
  - Nginx
copyright: true
abbrlink: 98a39ceb
date: 2019-06-05 14:50:08
---

## 背景

在nginx中配置proxy_pass时，当在后面的url上加不加/，区别是如此的大呢。

如加上了/，相当于是绝对根路径，则nginx不会把location中匹配的路径部分代理走;

如果没有加/，则会把匹配的路径部分也给代理走。 

<!--more-->

## Location的目录匹配详解

```shell
没有“/”时，可以模糊匹配字符串本身和后面所有
例如：location /abc/def可以匹配/abc/defghi请求，也可以匹配/abc/def/ghi等

而有“/”时，只能匹配后面
例如：location /abc/def/不能匹配/abc/defghi请求，只能匹配/abc/def/anything这样的请求
```



## Proxy_pass后url区别详解

下面四种情况分别用http://192.168.1.4/proxy/test.html 进行访问。

### **第一种：加/**

```shell
location  /proxy/ {
		proxy_pass http://127.0.0.1:81/;
}
```

结论：会被代理到http://127.0.0.1:81/test.html 这个url

 

### **第二种: 不加/**

```shell
location  /proxy/ {
		proxy_pass http://127.0.0.1:81;
}
```

结论：会被代理到http://127.0.0.1:81/proxy/test.html 这个url

 

### **第三种:  加目录加/**：

```shell
location  /proxy/ {
		proxy_pass http://127.0.0.1:81/ftlynx/;
}
```

结论：会被代理到http://127.0.0.1:81/ftlynx/test.html 这个url。

 

### **第四种：加目录不加/**：

```
location  /proxy/ {
		proxy_pass http://127.0.0.1:81/ftlynx;
}
```

结论：会被代理到http://127.0.0.1:81/ftlynxtest.html 这个url

## 总结

location目录字符串后加/，就只能匹配后面，不加不仅可以匹配后面还可字符串模糊匹配。

proxy_pass加/, 代理地址就不加location匹配目录; 不加/，代理直接就加目录。