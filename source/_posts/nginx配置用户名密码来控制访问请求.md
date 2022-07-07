---
title: nginx配置用户名密码来控制访问请求
categories:
  - Web服务
  - Nginx
tags:
  - Nginx
copyright: true
abbrlink: edfb0ad9
date: 2021-06-08 11:06:56
---

今天接了个需求：要把一些资源文件从外网提供给客户下载。处于安全和简单快捷考虑，分享一个快速实现并安全性很强的方案：nginx配置账号密码来控制，并且密码还是加密的，再增加白名单配置。此方案简单快捷和安全。

<!--more-->

## 方案

### **安装 htpasswd 工具**

```bash
yum install httpd-tools -y
```

设置用户名和密码，并把用户名、密码保存到指定文件中：

```bash
[sun@bogon conf]$ sudo mkdir passwd
[sun@bogon conf]$ sudo htpasswd -c passwd/passwd sun
New password: 
Re-type new password: 
Adding password for user sun
[sun@bogon conf]$ cat passwd/passwd 
sun:$apr1$J5Sg0fQD$KDM3Oypj8Wf9477PHDIzA0
```

注意：上面的 passwd/passwd 是生成密码文件的路径，绝对路径是/etc/nginx/passwd/passwd ，然后sun是用户名，你可以根据需要自行设置成其它用户名。运行命令后，会要求你连续输入两次密码。输入成功后，会提示已经为sun这个用户添加了密码。
查看下生成的密码文件的内容：

```
[sun@bogon conf]$ cat passwd/passwd 
sun:$apr1$J5Sg0fQD$KDM3Oypj8Wf9477PHDIzA0
```

其中用户名就是sun，分号后面就是密码（已经加过密）。

 

### **修改 nginx 配置文件**

找到 nginx 配置文件，因为我们要对整个站点开启验证，所以在配置文件中的第一个server修改如下：

```conf
server {
    listen 80;
    server_name  localhost;
    .......
    #新增下面两行
    auth_basic "Please input password"; #这里是验证时的提示信息
    auth_basic_user_file /etc/nginx/passwd/passwd; # 这里是密码文件，可以填写绝对路径
    location /{
    .......
    root  /data;
    autoindex on;
    autoindex_exact_size off;
    }
```

然后nginx重新加载reload：    

以上都配置无误后，你重新访问你的站点，如果出现需要身份验证的弹窗就说明修改成功了。

 

## 干货

### **htpasswd命令**

htpasswd命令选项参数说明：

```
-c 创建一个加密文件
-n 不更新加密文件，只将htpasswd命令加密后的用户名密码显示在屏幕上 
-m 默认htpassswd命令采用MD5算法对密码进行加密
-d htpassswd命令采用CRYPT算法对密码进行加密
-p htpassswd命令不对密码进行进行加密，即明文密码
-s htpassswd命令采用SHA算法对密码进行加密
-b htpassswd命令行中一并输入用户名和密码而不是根据提示输入密码
-D 删除指定的用户
```

 

### **htpasswd例子**

**利用htpasswd命令添加用户**

```bash
htpasswd -bc ./.passwd sun pass
```

在当前目录下生成一个.passwd文件，用户名sandu，密码：pass，默认采用MD5加密方式

**在原有密码文件中增加下一个用户**

```bash
htpasswd -b ./.passwd sun1 pass
```

去掉c选项，即可在第一个用户之后添加第二个用户，依此类推

**不更新密码文件，只显示加密后的用户名和密码**

```bash
htpasswd -nb sun pass
```

不更新.passwd文件，只在屏幕上输出用户名和经过加密后的密码

**利用htpasswd命令删除用户名和密码**

```bash
htpasswd -D .passwd sun
```

**利用 htpasswd 命令修改密码**

```bash
htpasswd -D .passwd sun
htpasswd -b .passwd sun pass
```






