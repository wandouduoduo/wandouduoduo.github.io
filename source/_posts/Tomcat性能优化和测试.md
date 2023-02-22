---
title: Tomcat性能优化和测试
categories:
  - 应用服务
  - Tomcat
tags:
  - Tomcat
copyright: true
abbrlink: 6f151fe3
date: 2019-06-11 14:52:22
---

## 目的

Tomcat是我们经常使用的 servlet容器之一，甚至很多线上产品都使用 Tomcat充当服务器。而且优化后的Tomcat性能提升显著，本文从以下几方面进行分析优化。

<!--more-->



## JVM内存优化

默认情况下Tomcat的相关内存配置较低，这对于一些大型项目显然是不够用的，这些项目运行就已经耗费了大部分内存空间，何况大规模访问的情况。即使是本文中的这个只有一个页面的超小项目，在并发达到一定程度后也会抛出OOM（OutOfMemoryError）的异常报错。

OOM报错：说明Tomcat已经无力支持访问处理，内部GC也已经“无能无力”。所以一般情况下我们需要重新配置Tomcat的相关内存大小。

### **配置**

Linux下修改TOMCAT_HOME/bin/catalina.sh，在其中加入，可以放在CLASSPATH=下面：

```shell
JAVA_OPTS="-server -Xms2048m -Xmx2048m -XX:PermSize=512M -XX:MaxPermSize=1024m" 
```

windows下修改TOMCAT_HOME/bin/catalina.bat，在其中加入，可以放在set CLASSPATH=下面：

```shell
set JAVA_OPTS=-server -Xms2048m -Xmx2048m  -XX:PermSize=512M -XX:MaxPermSize=1024m
```

 这些参数在我们学习JVM部分文章时已经都认识过了，不过这里还是简单介绍下:

