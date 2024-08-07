---
title: Dig命令详解
categories:
  - 运维技术
  - 命令详解
tags:
  - Linux
copyright: true
abbrlink: 4352880d
date: 2019-06-06 11:06:25
---

## **简介：** 

Dig是一个在类Unix命令行模式下查询DNS包括NS记录，A记录，MX记录等相关信息的工具。由于一直缺失
Dig man page文档，本文就权当一个dig使用向导吧。Dig的源码是ISC BIND大包的一部分，但是大多编译和安装Bind的文档都不把它包括在内，但是在linux系统下，它通常是某个包的一部分，在Gentoo下是bind-tools，在Redhat/Fedora下是 bind-utils，或者在Debian下是 dnsutils。          
如果你要查找Bind的配置相关的信息，请详读[参考文档](http://www.madboa.com/geek/soho-bind/)。

看懂默认输出：最简单最常见的查询是查询一台主机，但是默认情况下，Dig的输出信息很详细。你可能不需要所有的输出，但是它确实值得知道。

<!--more-->

## 查询

```shell
下面是一个带有注释的查询：
$ dig www.isc.org
上面是我调用dig 的命令行。
; <<>> DiG 9.2.3 <<>> www.isc.org
;; global options:  printcmd
Dig的部分输出告诉我们一些有关于它的版本信息(version 9.2.3)和全局的设置选项，如果+nocmd在命令行下
是第一个参数的话，那么这部分输出可以通过加+nocmd的方式查询出来。
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 43071
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 3, ADDITIONAL: 3
在这里，Dig告诉我们一些从DNS返回的技术信息，这段信息可以用选项 +[no]comments来控制显示，但是小心
，禁止掉comments也可能关闭一些其它的选项。
;; QUESTION SECTION:
;www.isc.org.                   IN      A
在这个查询段中，Dig显示出我们查询的输出，默认的查询是查询A记录，你可以显示或者禁止掉这些用+[no]
question选项
;; ANSWER SECTION:
www.isc.org.            600     IN      A       204.152.184.88
最后，我们得到我们查询的结果。www.isc.org 的地址是204.152.184.8，我不知道为什么你们更喜欢过滤掉
这些输出，但是你可以用+[no]answer保留这些选项。
;; AUTHORITY SECTION:
isc.org.                2351    IN      NS      ns-int.isc.org.
isc.org.                2351    IN      NS      ns1.gnac.com.
isc.org.                2351    IN      NS      ns-ext.isc.org.
这段权威说明告诉我们哪个DNS服务器给我们提供权威的答案。在这个例子中，isc.org有3个Name Server，你
可以用+[no]authority选项保留这段输出。
;; ADDITIONAL SECTION:
ns1.gnac.com.           171551  IN      A       209.182.216.75
ns-int.isc.org.         2351    IN      A       204.152.184.65
ns-int.isc.org.         2351    IN      AAAA    2001:4f8:0:2::15
这些额外选项很有代表性地包含了列出的权威DNS的IP地址，这段输出可以用+[no]additional选项保留。
;; Query time: 2046 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: Fri Aug 27 08:22:26 2004
;; MSG SIZE  rcvd: 173
最后一段默认输出包含了查询的统计数据，可以用+[no]stats保留。
```



## 作用

最后一段默认输出包含了查询的统计数据，可以用+[no]stats保留。

### **我们可以查询什么呢？**

Dig可以让你有效地查询DNS，最常用的查询是A记录，TXT（文本注释），MX记录，NS记录，或者任意综合查询。

查找yahoo.com的A记录：（此处一定是域而不是主机，如我公司为xinpindao.com)

```shell
dig yahoo.com A +noall +answer
```

查找yahoo.com MX记录的列表：

```
dig yahoo.com MX +noall +answer
```

查找yahoo.com的权威DNS：

```
dig yahoo.com NS +noall +answer
```

查询上面所有的记录：

```
dig yahoo.com ANY +noall +answer
```

在现在这种IPv4和IPV6混用的情况下，你也可以使用AAAA的选项查询主机的IPv6 AAAA记录：

```shell
dig yahoo.com AAAA +short
```

如果你要查询的域允许转发，你也可以查询到相关的信息，比如DNS记录在internet上的生存周期，但是，现
在只有很少的DNS允许无限制转发。

