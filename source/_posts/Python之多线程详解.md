---
title: Python之多线程详解
categories:
  - 编程积累
  - Python
tags:
  - Python
copyright: true
abbrlink: e0b461d5
date: 2019-11-29 15:28:51
---

## 目的

线程是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。一条线程指的是进程中一个单一顺序的控制流，一个进程中可以并发多个线程，每条线程并行执行不同的任务，多线程就是在一个进程中的多个线程，如果使用多线程默认开启一个主线程，按照程序需求自动开启多个线程(也可以自己定义线程数)。

<!--more-->

## 多线程知识点

1. Python 在设计之初就考虑到要在解释器的主循环中，同时只有一个线程在执行，即在任意时刻，只有一个线程在解释器中运行。对Python 虚拟机的访问由全局解释器锁（GIL）来控制，正是这个锁能保证同一时刻只有一个线程在运行。
2. 多线程共享主进程的资源，所以可能还会改变其中的变量，这个时候就要加上线程锁，每次执行完一个线程在执行下一个线程。
3. 因为每次只能有一个线程运行，多线程怎么实现的呢？Python解释器中一个线程做完了任务然后做IO(文件读写)操作的时候，这个线程就退出，然后下一个线程开始运行，循环之。
4. 当你读完上面三点你就知道多线程如何运行起来，并且知道多线程常用在那些需要等待然后执行的应用程序上(比如爬虫读取到数据，然后保存的时候下一个线程开始启动)也就是说多线程适用于IO密集型的任务量（文件存储，网络通信）。
5. 注意一点，定义多线程，然后传递参数的时候，如果是有一个参数就是用args=（i，）一定要加上逗号，如果有两个或者以上的参数就不用这样。

## 代码实例

### 案例一 多线程核心用法

```
import sys
import threading
import time
reload(sys)
sys.setdefaultencoding('utf-8')

def loop():
    #定义一个要循环的函数，当然后面肯定会定义好几个函数
    print 'thread %s is running...' % threading.current_thread().name
    #threading.current_thread().name就是当前线程的名字  在声明线程的时候可以自定义子线程的名字
    n = 0
    while n < 10:
        n = n + 1
        print '%s >>> %s' % (threading.current_thread().name, n)
        #输出当前线程名字  和循环的参数n
    print 'thread %s ended.' % threading.current_thread().name
print 'thread %s is running...' % threading.current_thread().name

#下面的一部分就是threading的核心用法
#包括target name args 之类的 一般我只用targer=你定义的函数名
t = threading.Thread(target=loop, name='线程名:')
# 在这里就申明了这个线程的名字
t.start()
#开始
t.join()
#关于join的相关信息我会在后面的代码详说
print 'thread %s ended.' % threading.current_thread().name
```

运行结果：

```
thread MainThread is running...
thread 线程名: is running...
线程名: >>> 1
线程名: >>> 2
线程名: >>> 3
线程名: >>> 4
线程名: >>> 5
线程名: >>> 6
线程名: >>> 7
线程名: >>> 8
线程名: >>> 9
线程名: >>> 10
thread 线程名: ended.
thread MainThread ended.
```

### 案例二 线程锁

前面有说到过，多线程是共享内存的，所以其中的变量如果发生了改变的话就会改变后边的变量，导致异常，这个时候可以加上线程锁。线程锁的概念就是主要这个线程运行完后再运行下一个线程。

```
import sys
import threading
import time
reload(sys)
sys.setdefaultencoding('utf-8')

def loop():
    l.acquire()
    # 这里相当于把线程加了锁，目前只允许这一个线程运行
    print 'thread %s is running...' % threading.current_thread().name
    #threading.current_thread().name就是当前线程的名字  在声明线程的时候可以自定义子线程的名字
    n = 0
    while n < 10:
        n = n + 1
        print '%s >>> %s' % (threading.current_thread().name, n)
        #输出当前线程名字  和循环的参数n
    print 'thread %s ended.' % threading.current_thread().name
    l.release()
    # 这里是把线程锁解开，可以再运行写一个线程
print 'thread %s is running...' % threading.current_thread().name

#下面的一部分就是threading的核心用法
#包括target name args 之类的 一般我只用targer=你定义的函数名
t = threading.Thread(target=loop, name='线程名:')
l = threading.Lock()
# 这里申明一个线程锁
t.start()
#开始
t.join()
#关于join的相关信息我会在后面的代码详说
print 'thread %s ended.' % threading.current_thread().name
```

