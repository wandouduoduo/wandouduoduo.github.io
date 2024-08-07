---
title: 探究login和non-login shell的区别
categories:
  - 编程积累
  - Shell
tags:
  - Shell
copyright: true
abbrlink: 78e10ad0
date: 2020-07-13 16:41:47
---



## 介绍

### login shell

取得bash时需要完整的登入流程的，就称为login shell。举例来说，你要由tty1~tty6登入，需要输入用户的账号和密码，此时取得的bash就称为『login shell』啰；

### non-login shell

取得bash接口的方法不需要重复登入的举动。

举例来说：

(1)你以Xwindow登入Linux后，再以X的图形化接口启动终端机，此时那个终端接口并没有需要再次的输入账号和密码，那个bash的环境就称为non-login shell了。

(2)你在原本的bash环境下再次下达bash这个命令，同样的也没有输入账号密码，那第二个bash (子程序)也是non-login shell 。

<!--more-->



## 问题假设

查阅相关文档，得出如下结果。 

* 我们登录执行的是login shell，会加载/etc/profile和 ~/.bash_profile 
* ssh远程执行是non-login shell，不会加载etc/profile和 ~/.bash_profile, 而是加载etc/bashrc和~/.bashrc

```bash
#查看~/.bash_profile，发现如下内容：
if [ -f ~/.bashrc ]; then
      . ~/.bashrc
fi
#当~/.bashrc存在时，login shell会引入~/.bashrc的环境变量
```

```bash
#再看~/.bashrc，发现一段类似的内容：
if [ -f /etc/bashrc ]; then
      . /etc/bashrc
fi
#当/etc/bashrc存在时，login shell会引入/etc/bashrc内的环境变量
```

也就是说： 

* login shell加载环境变量的顺序是：① /etc/profile  ② ~/.bash_profile  ③ ~/.bashrc  ④ /etc/bashrc 
* 而non-login shell加载环境变量的顺序是： ① ~/.bashrc ② /etc/bashrc



## 验证

我们通过在~/.bash_profile和~/.bashrc中引用不同的变量计算来验证上述问题 

在~/.bash_profile中引入变量AAA=$((AAA+1)) 
**注意：引入的变量一定要置于引入~/.bashrc之前，否则会出现运算时AAA还未赋值的情况！！！**

```
export AAA=$((AAA+1))
```

在~/.bashrc中引入变量AAA=$((AAA+10))

```
export AAA=$((AAA+10))
```

### login shell

**按照环境变量的加载顺序:**

```bash
~/.bash_profile 
AAA=$((AAA+1))，AAA为空，AAA=$((AAA+1))=1

~/.bashrc 
AAA=$((AAA+10)),AAA=1,AAA=$((AAA+10))=11

#运行结果
[root@ ~]# echo $AAA
11
```

**验证通过**



### non-login shell

采用ssh远程执行来验证
**按照环境变量的加载顺序**：

```bash
~/.bashrc 
AAA=$((AAA+10)),AAA为空,AAA=$((AAA+10))=10

#运行结果
[root@ ~]# ssh  root@1.1.1.2 'echo $AAA'
root@1.1.1.2's password: 
10
```

**验证通过**



### login shell下启动bash子进程

bash子进程是一个non-login shell，但是它会继承父进程中的环境变量
**按照环境变量的加载顺序**：

```bash
#父进程，引入~/.bash_profile 
AAA=$((AAA+1))，AAA为空，AAA=$((AAA+1))=1

#父进程，引入~/.bashrc 
AAA=$((AAA+10)),AAA=1,AAA=$((AAA+10))=11

#子进程，继承父进程环境变量，引入~/.bashrc 
AAA=$((AAA+10)),AAA=11,AAA=$((AAA+10))=21

#运行结果
# 父进程
[root@ ~]# echo $AAA
11

# bash子进程，继承AAA=11
[root@ ~]# bash
[root@ ~]# echo $AAA
21

# 子进程的子进程，继承AAA=21
[root@ ~]# bash
[root@ ~]# echo $AAA
```

**验证通过**



## 假设成立

远程执行的non-login shell 并不会加载/etc/profile和~/.bash_profile下的环境变量，只是加载~/.bashrc和/etc/bashrc

如果需要特定环境变量的命令，可以在执行前source下~/.bash_profile， 或者将环境变量写在~/.bashrc 。