### **我们怎样查询？获得精简答案呢？**

当我们需要一个快速回答时，+short选项是你最好的朋友:

```
dig yahoo.com +short
204.152.184.88
```

### **获得一个不是十分精简的答案？**

精简答案和只有一个答案是不一样的，

获得没有附加信息的详细答案的方法是使用+noall选项，这样就只保留你想要的输出。
下面是只有一个答案的精简查询，最后包含所有的配置信息，包括TTL数据，格式化的BIND配置信息。

```shell
$ dig fsf.org mx +short
20 mx20.gnu.org.
30 mx30.gnu.org.
10 mx10.gnu.org.
$ dig +nocmd fsf.org mx +noall +answer
fsf.org.                3583    IN      MX      30 mx30.gnu.org.
fsf.org.                3583    IN      MX      10 mx10.gnu.org.
fsf.org.                3583    IN      MX      20 mx20.gnu.org.
```

### **获得一个详细答案？**

通过它的man page，你可以通过+multiline选项获得冗长的多行模式人性化注释的DSN的SOA记录，一般来说，
用+multiline选项获得的信息可以显示很多，就像BIND配置文件一样。

```
$ dig +nocmd ogi.edu any +multiline +noall +answer
ogi.edu.   14267 IN A 129.95.59.31
ogi.edu.   14267 IN MX 5 cse.ogi.edu.
ogi.edu.   14267 IN MX 15 hermes.admin.ogi.edu.
ogi.edu.   14267 IN SOA zeal.admin.ogi.edu. hostmaster.admin.ogi.edu. (
                   200408230  ; serial
                   14400      ; refresh (4 hours)
                   900        ; retry (15 minutes)
                   3600000    ; expire (5 weeks 6 days 16 hours)
                   14400      ; minimum (4 hours)
                   )
ogi.edu.   14267 IN NS zeal.admin.ogi.edu.
ogi.edu.   14267 IN NS cse.ogi.edu.
ogi.edu.   14267 IN NS fork.admin.ogi.edu.
```

### **查找PTR记录？**

可以用 -x的选项查找IP地址的主机名。

```
$ dig -x 204.152.184.167 +short
mx-1.isc.org.
在这个循环中，脚本很灵活地在给出的子网中映射出名字。
#!/bin/bash
NET=18.7.22
for n in $(seq 1 254); do
  ADDR=${NET}.${n}
  echo -e "${ADDR}\t$(dig -x ${ADDR} +short)"
done
```

**查询一个不同的命名服务器？**

查询命令如下：

```
dig @ns1.google.com  www.google.com
```

使用/etc/resolv.conf里面的记录查询
主机将从/etc/resolv.conf文件里面自动查询DNS记录

```
$ host www
www.wandouduoduo.com has address 65.102.49.170
```

但是，默认情况下，dig会产生出一些意想不到的输出。如果你想查询本地主机名而不是全域名时候，使用
+search 选项

```
dig www +search
```

处理大部分的查询？
如果你想查询大量的主机名，你可以把它们存放在一个文本文件中(一条记录一行)，使用带-f参数的dig来依
次查询。

查询大量的主机名

```
dig -f /path/to/host-list.txt
```

相同的，更明确的输出

```
dig -f /path/to/host-list.txt +noall +answer
```

但是我要告诉你的是，dig 9.2.3以及以后的版本都不支持使用-f的选项反向查询了。

### 验证DNS映射

不正确的DNS配置会给你带来很多苦恼，你可以通过如下两种方式验证你的DNS配置：
1.每个主机名应该被解析到一个IP地址，而且那个IP地址也应该反指向那个主机名。
2.如果你子网上一个地址被反指向一个主机名，那么那个主机名也必须指向这个IP。
对于这两条规则来说，还有一些例外情况，比如CNAME应该首先解析到另外一个主机名，而且只能指向一个IP
，有时多个主机名指向了相同的IP地址，但是那个IP只能有一个PTR记录。
综上，这些有助于你检查你的DNS映射是否像你想象的那样工作。
你也可以编写一个测试脚本写入你已知的主机名，如下所示，内容很简单；它执行时当捕捉到一个CNAME时它
就会中断，如果多个主机名指向同一个IP地址它会报错。我们假设这个文件包含你的主机名叫做named-hosts。