使用线程锁后，程序按照一个一个有序执行。其中lock还有Rlock的方法，RLock允许在同一线程中被多次acquire。而Lock却不允许这种情况。否则会出现死循环，程序不知道解哪一把锁。注意：如果使用RLock，那么acquire和release必须成对出现，即调用了n次acquire，必须调用n次的release才能真正释放所占用的锁

### 案例三 join()方法的使用

在多线程中，每个线程自顾执行自己的任务，当最后一个线程运行完毕后再退出，所以这个时候如果你要打印信息的话，会看到打印出来的信息错乱无章，有的时候希望主线程能够等子线程执行完毕后在继续执行，就是用join()方法。

```
import sys
import threading
import time
reload(sys)
sys.setdefaultencoding('utf-8')
t00 = time.time()
# 获取当前时间戳
def cs1():
    time0 = time.time()
    for x in range(9):
        print x + time.time()-time0
        # 计算用了多少时间
        print threading.current_thread().name
        # 打印这个线程名字

def cs2():
    for x1 in range(6,9):
        print x1
        print threading.current_thread().name

threads=[]
# 定义一个空的列表
t1 = threading.Thread(target=cs1)
t2 = threading.Thread(target=cs2)
threads.append(t1)
threads.append(t2)
# 把这两个线程的任务加载到这个列表中
for x in threads:
    x.start()
    # 然后执行，这个案例很常用，就是有多个函数要多线程执行的时候用到
    # 如果一个程序有多个函数，但是你只想其中的某一个或者某两个函数多线程，用法一样加入空的列表即可
    x.join()
    #线程堵塞 先运行第一个在运行第二个
#x.join()
#注意你的join放在这里是没有意义的，和不加join一样。线程不堵塞  但是会出现不匀称的表现  并且会修改不同线程中的变量
print 'use time.{}'.format(time.time()-t00)
```

关于setDaemon()的概念就是：主线程A中，创建了子线程B，并且在主线程A中调用了B.setDaemon(),这个的意思是，把主线程A设置为守护线程，这时候，要是主线程A执行结束了，就不管子线程B是否完成,一并和主线程A退出.这就是setDaemon方法的含义，这基本和join是相反的。此外，还有个要特别注意的：必须在start() 方法调用之前设置，如果不设置为守护线程，程序会被无限挂起。

### 案例四 线程锁之信号Semaphore

类名：BoundedSemaphore。这种锁允许一定数量的线程同时更改数据，它不是互斥锁。比如地铁安检，排队人很多，工作人员只允许一定数量的人进入安检区，其它的人继续排队。

```
import time
import threading

def run(n, se):
    se.acquire()
    print("run the thread: %s" % n)
    time.sleep(1)
    se.release()

# 设置允许5个线程同时运行
semaphore = threading.BoundedSemaphore(5)
for i in range(20):
    t = threading.Thread(target=run, args=(i,semaphore))
    t.start()
```

运行后，可以看到5个一批的线程被放行。

### 案例五 线程锁之事件Event

事件线程锁的运行机制：
全局定义了一个Flag，如果Flag的值为False，那么当程序执行wait()方法时就会阻塞，如果Flag值为True，线程不再阻塞。这种锁，类似交通红绿灯（默认是红灯），它属于在红灯的时候一次性阻挡所有线程，在绿灯的时候，一次性放行所有排队中的线程。
事件主要提供了四个方法set()、wait()、clear()和is_set()。

```
调用clear()方法会将事件的Flag设置为False。
调用set()方法会将Flag设置为True。
调用wait()方法将等待“红绿灯”信号。
is_set():判断当前是否"绿灯放行"状态
```

