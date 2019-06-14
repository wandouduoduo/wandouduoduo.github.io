---
title: sftp和ftp文件传输服务
categories:
  - 应用运维
  - 服务搭建
tags:
  - Linux
copyright: true
abbrlink: 81de25e2
date: 2019-06-12 14:47:28
---

## 适用场景

我们平时习惯了使用ftp来上传下载文件，尤其是很多Linux环境下，我们一般都会通过第三方的SSH工具连接到Linux，但是当我们需要传输文件到Linux服务器当中，很多人习惯用ftp来传输，其实Linux默认是不提供ftp的，需要你额外安装FTP服务器。而且ftp服务器端会占用一定的VPS服务器资源。其实更建议使用sftp代替ftp。理由如下：

1. 可以不用额外安装任何服务器端程序
2. 会更省系统资源。
3. SFTP使用加密传输认证信息和传输数据，相对来说会更安全。
4. 也不需要单独配置，对新手来说比较简单(开启SSH默认就开启了SFTP)。

<!--more-->

## 主要区别

FTP是一种文件传输协议，一般是为了方便数据共享的。包括一个FTP服务器和多个FTP客户端。FTP客户端通过FTP协议在服务器上下载资源。而SFTP协议是在FTP的基础上对数据进行加密，使得传输的数据相对来说更安全。但是这种安全是以牺牲效率为代价的，也就是说SFTP的传输效率比FTP要低(不过现实使用当中，没有发现多大差别)。

摘抄来自百度百科

sftp是Secure File Transfer Protocol的缩写，安全[文件传送协议](https://baike.baidu.com/item/文件传送协议)。可以为传输文件提供一种安全的网络的加密方法。sftp 与 ftp 有着几乎一样的语法和功能。SFTP 为 [SSH](https://baike.baidu.com/item/SSH/10407)的其中一部分，是一种传输档案至 Blogger 伺服器的安全方式。其实在SSH软件包中，已经包含了一个叫作SFTP(Secure File Transfer Protocol)的安全文件信息传输子系统，SFTP本身没有单独的[守护进程](https://baike.baidu.com/item/守护进程)，它必须使用sshd守护进程（[端口](https://baike.baidu.com/item/端口)号默认是22）来完成相应的连接和答复操作，所以从某种意义上来说，SFTP并不像一个[服务器](https://baike.baidu.com/item/服务器)程序，而更像是一个客户端程序。SFTP同样是使用加密传输认证信息和传输的数据，所以，使用SFTP是非常安全的。但是，由于这种传输方式使用了加密/[解密技术](https://baike.baidu.com/item/解密技术)，所以[传输效率](https://baike.baidu.com/item/传输效率)比普通的[FTP](https://baike.baidu.com/item/FTP/13839)要低得多，如果您对网络安全性要求更高时，可以使用SFTP代替FTP。

## 创建通信账号

### 添加sftp组

```shell
groupadd sftp
```

### 新增用户

创建一个sftp用户，用户名为mysftp，密码为mysftp

修改用户密码和修改[Linux](http://lib.csdn.net/base/linux)用户密码是一样的。

```shell
useradd -g sftp -s /bin/false mysftp  #用户名
passwd mysftp  #密码
```

### 创建登陆默认访问路径

sftp组的用户的home目录统一指定到/data/sftp下，按用户名区分，这里先新建一个mysftp目录，然后指定mysftp的home为/data/sftp/mysftp

```shell
mkdir -p /data/sftp/mysftp  
usermod -d /data/sftp/mysftp mysftp
```

### 修改sftp配置

```
vi /etc/ssh/sshd_config

#找到如下这行，用#符号注释掉，大致在文件末尾处。
# Subsystem      sftp    /usr/libexec/openssh/sftp-server 

#在文件最后面添加如下几行内容，然后保存。
Subsystem       sftp    internal-sftp    
Match Group sftp    
ChrootDirectory /data/sftp/%u    
ForceCommand    internal-sftp    
AllowTcpForwarding no    
X11Forwarding no 
```

### 设定Chroot目录权限

```shell
chown root:sftp /data/sftp/mysftp  
chmod 755 /data/sftp/mysftp  
```

### 建立SFTP用户登入后可写入的目录

照上面设置后，在重启sshd服务后，用户mysftp已经可以登录。但使用chroot指定根目录后，根应该是无法写入的，所以要新建一个目录供mysftp上传文件。这个目录所有者为mysftp，所有组为sftp，所有者有写入权限，而所有组无写入权限。命令如下：

```shell
mkdir /data/sftp/mysftp/upload  
chown mysftp:sftp /data/sftp/mysftp/upload  
chmod 755 /data/sftp/mysftp/upload 
```

用ChrootDirectory将用户的根目录指定到/data/BJIP-JAVA/histmp/ ，这样用户就只能在/data/BJIP-JAVA/histmp/下活动。

创建登陆默认访问路径
 mkdir -p /appdata/BJIP-JAVA/histmp/
 usermod -d /appdata/BJIP-JAVA/histmp/ liuxing
1
2
配置目录权限
chmod -R 755 /appdata/BJIP-JAVA/histmp/
chown liuxing:sftp /appdata/BJIP-JAVA/histmp/
1
2
修改sftp配置
用ChrootDirectory将用户的根目录指定到/appdata/BJIP-JAVA/histmp/ ，这样用户就只能在/appdata/BJIP-JAVA/histmp/下活动。

### 重启sshd服务

```shell
service sshd restart
```



## 其他服务器上传文件

登陆服务器192.168.1.199建立文件夹/usr/sunxu，并上传至192.168.1.200默认路径(-d为debug模式)
/data/sftp/mysftp/upload

```shell
用法：lftp 用户名:密码@ftp地址:传送端口（默认21）
```

```shell
#此处命令在服务器192.168.1.199执行

mkdir /usr/sunxu
lftp "sftp://用户名:密码@192.168.1.200" -e "PUT /usr/sunxu" -d
```


查看192.168.1.200是否有sunxu文件夹

### 使用shell上传

```shell
#/bin/bash
if [ -f ~/.bash_profile ];
then
  . ~/.bash_profile
fi

FTP_ADDR=192.168.1.200
FTP_USER=用户名
FTP_PASS=密码
FILE_ROOT_PATH=/usr/TicketEBPdata/
FILE_PATH=/usr/TicketEBPdata/output/
LOG_FILE=/usr/TicketEBPdata/output/lftp_output.txt

ftpFunction() {
        lftp "sftp://$FTP_USER:$FTP_PASS@$FTP_ADDR" -e "PUT $FILE_PATH$1" >$LOG_FILE 2>&1 <<- EOF
bye
EOF
}
filelist=`ls $FILE_PATH`
for file in $filelist
do
  if [ -f "$FILE_PATH""$file" ];then
echo $file;   
        ftpFunction $file

	if [ -s "$LOG_FILE" ]; then
           mv $LOG_FILE $FILE_ROOT_PATH
           break
        else
        rm -rf $LOG_FILE
        mv output/* history -f 
        fi
  fi
done
```