```shell
#!/bin/bash
#
# test DNS forward- and reverse-mapping
#
# edit this variable to reflect local class C subnet(s)
NETS="192.168.1 192.168.2"
# Test name to address to name validity
echo
echo -e "\tname -> address -> name"
echo '----------------------------------'
while read H; do
  ADDR=$(dig $H +short)
  if test -n "$ADDR"; then
    HOST=$(dig -x $ADDR +short)
    if test "$H" = "$HOST"; then
      echo -e "ok\t$H -> $ADDR -> $HOST"
    elif test -n "$HOST"; then
      echo -e "fail\t$H -> $ADDR -> $HOST"
    else
      echo -e "fail\t$H -> $ADDR -> [unassigned]"
    fi
  else
    echo -e "fail\t$H -> [unassigned]"
  fi
done < named-hosts
# Test address to name to address validity
echo
echo -e "\taddress -> name -> address"
echo '-------------------------------------'
for NET in $NETS; do
  for n in $(seq 1 254); do
    A=${NET}.${n}
    HOST=$(dig -x $A +short)
    if test -n "$HOST"; then
      ADDR=$(dig $HOST +short)
      if test "$A" = "$ADDR"; then
        echo -e "ok\t$A -> $HOST -> $ADDR"
      elif test -n "$ADDR"; then
        echo -e "fail\t$A -> $HOST -> $ADDR"
      else
        echo -e "fail\t$A -> $HOST -> [unassigned]"
      fi
    fi
  done
done
```

## **有趣的dig**

### 创建属于你自己的named.root文件

任何连接到internet 的DNS服务器肯定会有InterNIC的named.root文件的拷贝，文件列出所有internet的根
DNS，如果你不怕麻烦的话，你可以经常从InterNIC的ftp服务器上把它下载下来，或者，你可以使用dig命令
创建属于你自己的时髦的named.root

```
# compare with [ftp://ftp.internic.net/domain/named.root]()
dig +nocmd . NS +noall +answer +additional
```

你的TTL值在这边可能会很小，但是它是你找到最新的named.root文件！

### **跟踪dig的查询路径**

你可能是个traceroute的狂热爱好者，经常喜欢查看如何从点A连接点B。那你可以使用dig +trace选项做类似
的事。

```
dig gentoo.de +trace
```

你可以在dig输出的头部分看到根DNS，然后找到负责解析所有*.de的DNS，最后找到gentoo.de的域名IP。

### **获取SOA记录**

作为一个DNS管理员，我有时会（对DNS配置）做一些改变，并且想知道我的DNS解析是否推送的还是旧数据，
这个+nssearch选项可以给你的公众服务器提供清楚的统计信息。

```shell
# the unvarnished truth
dig cse.ogi.edu +nssearch

# the same, displaying only serial number and hostname
dig cse.ogi.edu +nssearch | cut -d' ' -f4,11
```

### **解释TTL数值**

我喜爱google有很多原因，其中一个原因就是它在我的WEB日志中提供了精确的链接，它会使我很容易地指出
哪种类型的查询引导人们来访问这个站点的页面。
出乎意料的是，我已经看到很多请求要求查询TTL数值，我从来没想到TTL会成为最受欢迎的东东，但是你每天
都在学习新东西，所以，应大家的要求，这里稍微介绍一下TTL。
如果你从本地DNS查询互联网地址，服务器指出从哪里获得权威的答案并获得地址，一旦服务器获知答案，它
将这个答案保存在本地缓存中以免你在稍后的时间内再次查询同样的地址，这样它就会很快地从缓存中获取你
要的答案，比你再次从internet查询要快很多。
当域管理员配置DNS记录时，他们可以决定这个记录可以在缓存中保存多长时间，这就是TTL数值（通常用多少
秒来表示）。
通常地，远端服务器一般对记录的缓存只保存TTL数值长的时间。时间过期后，服务器会刷新它的本地缓存并
重新查询一个权威答案。
当你用dig来查询DNS服务器某条记录时，服务器会告诉dig这条记录可以在缓存中保持的时间长短。
举个例子，像上面写的那样，gmail.com域的MX记录的TTL值是300s，gmail.com域的管理员要求远端服务器缓
存它的MX记录不能高于5分钟，所以当你第一次查询那个记录（gmail.com的MX记录）时，dig会告诉你一个300
的TTL。