下面是一个模拟红绿灯，然后汽车通行的例子：

```
#利用Event类模拟红绿灯
import threading
import time
event = threading.Event()
# 定义一个事件的对象
def lighter():
    green_time = 5       
    # 绿灯时间
    red_time = 5         
    # 红灯时间
    event.set()          
    # 初始设为绿灯
    while True:
        print("\33[32;0m 绿灯亮...\033[0m")
        time.sleep(green_time)
        event.clear()
        print("\33[31;0m 红灯亮...\033[0m")
        time.sleep(red_time)
        event.set()

def run(name):
    while True:
        if event.is_set():      
        # 判断当前是否"放行"状态
            print("一辆[%s] 呼啸开过..." % name)
            time.sleep(1)
        else:
            print("一辆[%s]开来，看到红灯，无奈的停下了..." % name)
            event.wait()
            print("[%s] 看到绿灯亮了，瞬间飞起....." % name)

if __name__ == '__main__':
    light = threading.Thread(target=lighter,)
    light.start()
        for name in ['奔驰', '宝马', '奥迪']:
        car = threading.Thread(target=run, args=(name,))
        car.start()
```

运行结果：

```
绿灯亮...
一辆[奔驰] 呼啸开过...
一辆[宝马] 呼啸开过...
一辆[奥迪] 呼啸开过...
一辆[奥迪] 呼啸开过...
......
 红灯亮...
一辆[宝马]开来，看到红灯，无奈的停下了...
一辆[奥迪]开来，看到红灯，无奈的停下了...
一辆[奔驰]开来，看到红灯，无奈的停下了...
绿灯亮...
[奥迪] 看到绿灯亮了，瞬间飞起.....
一辆[奥迪] 呼啸开过...
[奔驰] 看到绿灯亮了，瞬间飞起.....
一辆[奔驰] 呼啸开过...
[宝马] 看到绿灯亮了，瞬间飞起.....
一辆[宝马] 呼啸开过...
一辆[奥迪] 呼啸开过...
......
```

### 案例六 线程锁之条件Condition

Condition称作条件锁，依然是通过acquire()/release()加锁解锁。

```
wait([timeout])方法将使线程进入Condition的等待池等待通知，并释放锁。使用前线程必须已获得锁定，否则将抛出异常。
notify()方法将从等待池挑选一个线程并通知，收到通知的线程将自动调用acquire()尝试获得锁定（进入锁定池），其他线程仍然在等待池中。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。
notifyAll()方法将通知等待池中所有的线程，这些线程都将进入锁定池尝试获得锁定。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。
```

实际案例

```
import threading
import time
num = 0
con = threading.Condition()
class Foo(threading.Thread):

    def __init__(self, name, action):
        super(Foo, self).__init__()
        self.name = name
        self.action = action

    def run(self):
        global num
        con.acquire()
        print("%s开始执行..." % self.name)
        while True:
            if self.action == "add":
                num += 1
            elif self.action == 'reduce':
                num -= 1
            else:
                exit(1)
            print("num当前为：", num)
            time.sleep(1)
            if num == 5 or num == 0:
                print("暂停执行%s！" % self.name)
                con.notify()
                con.wait()
                print("%s开始执行..." % self.name)
        con.release()

if __name__ == '__main__':
    a = Foo("线程A", 'add')
    b = Foo("线程B", 'reduce')
    a.start()
    b.start()
```

如果不强制停止，程序会一直执行下去，并循环下面的结果：

```
线程A开始执行...
num当前为： 1
num当前为： 2
num当前为： 3
num当前为： 4
num当前为： 5
暂停执行线程A！
线程B开始执行...
num当前为： 4
num当前为： 3
num当前为： 2
num当前为： 1
num当前为： 0
暂停执行线程B！
线程A开始执行...
num当前为： 1
num当前为： 2
num当前为： 3
num当前为： 4
num当前为： 5
暂停执行线程A！
线程B开始执行...
```

### 案例 七定时器

定时器Timer类是threading模块中的一个小工具，用于指定n秒后执行某操作。一个简单但很实用的东西。

