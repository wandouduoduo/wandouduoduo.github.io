---
title: 非root的普通用户使用tmux方法教程
categories:
  - 运维技术
  - 命令详解
tags:
  - Linux
copyright: true
abbrlink: 4dd98c85
date: 2020-12-24 15:00:29
---

`Tmux`是一款终端复用的神器，实现了会话与终端窗后的分离。用过的同学都欲罢不能，但是使用它时必须root用户，如果是普通用户就会出现`can't create socket`错误不能使用，那么本教程就教你用普通用户使用tmux这个神器。



<!--more-->

## **安装**

### root权限

若有root权限，tmux 安装十分简单，命令如下：

```bash
sudo apt-get install tmux      #ubuntu
yum install tmux -y  #centos
```

然后即可使用

### 普通用户

若你没有root权限，则就需要下载源码安装了。由于Tmux的安装依赖libevent以及ncurses，这两个库要先安装。

安装目录限定为：`/home/username/.local`

**安装libevent**

```bash
wget https://github.com/libevent/libevent/releases/download/release-2.0.22-stable/libevent-2.0.22-stable.tar.gz
tar -xzvf libevent-2.0.22-stable.tar.gz
cd libevent-2.0.22-stable
./configure --prefix=$HOME/.local --disable-shared
make
make install
```

**安装ncurses**

```bash
wget http://ftp.gnu.org/gnu/ncurses/ncurses-6.0.tar.gz
tar -xzvf ncurses-6.0.tar.gz
cd ncurses-6.0
./configure --prefix=$HOME/.local
make
make install
```

**安装tmux**

```bash
wget https://github.com/tmux/tmux/releases/download/2.8/tmux-2.8.tar.gz
tar -xzvf tmux-2.8.tar.gz
cd tmux-2.8
./configure CFLAGS="-I$HOME/.local/include" LDFLAGS="-L$HOME/.local/lib" 
make
cp tmux ~/.local/bin
```

**添加环境变量**

```bash
vim ~/.bashrc
export PATH=$PATH:~/.local/bin      #将该行添加到.bashrc 中

source ~/.bashrc
```

## 配置

```bash
git clone https://github.com/wandouduoduo/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
```



祝你好运，享受并使用它吧！！