```shell
$ dig +nocmd gmail.com MX +noall +answer
gmail.com.        300     IN      MX      20 gsmtp57.google.com.
gmail.com.        300     IN      MX      10 gsmtp171.google.com.
如果你一段时间后再去查，你会发现TTL值减少为280（中间隔了20s）。
$ dig +nocmd gmail.com MX +noall +answer
gmail.com.        280     IN      MX      10 gsmtp171.google.com.
gmail.com.        280     IN      MX      20 gsmtp57.google.com.
如果你的时间计算得足够好，你会获取这条记录的最后生存时间。
$ dig +nocmd gmail.com MX +noall +answer
gmail.com.        1       IN      MX      10 gsmtp171.google.com.
gmail.com.        1       IN      MX      20 gsmtp57.google.com.
```

在那之后，你查询的DNS服务器会“忘记”这个问题的答案，在你下次查询这条记录时，整个循环又将开始（本例子中是300s）。

## 建议

**在 unix 和 linux 下，建议大家使用 dig 命令来代替 nslookup。 dig 命令的功能比 nslookup 强大很多，不像 nslookkup 还得 set 来 set 去的，怪麻烦的。**



## 用法

下面是 dig 的一些比较常用的命令: 
### dig 最基本的用法
```
dig @server qianlong.com
```

### 用 dig 查看 zone 数据传输
```
dig @server qianlong.com AXFR
```

### 用 dig 查看 zone 数据的增量传输
```
dig @server qianlong.com IXFR=N
```

### 用 dig 查看反向解析
```
dig -x 124.42.102.203 @server
```

### 查找一个域的授权 dns 服务器
```
dig  qianlong.com +nssearch
```

### 从根服务器开始追踪一个域名的解析过程
```
dig  qianlong.com +trace
```

### 查看你使用的是哪个 F root dns server 
```
dig +norec @F.ROOT-SERVERS.NET HOSTNAME.BIND CHAOS TXT
```

### 查看 bind 的版本号
```
dig @bind_dns_server CHAOS TXT version.bind
```

你可以到 www.isc.org 去下载一个 bind for windows 的版本安装，安装后就可以在 windows 上使用 dig 命令了。^O^

```
ftp://ftp.isc.org/isc/bind/contrib/ntbind-9.3.0/BIND9.3.0.zip
```

## 语法

