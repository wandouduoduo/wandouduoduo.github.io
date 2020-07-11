---
title: Tomcat高并发和安全配置
categories:
  - 应用服务
  - Tomcat
tags:
  - Tomcat
copyright: true
abbrlink: d5611253
date: 2019-12-19 11:43:17
---

## 目的

现在Tomcat容器在企业中的应用还占据很高比例，如何对Tomcat优化配置，让其实现高并发的同时，安全也能兼顾呢。本篇就详细介绍Tomcat高并发和安全配置。

<!--more-->



## 变量配置

设置 Tomcat 相关变量：

```
vim bin/catalina.sh
```

在配置文件的可编辑内容最上面（98 行开始），加上如下内容（具体参数根据你服务器情况自行修改）：

```
JAVA_HOME=/usr/program/jdk1.8.0_72
CATALINA_HOME=/usr/program/tomcat8
CATALINA_OPTS="-server -Xms528m -Xmx528m -XX:PermSize=256m -XX:MaxPermSize=358m"
CATALINA_PID=$CATALINA_HOME/catalina.pid
```

如果使用 shutdown.sh 还无法停止 tomcat，可以修改其配置：

```
vim bin/shutdown.sh
把最尾巴这一行：exec "$PRGDIR"/"$EXECUTABLE" stop "$@"
改为：exec "$PRGDIR"/"$EXECUTABLE" stop 10 -force
```

 

## JVM 优化

Java 的内存模型分为：

```
Young，年轻代（易被 GC）。Young 区被划分为三部分，Eden 区和两个大小严格相同的 Survivor 区，其中 Survivor 区间中，某一时刻只有其中一个是被使用的，另外一个留做垃圾收集时复制对象用，在 Young 区间变满的时候，minor GC 就会将存活的对象移到空闲的Survivor 区间中，根据 JVM 的策略，在经过几次垃圾收集后，任然存活于 Survivor 的对象将被移动到 Tenured 区间。

Tenured，终身代。Tenured 区主要保存生命周期长的对象，一般是一些老的对象，当一些对象在 Young 复制转移一定的次数以后，对象就会被转移到 Tenured 区，一般如果系统中用了 application 级别的缓存，缓存中的对象往往会被转移到这一区间。

Perm，永久代。主要保存 class,method,filed 对象，这部门的空间一般不会溢出，除非一次性加载了很多的类，不过在涉及到热部署的应用服务器的时候，有时候会遇到 java.lang.OutOfMemoryError : PermGen space 的错误，造成这个错误的很大原因就有可能是每次都重新部署，但是重新部署后，类的 class 没有被卸载掉，这样就造成了大量的 class 对象保存在了 perm 中，这种情况下，一般重新启动应用服务器可以解决问题。
```

Linux 修改 bin/catalina.sh 文件，把下面信息添加到文件第一行。Windows 和 Linux 有点不一样的地方在于，在 Linux 下，下面的的参数值是被引号包围的，而 Windows 不需要引号包围。

如果服务器只运行一个 Tomcat
机子内存如果是 8G，一般 PermSize 配置是主要保证系统能稳定起来就行：

```
JAVA_OPTS="-Dfile.encoding=UTF-8 -server -Xms6144m -Xmx6144m -XX:NewSize=1024m -XX:MaxNewSize=2048m -XX:PermSize=512m -XX:MaxPermSize=512m -XX:MaxTenuringThreshold=10 -XX:NewRatio=2 -XX:+DisableExplicitGC"
```

机子内存如果是 16G，一般 PermSize 配置是主要保证系统能稳定起来就行：

```
JAVA_OPTS="-Dfile.encoding=UTF-8 -server -Xms13312m -Xmx13312m -XX:NewSize=3072m -XX:MaxNewSize=4096m -XX:PermSize=512m -XX:MaxPermSize=512m -XX:MaxTenuringThreshold=10 -XX:NewRatio=2 -XX:+DisableExplicitGC"
```

机子内存如果是 32G，一般 PermSize 配置是主要保证系统能稳定起来就行：

```
JAVA_OPTS="-Dfile.encoding=UTF-8 -server -Xms29696m -Xmx29696m -XX:NewSize=6144m -XX:MaxNewSize=9216m -XX:PermSize=1024m -XX:MaxPermSize=1024m -XX:MaxTenuringThreshold=10 -XX:NewRatio=2 -XX:+DisableExplicitGC"
```

如果是开发机

```
-Xms550m -Xmx1250m -XX:PermSize=550m -XX:MaxPermSize=1250m
```

参数说明：

