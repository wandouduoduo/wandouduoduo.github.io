---
title: Multiprocessing基础
categories:
  - 编程积累
  - Python
tags:
  - Python
copyright: true
abbrlink: 9a80786c
date: 2019-11-29 15:40:05
---

multiprocessing是Python的标准模块，它既可以用来编写多进程，也可以用来编写多线程。如果是多线程的话，用multiprocessing.dummy即可，用法与multiprocessing基本相同，这里主要介绍多进程的用法，欢迎纠错。



## Multiprocessing介绍

##### 为什么要使用python**多进程**？

因为python使用全局解释器锁(GIL)，他会将进程中的线程序列化，也就是多核cpu实际上并不能达到并行提高速度的目的，而使用多进程则是不受限的，所以实际应用中都是推荐多进程的。
如果每个子进程执行需要消耗的时间非常短（执行+1操作等），这不必使用多进程，因为进程的启动关闭也会耗费资源。
当然使用多进程往往是用来处理CPU密集型（科学计算）的需求，如果是IO密集型（文件读取，爬虫等）则可以使用多线程去处理。

<!--more-->

## multiprocessing常用组件及功能

创建管理进程模块：

- Process (用于创建进程模块）
- Pool（用于创建管理进程池）
- Queue（用于进程通信，资源共享）
- Value，Array（用于进程通信，资源共享）
- Pipe（用于管道通信）
- Manager（用于资源共享）

同步子进程模块：

- Condition
- Event
- Lock
- RLock
- Semaphore

## Multiprocessing进程管理模块

说明：由于篇幅有限，模块具体用法结束请参考每个模块的具体链接。

##### Process模块

Process模块用来创建子进程，是Multiprocessing核心模块，使用方式与Threading类似，可以实现多进程的创建，启动，关闭等操作。

##### Pool模块

Pool模块是用来创建管理进程池的，当子进程非常多且需要控制子进程数量时可以使用此模块。

##### Queue模块

Queue模块用来控制进程安全，与线程中的Queue用法一样。

##### Pipe模块

Pipe模块用来管道操作。

##### Manager模块

Manager模块常与Pool模块一起使用，作用是共享资源。



#### Multiprocessing同步进程模块

##### Lock模块

作用：当多个进程需要访问共享资源的时候，Lock可以用来避免访问的冲突。

具体场景：所有的任务在打印的时候都会向同一个标准输出(stdout)输出。这样输出的字符会混合在一起，无法阅读。使用Lock同步，在一个任务输出完成之后，再允许另一个任务输出，可以避免多个任务同时向终端输出。

代码实现：

```python
from multiprocessing import Process, Lock  

def l(lock, num):      
	lock.acquire()      
	print "Hello Num: %s" % (num)      
	lock.release()  


if __name__ == '__main__':      
	lock = Lock()  #这个一定要定义为全局    
	for num in range(20):          
		Process(target=l, args=(lock, num)).start()  #这个类似多线程中的threading，但是进程太多了，控制不了。
```



##### Semaphore模块

作用：用来控制对共享资源的访问数量，例如池的最大连接数。

##### Event模块

作用：用来实现进程间同步通信。

## Multiprocessing.dummy多线程

Multiprocessing.dummy用法与Multiprocessing用法基本相同，只不过是用来创建多线程。

## 使用Multiprocessing疑问

- *启动多进程的代码一定要放在* if **name**==”**main**“: *后面吗？*

　　解答：windows系统下，想要启动一个子进程，必须加上*if **name**==”**main**“:*，linux则不需要。

- *父进程中的全局变量能被子进程共享吗？*

　　解答：不行，因为每个进程享有独立的内存数据，如果想要共享资源，可以使用Manage类，或者Queue等模块。

- *子进程能结束其他子进程或父进程吗？如果能，怎么通过子进程去结束所有进程?*

　　解答：此需求可以稍作修改：所有的子进程都是为了完成一件事情，而当某个子进程完成该事情后，父进程就该结束所有子进程，请问该怎么做？此时结束所有子进程的操作可以交给父进程去做，因为子进程想要结束另外的子进程比较难实现。
　　那么问题就又变成了父进程什么时候该结束所有进程？
　　其中一个思路是*获取每个子进程的返回值*，一旦有返回True（结束的标记），则立马结束所有进程；
　　另外一种思路是*使用共享资源*，父进程可以一直去判断这个公共资源，一旦子进程将它改变，则结束所有子进程。（推荐使用前者，因为多进程中不推荐使用资源共享）

- *子进程中还能再创建子进程吗？*

解答：可以，子进程可以再创建进程，线程中也可以创建进程。