```
dig [@server] [-b address] [-c class] [-f filename] [-k filename] [ -n ][-p port#] [-t type] [-x addr] [-y name:key] [name] [type] [class] [queryopt...]
dig [-h]
dig [global-queryopt...] [query...]
描述
dig（域信息搜索器）命令是一个用于询问 DNS 域名服务器的灵活的工具。它执行 DNS 搜索，显示从受请求的域名服务器返回的答复。多数 DNS 管理员利用 dig 作为 DNS 问题的故障诊断，因为它灵活性好、易用、输出清晰。虽然通常情况下 dig 使用命令行参数，但它也可以按批处理模式从文件读取搜索请求。不同于早期版本，dig 的 BIND9 实现允许从命令行发出多个查询。除非被告知请求特定域名服务器，dig 将尝试 /etc/resolv.conf 中列举的所有服务器。当未指定任何命令行参数或选项时，dig 将对“.”（根）执行 NS 查询。
标志
-b address 设置所要询问地址的源 IP 地址。这必须是主机网络接口上的某一合法的地址。
-c class 缺省查询类（IN for internet）由选项 -c 重设。class 可以是任何合法类，比如查询 Hesiod 记录的 HS 类或查询 CHAOSNET 记录的 CH 类。
-f filename 使 dig 在批处理模式下运行，通过从文件 filename 读取一系列搜索请求加以处理。文件包含许多查询；每行一个。文件中的每一项都应该以和使用命令行接口对 dig 的查询相同的方法来组织。
-h 当使用选项 -h 时，显示一个简短的命令行参数和选项摘要。
-k filename 要签署由 dig 发送的 DNS 查询以及对它们使用事务签名（TSIG）的响应，用选项 -k 指定 TSIG 密钥文件。
-n 缺省情况下，使用 IP6.ARPA 域和 RFC2874 定义的二进制标号搜索 IPv6 地址。为了使用更早的、使用 IP6.INT 域和 nibble 标签的 RFC1886 方法，指定选项 -n（nibble）。
-p port# 如果需要查询一个非标准的端口号，则使用选项 -p。port# 是 dig 将发送其查询的端口号，而不是标准的 DNS 端口号 53。该选项可用于测试已在非标准端口号上配置成侦听查询的域名服务器。
-t type 设置查询类型为 type。可以是 BIND9 支持的任意有效查询类型。缺省查询类型是 A，除非提供 -x 选项来指示一个逆向查询。通过指定 AXFR 的 type 可以请求一个区域传输。当需要增量区域传输（IXFR）时，type 设置为 ixfr=N。增量区域传输将包含自从区域的 SOA 记录中的序列号改为 N 之后对区域所做的更改。
-x addr 逆向查询（将地址映射到名称）可以通过 -x 选项加以简化。addr 是一个以小数点为界的 IPv4 地址或冒号为界的 IPv6 地址。当使用这个选项时，无需提供 name、class 和 type 参数。dig 自动运行类似 11.12.13.10.in-addr.arpa 的域名查询，并分别设置查询类型和类为 PTR 和 IN。
-y name:key 您可以通过命令行上的 -y 选项指定 TSIG 密钥；name 是 TSIG 密码的名称，key 是实际的密码。密码是 64 位加密字符串，通常由 dnssec-keygen（8）生成。当在多用户系统上使用选项 -y 时应该谨慎，因为密码在 ps（1）的输出或 shell 的历史文件中可能是可见的。当同时使用 dig 和 TSCG 认证时，被查询的名称服务器需要知道密码和解码规则。在 BIND 中，通过提供正确的密码和 named.conf 中的服务器声明实现。
参数
global-queryopt... 全局查询选项（请参阅多个查询）。
查询 查询选项（请参阅查询选项）。
查询选项
dig 提供查询选项号，它影响搜索方式和结果显示。一些在查询请求报头设置或复位标志位，一部分决定显示哪些回复信息，其它的确定超时和重试战略。每个查询选项被带前缀（+）的关键字标识。一些关键字设置或复位一个选项。通常前缀是求反关键字含义的字符串 no。其他关键字分配各选项的值，比如超时时间间隔。它们的格式形如 +keyword=value。查询选项是：
+[no]tcp
查询域名服务器时使用 [不使用] TCP。缺省行为是使用 UDP，除非是 AXFR 或 IXFR 请求，才使用 TCP 连接。
+[no]vc
查询名称服务器时使用 [不使用] TCP。+[no]tcp 的备用语法提供了向下兼容。 vc 代表虚电路。
+[no]ignore
忽略 UDP 响应的中断，而不是用 TCP 重试。缺省情况运行 TCP 重试。
+domain=somename
设定包含单个域 somename 的搜索列表，好像被 /etc/resolv.conf 中的域伪指令指定，并且启用搜索列表处理，好像给定了 +search 选项。
+[no]search
使用 [不使用] 搜索列表或 resolv.conf 中的域伪指令（如果有的话）定义的搜索列表。缺省情况不使用搜索列表。
+[no]defname
不建议看作 +[no]search 的同义词。
+[no]aaonly
该选项不做任何事。它用来提供对设置成未实现解析器标志的 dig 的旧版本的兼容性。
+[no]adflag
在查询中设置 [不设置] AD（真实数据）位。目前 AD 位只在响应中有标准含义，而查询中没有，但是出于完整性考虑在查询中这种性能可以设置。
+[no]cdflag
在查询中设置 [不设置] CD（检查禁用）位。它请求服务器不运行响应信息的 DNSSEC 合法性。
+[no]recursive
切换查询中的 RD（要求递归）位设置。在缺省情况下设置该位，也就是说 dig 正常情形下发送递归查询。当使用查询选项 +nssearch 或 +trace 时，递归自动禁用。
+[no]nssearch
这个选项被设置时，dig 试图寻找包含待搜名称的网段的权威域名服务器，并显示网段中每台域名服务器的 SOA 记录。
+[no]trace
切换为待查询名称从根名称服务器开始的代理路径跟踪。缺省情况不使用跟踪。一旦启用跟踪，dig 使用迭代查询解析待查询名称。它将按照从根服务器的参照，显示来自每台使用解析查询的服务器的应答。
+[no]cmd
设定在输出中显示指出 dig 版本及其所用的查询选项的初始注释。缺省情况下显示注释。
+[no]short
提供简要答复。缺省值是以冗长格式显示答复信息。
+[no]identify
当启用 +short 选项时，显示 [或不显示] 提供应答的 IP 地址和端口号。如果请求简短格式应答，缺省情况不显示提供应答的服务器的源地址和端口号。
+[no]comments
切换输出中的注释行显示。缺省值是显示注释。
+[no]stats
该查询选项设定显示统计信息：查询进行时，应答的大小等等。缺省显示查询统计信息。
+[no]qr
显示 [不显示] 发送的查询请求。缺省不显示。
+[no]question
当返回应答时，显示 [不显示] 查询请求的问题部分。缺省作为注释显示问题部分。
+[no]answer
显示 [不显示] 应答的回答部分。缺省显示。
+[no]authority
显示 [不显示] 应答的权限部分。缺省显示。
+[no]additional
显示 [不显示] 应答的附加部分。缺省显示。
+[no]all
设置或清除所有显示标志。
+time=T
为查询设置超时时间为 T 秒。缺省是5秒。如果将 T 设置为小于1的数，则以1秒作为查询超时时间。
+tries=A
设置向服务器发送 UDP 查询请求的重试次数为 A，代替缺省的 3 次。如果把 A 小于或等于 0，则采用 1 为重试次数。
+ndots=D
出于完全考虑，设置必须出现在名称 D 的点数。缺省值是使用在 /etc/resolv.conf 中的 ndots 语句定义的，或者是 1，如果没有 ndots 语句的话。带更少点数的名称被解释为相对名称，并通过搜索列表中的域或文件 /etc/resolv.conf 中的域伪指令进行搜索。
+bufsize=B
设置使用 EDNS0 的 UDP 消息缓冲区大小为 B 字节。缓冲区的最大值和最小值分别为 65535 和 0。超出这个范围的值自动舍入到最近的有效值。
+[no]multiline
以详细的多行格式显示类似 SOA 的记录，并附带可读注释。缺省值是每单个行上显示一条记录，以便于计算机解析 dig 的输出。
```