```
-Dfile.encoding：默认文件编码
-server：表示这是应用于服务器的配置，JVM 内部会有特殊处理的
-Xmx1024m：设置JVM最大可用内存为1024MB
-Xms1024m：设置JVM最小内存为1024m。此值可以设置与-Xmx相同，以避免每次垃圾回收完成后JVM重新分配内存。
-XX:NewSize：设置年轻代大小
-XX:MaxNewSize：设置最大的年轻代大小
-XX:PermSize：设置永久代大小
-XX:MaxPermSize：设置最大永久代大小
-XX:NewRatio=4：设置年轻代（包括 Eden 和两个 Survivor 区）与终身代的比值（除去永久代）。设置为 4，则年轻代与终身代所占比值为 1：4，年轻代占整个堆栈的 1/5
-XX:MaxTenuringThreshold=10：设置垃圾最大年龄，默认为：15。如果设置为 0 的话，则年轻代对象不经过 Survivor 区，直接进入年老代。对于年老代比较多的应用，可以提高效率。                             如果将此值设置为一个较大值，则年轻代对象会在 Survivor 区进行多次复制，这样可以增加对象再年轻代的存活时间，增加在年轻代即被回收的概论。
-XX:+DisableExplicitGC：这个将会忽略手动调用 GC 的代码使得 System.gc() 的调用就会变成一个空调用，完全不会触发任何 GC
```



## 禁用8005端口

```bash
vim conf/server.xml

# telnet localhost 8005 然后输入 SHUTDOWN 就可以关闭 Tomcat，为了安全我们要禁用该功能。
# 禁用该端口，要说明的是： shutdown端口是Tomcat中shutdown.sh脚本执行时给操作系统发送停止信号的端口，禁用后，执行shutdown.sh并不能停掉tomcat。那有同学就问，那我要怎么停，并且问什么要禁掉呢？停可以直接停止进程。禁掉是为了安全，同时在日常自动化运维中，为了自动批量控制业务状态，都会直接控制业务进程，所以就可以禁掉。

默认值:
<Server port="8005" shutdown="SHUTDOWN">
修改为:
<Server port="-1" shutdown="SHUTDOWN">
```



## 关闭自动部署

```
默认值:
<Host name="localhost" appBase="webapps"
     unpackWARs="true" autoDeploy="true">
修改为:
<Host name="localhost" appBase="webapps"
     unpackWARs="false" autoDeploy="false" reloadable="false">
     
# 在tomcat8版本中配置 reloadable="false" 选项启动时会包如下警告可忽略：
警告 [main] org.apache.tomcat.util.digester.SetPropertiesRule.begin [SetPropertiesRule]Server/Service/Engine/Host} Setting property 'reloadable' to 'false' did not find a matching property.
```



## 线程池限制

```
默认为注释:
<!--
<Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
maxThreads="150" minSpareThreads="4"/>
-->
修改为:
<Executor
   name="tomcatThreadPool"
   namePrefix="catalina-exec-"
   maxThreads="500"
   minSpareThreads="100" 
   maxIdleTime="60000"
  prestartminSpareThreads = "true"
  maxQueueSize = "100"
/>
```

```
参数解释：

maxThreads：最大并发数，默认设置 200，一般建议在 500 ~ 800，根据硬件设施和业务来判断
minSpareThreads：Tomcat 初始化时创建的线程数，默认设置 25
maxIdleTime：如果当前线程大于初始化线程，那空闲线程存活的时间，单位毫秒，默认60000=60秒=1分钟。
prestartminSpareThreads：在 Tomcat 初始化的时候就初始化 minSpareThreads 的参数值，如果不等于 true，minSpareThreads 的值就没啥效果了
maxQueueSize：最大的等待队列数，超过则拒绝请求
```



## 连接器配置

```
默认值：
<Connector 
   port="8080" 
   protocol="HTTP/1.1" 
   connectionTimeout="20000" 
   redirectPort="8443" 
/>
修改为：
<Connector 
  executor="tomcatThreadPool"
  port="8080" 
  protocol="org.apache.coyote.http11.Http11NioProtocol" 
  connectionTimeout="40000" 
  maxConnections="10000" 
  redirectPort="8443" 
  enableLookups="false" 
  acceptCount="100" 
  maxPostSize="10485760" 
  compression="on" 
  disableUploadTimeout="true" 
  compressionMinSize="2048" 
  acceptorThreadCount="2" 
compressableMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript" 
  maxHttpHeaderSize="8192"
  processorCache="20000"
  tcpNoDelay="true"
  connectionLinger="5"
  server="Server Version 11.0"
  URIEncoding="utf-8"
/>

用此项配置 protocol="org.apache.coyote.http11.Http11Nio2Protocol"启动时会有警告可忽略
警告 [main] org.apache.tomcat.util.net.Nio2Endpoint.bind The NIO2 connector requires an exclusive executor to operate properly on shutdown
```