```shell
-server：启用 JDK的 server 版本；
-Xms：Java虚拟机初始化时堆的最小内存,一般与Xmx配置为相同值,好处是GC不必再为扩展内存空间而消耗性能；
-Xmx：Java虚拟机可使用堆的最大内存；
-XX:PermSize：Java虚拟机永久代大小；
-XX:MaxPermSize：Java虚拟机永久代大小最大值；
```
除了这些参数外您还可以根据具体需要配置其他参数，可以参考JVM参数的配置[JDK7](https://docs.oracle.com/javase/7/docs/technotes/tools/solaris/java.html)和[JDK8](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)。



### **验证**

设置成功后我们可以利用JDK自带的工具进行验证，这些工具都在JAVA_HOME/bin目录下：

 1）jps：用来显示本地的java进程，以及进程号，进程启动的路径等。

 2）jmap：观察运行中的JVM 物理内存的占用情况，包括Heap size,Perm size等。





## **高并发优化**

我们知道TOMCAT_HOME/conf/server.xml可以配置端口，虚拟路径等等 Tomcat相关主要配置。



### **连接器优化**

Connector是连接器，负责接收客户的请求，以及向客户端回送响应的消息。所以 Connector的优化是重要部分。默认情况下 Tomcat只支持200线程访问，超过这个数量的连接将被等待甚至超时放弃，所以我们需要提高这方面的处理能力。

修改这部分配置需要修改TOMCAT_HOME/conf/server.xml，打开server.xml找到Connector 标签项，默认配置如下：

```shell
<Connector port="8080" protocol="HTTP/1.1"  
           connectionTimeout="20000"  
           redirectPort="8443" />  
```

其中port代表服务接口；protocol代表协议类型；connectionTimeout代表连接超时时间，单位为毫秒；redirectPort代表安全通信（https）转发端口，一般配置成443。

可以看到除了这几个基本配置外并无特殊功能，所以我们需要对 Connector 进行扩展。

其中Connector 支持参数属性可以参考[Tomcat官方网站](https://tomcat.apache.org/tomcat-8.0-doc/config/http.html)非常多，所以本文就只介绍些常用的。

我们将 Connector 配置修改为如下：

```shell
<Connector port="8080"   
          protocol="HTTP/1.1"   
          maxThreads="1000"   
          minSpareThreads="100"   
          acceptCount="1000"  
          maxConnections="1000"  
          connectionTimeout="20000"   
          maxHttpHeaderSize="8192"  
          tcpNoDelay="true"  
          compression="on"  
          compressionMinSize="2048"  
          disableUploadTimeout="true"  
          redirectPort="8443"  
      	  enableLookups="false"  
          URIEncoding="UTF-8" />  
```

```
参数解释：

port：代表Tomcat监听端口，也就是网站的访问端口，默认为8080，可以根据需要改成其他。
protocol：协议类型，可选类型有四种，分别为BIO（阻塞型IO），NIO，NIO2和APR。
 1）BIO：BIO(Blocking I/O)，顾名思义，即阻塞式I/O操作，表示Tomcat使用的是传统的Java I/O操作(即java.io包及其子包)。Tomcat在默认情况下，是以bio模式运行的。遗憾的是，就一般而言，bio模式是三种运行模式中性能最低的一种。BIO配置采用默认即可。
 2）NIO：NIO(New I/O)，是Java SE 1.4及后续版本提供的一种新的I/O操作方式(即java.nio包及其子包)。Java nio是一个基于缓冲区、并能提供非阻塞I/O操作的Java API，因此nio也被看成是non-blocking I/O的缩写。它拥有比传统I/O操作(bio)更好的并发运行性能。要让Tomcat以nio模式来运行也比较简单，我们只需要protocol类型修改如下即可：    
//NIO  
protocol="org.apache.coyote.http11.Http11NioProtocol"  
//NIO2  
protocol="org.apache.coyote.http11.Http11Nio2Protocol"  
 3）APR：APR(Apache Portable Runtime/Apache可移植运行时)，是Apache HTTP服务器的支持库。你可以简单地理解为:Tomcat将以JNI的形式调用 Apache HTTP服务器的核心动态链接库来处理文件读取或网络传输操作，从而大大地提高 Tomcat对静态文件的处理性能。
与配置NIO运行模式一样，也需要将对应的 Connector节点的 protocol属性值改为：
protocol="org.apache.coyote.http11.Http11AprProtocol"  

maxThreads：由该连接器创建的处理请求线程的最大数目，也就是可以处理的同时请求的最大数目。如果未配置默认值为200。如果一个执行器与此连接器关联，则忽略此属性，因为该属性将被忽略，所以该连接器将使用执行器而不是一个内部线程池来执行任务。
maxThreads是一个重要的配置属性，maxThreads配置的合理直接影响了Tomcat的相关性能，所以这里我们重点讨论下。
maxThreads并不是配置的越大越好，事实上你即使配置成999999也是没有用的，因为这个最大值是受操作系统及相关硬件所制约的，并且最大值并不一定是最优值，所以我们追寻的应该是最优值而不是最大值。

QPS（Query Per Second）：每秒查询率QPS是对一个特定的查询服务器在规定时间内所处理流量多少的衡量标准。我们常常使用 QPS值来衡量一个服务器的性能。
QPS = 并发数 / 平均响应时间 或者 并发数 = QPS * 平均响应时间
一个系统吞吐量通常由QPS、并发数两个因素决定，每套系统的这两个值都有一个相对极限值，在应用场景访问压力下，只要某一项达到系统最高值，系统的吞吐量就上不去了，如果压力继续增大，系统的吞吐量反而会下降，原因是系统超负荷工作，上下文切换、内存等等其它消耗导致系统性能下降。所谓吞吐量这里可以理解为每秒能处理请求的次数。

所以选择一个合理的maxThreads值，其实并不是那么容易的事。因为过多的线程只会造成更多的内存开销，更多的CPU开销，但是对提升QPS确毫无帮助；找到最佳线程数后通过简单的设置，可以让web系统更加稳定，得到最高，最稳定的QPS输出。

我们可以通过以下几种方式来获取 maxThreads的最佳值：
1. 通过线上系统不断使用和用户的不断增长来进行性能测试，观察QPS，响应时间，这种方式会在爆发式增长时系统崩溃，如双12等。
2. 根据公式计算，服务器端最佳线程数量=((线程等待时间+线程cpu时间)/线程cpu时间) * cpu数量，这种方式有时会被误导，因为某些系统处理环节可能会耗时比较长，从而影响公式的结果。
3. 单、多用户压力测试，查看CPU的消耗，然后直接乘以百分比，再进行压测，一般这个值的附近应该就是最佳线程数量，这种方式理想场景比较适用，实际情况会比这个复杂的多。
4. 根据系统的自身情况调整，如硬件限制，系统限制，程序处理能力限制等。
5. 定期修改为不同的 maxThreads值，看服务器响应结果及用户反应。

QPS和线程数的关系
1）在最佳线程数量之前，QPS和线程是互相递增的关系，线程数量到了最佳线程之后，QPS持平，不在上升，甚至略有下降，同时相应时间持续上升。
2）同一个系统而言，支持的线程数越多（最佳线程数越多而不是配置的线程数越多），QPS越高

QPS和响应时间的关系
1）对于一般的web系统，响应时间一般有CPU执行时间+IO等待时间组成。
2）CPU的执行时间减少，对QPS有实质的提升，IO时间的减少，对QPS提升不明显。如果要想明显提升QPS，优化系统的时候要着重优化CPU消耗大户。

所以想要找出maxThreads的最优值可并不容易，没有最好只有更好，更好的值只能通过时间来显现，如果你不想考虑那么多，一般情况下设置成1000即可。

minSpareThreads：线程的最小运行数目，这些始终保持运行。如果未指定，默认值为10。
acceptCount：当所有可能的请求处理线程都在使用时传入连接请求的最大队列长度。如果未指定，默认值为100。一般是设置的跟 maxThreads一样或一半，此值设置的过大会导致排队的请求超时而未被处理。所以这个值应该是主要根据应用的访问峰值与平均值来权衡配置。
maxConnections：在任何给定的时间内，服务器将接受和处理的最大连接数。当这个数字已经达到时，服务器将接受但不处理，等待进一步连接。NIO与NIO2的默认值为10000，APR默认值为8192。
connectionTimeout：当请求已经被接受，但未被处理，也就是等待中的超时时间。单位为毫秒，默认值为60000。通常情况下设置为30000。
maxHttpHeaderSize：请求和响应的HTTP头的最大大小，以字节为单位指定。如果没有指定，这个属性被设置为8192（8 KB）。
tcpNoDelay：如果为true，服务器socket会设置TCP_NO_DELAY选项，在大多数情况下可以提高性能。缺省情况下设为true。
compression：是否启用gzip压缩，默认为关闭状态。这个参数的可接受值为“off”（不使用压缩），“on”（压缩文本数据），“force”（在所有的情况下强制压缩）。
compressionMinSize：如果compression="on"，则启用此项。被压缩前数据的最小值，也就是超过这个值后才被压缩。如果没有指定，这个属性默认为“2048”（2K），单位为byte。
disableUploadTimeout：这个标志允许servlet [Container](http://lib.csdn.net/base/4)在一个servlet执行的时候，使用一个不同的，更长的连接超时。最终的结果是给servlet更长的时间以便完成其执行，或者在数据上载的时候更长的超时时间。如果没有指定，设为false。
enableLookups：关闭DNS反向查询。
URIEncoding：URL编码字符集。
```

连接器还有很多其他参数，可以参考Tomcat官网，这里只介绍与性能相关的部分。



### **协议**

通过配置 protocol的类型可以使用不同的 Connector处理请求。

```shell
//BIO  
protocol="HTTP/1.1"  
//NIO  
protocol="org.apache.coyote.http11.Http11NioProtocol"  
//NIO2  
protocol="org.apache.coyote.http11.Http11Nio2Protocol"  
//APR  
protocol="org.apache.coyote.http11.Http11AprProtocol"  
```

 以下是几种类型 Connector的参数对比：

![](Tomcat性能优化和测试/1.png)

并不是说 BIO的性能就一定不如 NIO，这几种类型 Connector之间并没有明显的性能区别，它们之间实现流程和原理不同，所以它们的选择是需要根据应用的类型来决定的。

BIO更适合处理简单流程，如程序处理较快可以立即返回结果。简单项目及应用可以采用BIO。

NIO更适合后台需要耗时完成请求的操作，如程序接到了请求后需要比较耗时的处理这已请求，所以无法立即返回结果，这样如果采用BIO就会占用一个连接，而使用NIO后就可以将此连接转让给其他请求，直至程序处理完成返回为止。

APR可以大大提升Tomcat对静态文件的处理性能，同时如果你使用了HTTPS方式传输的话，也可以提升SSL的处理性能。详见[Tomcat优化之APR模式](https://wandouduoduo.github.io/articles/98d7cf0b.html)



### **线程池**

Executor代表了一个线程池，可以在Tomcat组件之间共享。使用线程池的好处在于减少了创建销毁线程的相关消耗，而且可以提高线程的使用效率。

要想使用线程池，首先需要在 Service标签中配置 Executor，如下：

```shell
<Service name="Catalina">  
  
  <Executor name="tomcatThreadPool"   
         namePrefix="catalina-exec-"   
         maxThreads="1000"   
         minSpareThreads="100"  
         maxIdleTime="60000"  
         maxQueueSize="Integer.MAX_VALUE"  
         prestartminSpareThreads="false"  
         threadPriority="5"  
         className="org.apache.catalina.core.StandardThreadExecutor"/>  
```

```
参数解释：
name：线程池名称，用于 Connector中指定。
namePrefix：所创建的每个线程的名称前缀，一个单独的线程名称为 namePrefix+threadNumber。
maxThreads：池中最大线程数。
minSpareThreads：活跃线程数，也就是核心池线程数，这些线程不会被销毁，会一直存在。
maxIdleTime：线程空闲时间，超过该时间后，空闲线程会被销毁，默认值为6000（1分钟），单位毫秒。
maxQueueSize：在被执行前最大线程排队数目，默认为Int的最大值，也就是广义的无限。除非特殊情况，这个值不需要更改，否则会有请求不会被处理的情况发生。
prestartminSpareThreads：启动线程池时是否启动 minSpareThreads部分线程。默认值为false，即不启动。
threadPriority：线程池中线程优先级，默认值为5，值从1到10。
className：线程池实现类，未指定情况下，默认实现类为org.apache.catalina.core.StandardThreadExecutor。如果想使用自定义线程池首先需要实现 org.apache.catalina.Executor接口。
```

线程池配置完成后需要在 Connector中指定：

```shell
<Connector executor="tomcatThreadPool"  
...  
```



### **监听器**

另一个影响Tomcat 性能的因素是内存泄露。Server标签中可以配置多个Listener，其中 JreMemoryLeakPreventionListener是用来预防JRE内存泄漏。此Listener只需在Server标签中配置即可，默认情况下无需配置，已经添加在 Server中。

```shell
<Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />  
```



 

##   性能测试

 Tomcat优化部分我们已经完成，接下来就需要比较一下优化前与优化后的性能对比。

###     **Jmeter介绍**

Apache JMeter是Apache组织开发的基于Java的压力测试工具。用于对软件做压力测试，它最初被设计用于Web应用测试，但后来扩展到其他测试领域。 它可以用于测试静态和动态资源，例如静态文件、Java小服务程序、CGI 脚本、Java 对象、数据库、FTP 服务器， 等等。JMeter 可以用于对服务器、网络或对象模拟巨大的负载，来自不同压力类别下测试它们的强度和分析整体性能。另外，JMeter能够对应用程序做功能/回归测试，通过创建带有断言的脚本来验证你的程序返回了你期望的结果。为了最大限度的灵活性，JMeter允许使用正则表达式创建断言。

Apache jmeter 可以用于对静态的和动态的资源（文件，Servlet，Perl脚本，java 对象，数据库和查询，FTP服务器等等）的性能进行测试。它可以用于对服务器、网络或对象模拟繁重的负载来测试它们的强度或分析不同压力类型下的整体性能。你可以使用它做性能的图形分析或在大并发负载测试你的服务器/脚本/对象。

Jmeter官网：http://jmeter.apache.org/

### Jmeter作用

（1）能够对HTTP和FTP服务器进行压力和性能测试， 也可以对任何数据库进行同样的测试（通过JDBC），Jmeter支持以下服务器协议类型测试：

​    • Web - HTTP, HTTPS    • SOAP / REST   • FTP   • Database via JDBC  • LDAP

​    • Message-oriented middleware (MOM) via JMS    • Mail - SMTP(S), POP3(S) and IMAP(S)

​    • MongoDB (NoSQL)   • Native commands or shell scripts   • TCP

 （2）完全的可移植性和100% 纯java。

 （3）完全 Swing 和轻量组件支持（预编译的JAR使用 javax.swing.*)包。

 （4）完全多线程 框架允许通过多个线程并发取样和 通过单独的线程组对不同的功能同时取样。

 （5）精心的GUI设计允许快速操作和更精确的计时。

 （6）缓存和离线分析/回放测试结果。



###     Jmeter特性

（1）可链接的取样器允许无限制的测试能力。

（2）各种负载统计表和可链接的计时器可供选择。

（3）数据分析和可视化插件提供了很好的可扩展性以及个性化。

（4）具有提供动态输入到测试的功能（包括JavaScript）。

（5）支持脚本编程的取样器（在1.9.2及以上版本支持BeanShell）。

在设计阶段，JMeter能够充当HTTP PROXY（代理）来记录IE/NETSCAPE的HTTP请求，也可以记录apache等WebServer的log文件来重现HTTP流量。当这些HTTP客户端请求被记录以后，测试运行时可以方便的设置重复次数和并发度（线程数）来产生巨大的流量。JMeter还提供可视化组件以及报表工具把量服务器在不同压力下的性能展现出来。

相比其他HTTP测试工具,JMeter最主要的特点在于扩展性强。JMeter能够自动扫描其lib/ext子目录下.jar文件中的插件，并且将其装载到内存，让用户通过不同的菜单调用。



###     Jmeter使用

使用Jmeter非常简单，windows下进入bin目录直接双击jmeter.bat文件即可，Linux下类似，需要运行jmeter.sh文件，Jmeter运行后显示以下界面：

![](Tomcat性能优化和测试/5.png)

Jmeter使用起来比较简单，附件是一个简单的配置，直接导入即可使用。



###     测试条件

```
Tomcat版本：8.0.33
测试项目：新创建一个web项目也不用实现任何代码，只需要部署即可以使用，只有一个index.jsp文件。
JDK版本：jdk1.7.0.67
请求方式：POST
循环次数：100，1000
线程数：10,100,1000
总次数：总次数 = 线程数 * 循环次数
CPU：英特尔 第二代酷睿 i5-2450M（双核）
内存：8GB
```



###     测试结果

从部分结果来看优化过的Tomcat会比默认性能及并发处理能力上有提高，但至于参数的配置需要结合硬件及操作系统来不断调整，所以并不会有一个万能的参数来使用，需要各位不断的测试不断更改。

以下是一个简单的测试结果，循环100次，线程数分别为10,100,1000：

![](Tomcat性能优化和测试/6.png)

各位估计已经发现了相同的应用下并不一定某种protocol就一定性能出色，因为Tomcat中的这个测试项目只有一个index.jsp页面，在较少线程数访问情况下BIO反应最快，而当线程数达到1000时NIO2性能最出色，而APR中规中矩，虽然这种测试的局限性很大，但也可以反映出：想要找出适合的配置及最佳性能需要结合实际，不断的测试与改进，最终才能达到一个相对稳定的性能，虽然此时的性能未必是最佳的，但却是能应对绝大多数情况的。



## 总结：

Tomcat相关优化也只是一个入门介绍，每一种技术之中还是有很多很深奥的知识要去学习，只有不断的去学习才能不断的提高。