```
from threading import Timer
def hello():
    print("hello, world")
t = Timer(1, hello)
# 表示1秒后执行hello函数
t.start()
```

### 案例八 通过with语句使用线程锁

类似于上下文管理器，所有的线程锁都有一个加锁和释放锁的动作，非常类似文件的打开和关闭。在加锁后，如果线程执行过程中出现异常或者错误，没有正常的释放锁，那么其他的线程会造到致命性的影响。通过with上下文管理器，可以确保锁被正常释放。其格式如下：

```
with some_lock:
    # 执行任务...
```

这相当于：

```
some_lock.acquire()
try:
    # 执行任务..
finally:
    some_lock.release()
```

## threading 的常用属性

```
current_thread()    返回当前线程
active_count()    返回当前活跃的线程数，1个主线程+n个子线程
get_ident()    返回当前线程
enumerater()    返回当前活动 Thread 对象列表
main_thread()    返回主 Thread 对象
settrace(func)    为所有线程设置一个 trace 函数
setprofile(func)    为所有线程设置一个 profile 函数
stack_size([size])    返回新创建线程栈大小；或为后续创建的线程设定栈大小为 size
TIMEOUT_MAX    Lock.acquire(), RLock.acquire(), Condition.wait() 允许的最大超时时间
```

## 线程池 threadingpool

在使用多线程处理任务时也不是线程越多越好。因为在切换线程的时候，需要切换上下文环境，线程很多的时候，依然会造成CPU的大量开销。为解决这个问题，线程池的概念被提出来了。

预先创建好一个数量较为优化的线程组，在需要的时候立刻能够使用，就形成了线程池。在Python中，没有内置的较好的线程池模块，需要自己实现或使用第三方模块。
需要注意的是，线程池的整体构造需要自己精心设计，比如某个函数定义存在多少个线程，某个函数定义什么时候运行这个线程，某个函数定义去获取线程获取任务，某个线程设置线程守护(线程锁之类的)，等等…
在网上找了几个案例，供大家学习参考。

下面是一个简单的线程池：

```
import queue
import time
import threading
class MyThreadPool:
    def __init__(self, maxsize=5):
        self.maxsize = maxsize
        self._pool = queue.Queue(maxsize)   # 使用queue队列，创建一个线程池
        for _ in range(maxsize):
            self._pool.put(threading.Thread)
    def get_thread(self):
        return self._pool.get()

    def add_thread(self):
        self._pool.put(threading.Thread)

def run(i, pool):
    print('执行任务', i)
    time.sleep(1)
    pool.add_thread()   # 执行完毕后，再向线程池中添加一个线程类

if __name__ == '__main__':
    pool = MyThreadPool(5)  # 设定线程池中最多只能有5个线程类
    for i in range(20):
        t = pool.get_thread()   # 每个t都是一个线程类
        obj = t(target=run, args=(i, pool)) # 这里的obj才是正真的线程对象
        obj.start()
    print("活动的子线程数： ", threading.active_count()-1)
```

分析一下上面的代码：

1. 实例化一个MyThreadPool的对象，在其内部建立了一个最多包含5个元素的阻塞队列，并一次性将5个Thread类型添加进去。
2. 循环100次，每次从pool中获取一个thread类，利用该类，传递参数，实例化线程对象。
3. 在run()方法中，每当任务完成后，又为pool添加一个thread类，保持队列中始终有5个thread类。
4. 一定要分清楚，代码里各个变量表示的内容。t表示的是一个线程类，也就是threading.Thread，而obj才是正真的线程对象。

上面的例子是把线程类当做元素添加到队列内，从而实现的线程池。这种方法比较糙，每个线程使用后就被抛弃，并且一开始就将线程开到满，因此性能较差。下面是一个相对好一点的例子，在这个例子中，队列里存放的不再是线程类，而是任务，线程池也不是一开始就直接开辟所有线程，而是根据需要，逐步建立，直至池满。