```
参数解释：

protocol：Tomcat 8 设置 nio2 更好：org.apache.coyote.http11.Http11Nio2Protocol（如果这个用不了，就用下面那个），Tomcat 6、7 设置 nio 更好：org.apache.coyote.http11.Http11NioProtocol
enableLookups：禁用DNS查询
acceptCount：指定当所有可以使用的处理请求的线程数都被使用时，可以放到处理队列中的请求数，超过这个数的请求将不予处理，默认设置 100
maxPostSize：以 FORM URL 参数方式的 POST 提交方式，限制提交最大的大小，默认是 2097152(2兆)，它使用的单位是字节。10485760 为 10M。如果要禁用限制，则可以设置为 -1。
maxPostSize：设置由容器解析的URL参数的最大长度，-1(小于0)为禁用这个属性，默认为2097152(2M) 请注意， FailedRequestFilter 过滤器可以用来拒绝达到了极限值的请求。
acceptorThreadCount，用于接收连接的线程的数量，默认值是1。一般这个指需要改动的时候是因为该服务器是一个多核CPU，如果是多核 CPU 一般配置为 2.
acceptorThreadCount：用于接受连接的线程数量。增加这个值在多CPU的机器上,尽管你永远不会真正需要超过2。 也有很多非维持连接,您可能希望增加这个值。默认值是1。
connectionTimeout：Connector接受一个连接后等待的时间(milliseconds)，默认值是60000。
maxConnections：这个值表示最多可以有多少个socket连接到tomcat上
maxHttpHeaderSize：http请求头信息的最大程度，超过此长度的部分不予处理。一般8K。
compression：是否启用GZIP压缩 on为启用（文本数据压缩） off为不启用， force 压缩所有数据
disableUploadTimeout：这个标志允许servlet容器使用一个不同的,通常长在数据上传连接超时。 如果不指定,这个属性被设置为true,表示禁用该时间超时。
compressionMinSize：当超过最小数据大小才进行压缩
compressableMimeType：配置想压缩的数据类型
URIEncoding：网站一般采用UTF-8作为默认编码。
processorCache：协议处理器缓存的处理器对象来提高性能。 该设置决定多少这些对象的缓存。-1意味着无限的,默认是200。 如果不使用Servlet 3.0异步处理,默认是使用一样的maxThreads设置。                 如果使用Servlet 3.0异步处理,默认是使用大maxThreads和预期的并发请求的最大数量(同步和异步)。
tcpNoDelay：如果设置为true,TCP_NO_DELAY选项将被设置在服务器套接字,而在大多数情况下提高性能。这是默认设置为true。
connectionLinger：秒数在这个连接器将持续使用的套接字时关闭。默认值是 -1,禁用socket 延迟时间。
server：隐藏Tomcat版本信息，首先隐藏HTTP头中的版本信息
```

**建议：压缩会增加Tomcat负担，最好采用Nginx + Tomcat 或者 Apache + Tomcat 方式，压缩交由Nginx/Apache 去做。** 
**Tomcat 的压缩是在客户端请求服务器对应资源后，从服务器端将资源文件压缩，再输出到客户端，由客户端的浏览器负责解压缩并浏览。相对于普通的 浏览过程 HTML、CSS、Javascript和Text，它可以节省40% 左右的流量。更为重要的是，它可以对动态生成的，包括CGI、PHP、JSP、ASP、Servlet,SHTML等输出的网页也能进行压缩，压缩效率也很高。**



## 禁用 AJP

**前提：如果你服务器没有使用 Apache或不用ajp**

AJP是为 Tomcat 与 HTTP 服务器之间通信而定制的协议，能提供较高的通信速度和效率。如果tomcat前端放的是apache的时候，会使用到AJP这个连接器。 默认是开启的。如果不使用apache，注释该连接器。

```
把下面这一行注释掉，默认 Tomcat 是开启的。
<!-- <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" /> -->
```



## 隐藏或修改版本号

```bash
cd /usr/local/tomcat/lib/
unzip catalina.jar
cd org/apache/catalina/util
vim ServerInfo.properties

server.info=Apache Tomcat/8.5.16
server.number=8.5.16.0
server.built=Jun 21 2017 17:01:09 UTC
# 将以上去掉或修改版本号即可。
```



## 管理页面安全

```bash
rm -rf /usr/local/apache-tomcat-8.5.16/webapps/*
rm -rf /usr/local/apache-tomcat-8.5.16/conf/tomcat-users.xml
```