## 多条查询

dig 的 BIND9 支持在命令行上指定多个查询（支持 -f 批处理文件选项的附加功能）。每条查询可以使用自己的标志位、选项和查询选项。
在这种情况下，在上面描述的命令行语法中，每条查询自变量代表一个个别查询。每一条由任意标准选项和标志、待查询名称、可选查询类型和类以及任何适用于该查询的查询选项。
也可以使用对所有查询均有效的查询选项全局集合。全局查询选项必须位于命令行上第一个名称、类、类型、选项、标志和查询选项的元组之前。任何全局查询选项（除了 +[no]cmd 选项）可以被下面的查询特别选项重设。例如:

```
dig +qr www.isc.org any -x 127.0.0.1 isc.org ns +noqr显示 dig 如何从命令行出发进行三个查询：一个针对 www.isc.org的任意查询、一个 127.0.0.1 的逆向查询，以及一个 isc.org 的 NS 记录查询。应用了 +qr 的全局查询选项，以便 dig 显示进行每条查询的初始查询。最后那个查询有一个本地查询选项 +noqr，表示 dig 在搜索 isc.org 的 NS 记录时不显示初始查询。
```

## 示例

一个典型的 dig 调用类似：
dig @server name type其中：
server
待查询名称服务器的名称或 IP 地址。可以是用点分隔的 IPv4 地址或用冒号分隔的 IPv6 地址。当由主机提供服务器参数时，dig 在查询域名服务器前先解析那个名称。如果没有服务器参数可以提供，dig 参考 /etc/resolv.conf，然后查询列举在那里的域名服务器。显示来自域名服务器的应答。
name
将要查询的资源记录的名称。
type
显示所需的查询类型 － ANY、A、MX、SIG，以及任何有效查询类型等。如果不提供任何类型参数，dig 将对纪录 A 执行查询。