```
# -*- coding:utf-8 -*-

"""
一个基于thread和queue的线程池，以任务为队列元素，动态创建线程，重复利用线程，
通过close和terminate方法关闭线程池。
"""
import queue
import threading
import contextlib
import time

# 创建空对象,用于停止线程
StopEvent = object()


def callback(status, result):
    """
    根据需要进行的回调函数，默认不执行。
    :param status: action函数的执行状态
    :param result: action函数的返回值
    :return:
    """
    pass


def action(thread_name, arg):
    """
    真实的任务定义在这个函数里
    :param thread_name: 执行该方法的线程名
    :param arg: 该函数需要的参数
    :return:
    """
    # 模拟该函数执行了0.1秒
    time.sleep(0.1)
    print("第%s个任务调用了线程 %s，并打印了这条信息！" % (arg+1, thread_name))


class ThreadPool:

    def __init__(self, max_num, max_task_num=None):
        """
        初始化线程池
        :param max_num: 线程池最大线程数量
        :param max_task_num: 任务队列长度
        """
        # 如果提供了最大任务数的参数，则将队列的最大元素个数设置为这个值。
        if max_task_num:
            self.q = queue.Queue(max_task_num)
        # 默认队列可接受无限多个的任务
        else:
            self.q = queue.Queue()
        # 设置线程池最多可实例化的线程数
        self.max_num = max_num
        # 任务取消标识
        self.cancel = False
        # 任务中断标识
        self.terminal = False
        # 已实例化的线程列表
        self.generate_list = []
        # 处于空闲状态的线程列表
        self.free_list = []

    def put(self, func, args, callback=None):
        """
        往任务队列里放入一个任务
        :param func: 任务函数
        :param args: 任务函数所需参数
        :param callback: 任务执行失败或成功后执行的回调函数，回调函数有两个参数
        1、任务函数执行状态；2、任务函数返回值（默认为None，即：不执行回调函数）
        :return: 如果线程池已经终止，则返回True否则None
        """
        # 先判断标识，看看任务是否取消了
        if self.cancel:
            return
        # 如果没有空闲的线程，并且已创建的线程的数量小于预定义的最大线程数，则创建新线程。
        if len(self.free_list) == 0 and len(self.generate_list) < self.max_num:
            self.generate_thread()
        # 构造任务参数元组，分别是调用的函数，该函数的参数，回调函数。
        w = (func, args, callback,)
        # 将任务放入队列
        self.q.put(w)

    def generate_thread(self):
        """
        创建一个线程
        """
        # 每个线程都执行call方法
        t = threading.Thread(target=self.call)
        t.start()

    def call(self):
        """
        循环去获取任务函数并执行任务函数。在正常情况下，每个线程都保存生存状态，  直到获取线程终止的flag。
        """
        # 获取当前线程的名字
        current_thread = threading.currentThread().getName()
        # 将当前线程的名字加入已实例化的线程列表中
        self.generate_list.append(current_thread)
        # 从任务队列中获取一个任务
        event = self.q.get()
        # 让获取的任务不是终止线程的标识对象时
        while event != StopEvent:
            # 解析任务中封装的三个参数
            func, arguments, callback = event
            # 抓取异常，防止线程因为异常退出
            try:
                # 正常执行任务函数
                result = func(current_thread, *arguments)
                success = True
            except Exception as e:
                # 当任务执行过程中弹出异常
                result = None
                success = False
            # 如果有指定的回调函数
            if callback is not None:
                # 执行回调函数，并抓取异常
                try:
                    callback(success, result)
                except Exception as e:
                    pass
            # 当某个线程正常执行完一个任务时，先执行worker_state方法
            with self.worker_state(self.free_list, current_thread):
                # 如果强制关闭线程的flag开启，则传入一个StopEvent元素
                if self.terminal:
                    event = StopEvent
                # 否则获取一个正常的任务，并回调worker_state方法的yield语句
                else:
                    # 从这里开始又是一个正常的任务循环
                    event = self.q.get()
        else:
            # 一旦发现任务是个终止线程的标识元素，将线程从已创建线程列表中删除
            self.generate_list.remove(current_thread)


    def close(self):
        """
        执行完所有的任务后，让所有线程都停止的方法
        """
        # 设置flag
        self.cancel = True
        # 计算已创建线程列表中线程的个数，
        # 然后往任务队列里推送相同数量的终止线程的标识元素
        full_size = len(self.generate_list)
        while full_size:
            self.q.put(StopEvent)
            full_size -= 1


    def terminate(self):
        """
        在任务执行过程中，终止线程，提前退出。
        """
        self.terminal = True
        # 强制性的停止线程
        while self.generate_list:
            self.q.put(StopEvent)

# 该装饰器用于上下文管理
    @contextlib.contextmanager
    def worker_state(self, state_list, worker_thread):
        """
        用于记录空闲的线程，或从空闲列表中取出线程处理任务
        """
        # 将当前线程，添加到空闲线程列表中
        state_list.append(worker_thread)
        # 捕获异常
        try:
            # 在此等待
            yield
        finally:
            # 将线程从空闲列表中移除
            state_list.remove(worker_thread)

# 调用方式
if __name__ == '__main__':
    # 创建一个最多包含5个线程的线程池
    pool = ThreadPool(5)
    # 创建100个任务，让线程池进行处理
    for i in range(100):
        pool.put(action, (i,), callback)
    # 等待一定时间，让线程执行任务
    time.sleep(3)
    print("-" * 50)
    print("\033[32;0m任务停止之前线程池中有%s个线程，空闲的线程有%s个！\033[0m"
          % (len(pool.generate_list), len(pool.free_list)))
    # 正常关闭线程池
    pool.close()
    print("任务执行完毕，正常退出！")
    # 强制关闭线程池
    # pool.terminate()
    # print("强制停止任务！")
```

关于线程池其实涉及到工程设计，需要自己很熟练的运行面向对象程序设计。

## 生产者和消费者模式

生产者就是生成任务，消费者就是解决处理任务。比如在一个程序中，代码是按照重上往下执行，有的时候做等待的时间完全可以用来做任务处理或者做别的事情，为了节省时间，可以借助多线程的功能（自顾自完成自己线程任务）加上Queue队列特性（管道模式。里面存储数据，然后提供给线程处理）完成生产者和消费者模式。关于Queue的用法参考我之前的文章。

### 案例一

```
import sys
import Queue
import time
import threading
reload(sys)
sys.setdefaultencoding('utf-8')
q = Queue.Queue(10)
def get(i):
    # 这个函数用来生产任务，接受参数i，也可以不传入参数
    while 1:
        time.sleep(2)
        # 这里可以做一些动作，比如过去网站的网址之类的
        q.put(i)
        # 然后把得到的数据放在消息队列中
def fun(o):
    # 这个函数用来处理任务，必须要接受参数
    q.get(o)
    # 得到获取接受来的参数
    print o*10
    # 然后对获取的参数作处理，我这里仅仅打印数据乘以10


for i in range(100):
    # 生产任务启动，有100个任务量要产生
    t1 = threading.Thread(target=get, args=(i,))
    t1.start()
for o in range(100):
    # 处理任务启动
    t = threading.Thread(target=fun, args=(o,))
    t.start()
```

上面这个代码主要是针对骨架进行拆分解说，一般的生产者消费者模式都是这种构架，下面用一个更加清晰的案例来帮助理解。

### 案例二

```
# -*- coding:utf-8 -*-
import time
import queue
import threading

q = queue.Queue(10)     # 生成一个队列，用来保存“包子”，最大数量为10

def productor(i):
    # 厨师不停地每2秒做一个包子
    while True:
        q.put("厨师 %s 做的包子！" % i)
        time.sleep(2)

def consumer(j):
    # 顾客不停地每秒吃一个包子
    while True:
        print("顾客 %s 吃了一个 %s"%(j,q.get()))
        time.sleep(1)

# 实例化了3个生产者（厨师）
for i in range(3):
    t = threading.Thread(target=productor, args=(i,))
    t.start()
# 实例化了10个消费者（顾客）
for j in range(10):
    v = threading.Thread(target=consumer, args=(j,))
    v.start()
```

### 案例三

使用生产者消费者模式实现代理IP扫描并且同步扫描代理IP是否可用，如果不适用生产者消费者模式的话，首先要获取代理IP，然后把获取到的IP放在一个列表，然后在扫描列表的IP，扫描过程为—->获取IP—->IP保存—->IP存活扫描。过程是单向的，也就是说没办法同步一边获取IP然后马上验证。

下面的代码是用生产者消费者模式实现代理IP的获取与存活扫描。

```
# -*- coding: utf-8 -*-
# @Time    : 2018/5/3 0003 10:52
# @Author  : Sun
# @Blog    : wandouduoduo
# @File    : 生产者消费者.py
# @Software: PyCharm
import sys
import Queue
import time
import requests
import re
import threading
reload(sys)
sys.setdefaultencoding('utf-8')
q = Queue.Queue(10)
headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'}
def get_ip(page):
    url1='http://www.66ip.cn/mo.php?sxb=&tqsl=30&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea='
    url2='http://www.xicidaili.com/nn/%s'
    for i in range(1,page):
        url1_1=url1+str(i)
        url2_2=url2+str(i)
        try:
            r = requests.get(url=url1_1,headers=headers,timeout=5)
            #time.sleep(20)
            rr = re.findall('        (.*?)<br />',r.content)
            for x in rr:
                q.put(x)
            time.sleep(20)
        except Exception,e:
            print e
        try:
            time.sleep(30)
            r = requests.get(url=url2_2,headers=headers,timeout=5)
            rr = re.findall('/></td>(.*?)<a href',r.content,re.S)
            for x in rr:
                x1 = x.replace('\n','').replace('<td>','').replace("</td>",':').replace('      ','').replace(':  ','')
                print x1
                q.put(x1)
            time.sleep(20)
        except Exception,e:
            print e
def scan_ip():
    while 1:
        proxies={}
        ip = q.get()
        proxies['http'] = str(ip)
        try:
            req2 = requests.get(url='http://blog.csdn.net/lzy98', proxies=proxies, headers=headers, timeout=5)
            if 'One puls' in req2.content:
                print str(proxies['http']) + unicode('该代理可正常访问网页...','utf-8')
            else:
                print unicode('  该代理无法访问网页,继续验证下一代理...', 'utf-8')
        except :
            print str(proxies['http'])+unicode('  无法连接到代理服务器','utf-8')

for i in range(2):
    # 这里是要开2个任务量，就是2个线程
    t = threading.Thread(target=get_ip,args=(10,))
    # 传入的参数是10，回归到get_ip函数，发现传入的参数就是要扫描提供代理网站的页数
    t.start()

t1 = threading.Thread(target=scan_ip)
t1.start()
```

运行结果：

```
177.132.249.127:20183无法连接到代理服务器
39.104.82.143:8080无法连接到代理服务器
123.231.203.139:8080无法连接到代理服务器
180.250.43.66:8080该代理可正常访问网页...
189.127.238.65:8080无法连接到代理服务器
107.178.3.105:8181该代理可正常访问网页...
95.31.80.67:53281该代理可正常访问网页...
79.174.160.167:8080无法连接到代理服务器
223.242.94.36:31588无法连接到代理服务器
该代理无法访问网页,继续验证下一代理...
5.188.155.243:8080无法连接到代理服务器
180.183.17.151:8080该代理可正常访问网页...
113.90.247.99:8118该代理可正常访问网页...
180.119.65.184:3128无法连接到代理服务器
```

## Python3中的线程池方法

虽然在2版本中并没有线程池，但是在3版本中有相关线程池的使用方法。

```
from concurrent.futures import ThreadPoolExecutor
executor = ThreadPoolExecutor(3)
# 实例化线程池对象，开启3个线程
def fun(a,b):
    print (a,b)
    returl a**b
# 定义一个函数
executor.submit(fun,2,5) # y运行结果：2,5
# 这是调用与开启线程
result=executor.submit(fun,5,2)
print result # 运行结果: 25
# 如果要有很多参数传入进行运算
executor.map(fun,[1,2,3,4],[2,3,5,6])
```