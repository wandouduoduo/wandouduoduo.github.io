---
title: 业务监控工具Sentry的搭建与使用
categories: 
- 服务搭建
- 监控系统
tags:
- Sentry
copyright: true
date: 2019-06-03 14:22:04
---



### 官方网址

参考[Django Sentry 官网](https://sentry.io/welcome/)



### Sentry 简介

Sentry 是一个开源的实时错误报告工具，支持 web 前后端、移动应用以及游戏，支持 Python、OC、Java、Go、Node、Django、RoR 等主流编程语言和框架 ，还提供了 GitHub、Slack、Trello 等常见开发工具的集成。
Sentry 服务支持多用户、多团队、多应用管理，每个应用都对应一个 PROJECT_ID，以及用于身份认证的 PUBLIC_KEY 和 SECRET_KEY。由此组成一个这样的 DSN：

```
{PROTOCOL}://{PUBLIC_KEY}:{SECRET_KEY}@{HOST}/{PATH}{PROJECT_ID}
```

PROTOCOL 通常会是 http 或者 https，HOST 为 Sentry 服务的主机名和端口，PATH 通常为空。

<!--more-->

### 环境依赖

1. Redis 搭建 / RabbitMQ 的搭建
2. MySQL / PostgreSQL
3. Python 虚拟环境



### 安装教程

- Redis 的安装
  参考文档：
  https://linux.cn/article-6719-1.html
  http://www.jianshu.com/p/aec247ffbe51
- MySQL 的安装
  - 略
- Python 虚拟环境的安装
  因为 Sentry 依赖的 Python 库比较多，为了避免对系统环境的污染，与现有的Python有冲突，建议还是将 Sentry 安装在虚拟环境中。

```
A. Python 库文件： python-setuptools, python-dev, build-essential, python-pip

B. 安装虚拟环境： pip install virtualenv
     安装完成后，可以直接 virtualenv xxx 即可在当前目录下生成一个虚拟环境xxx目录，进入到目录中，source bin/activate 即可激活当前虚拟环境。

C. 选择安装 virtualenvwrapper： pip install virtualenvwrapper
     安装完成后，建立个虚拟环境安装存储的目录，建议是 $HOME/.virtualenv 目录，配置下 .bashrc 文件，文件末尾添加：
     export WORKON_HOME=$HOME/.virtualenvs
     source /usr/local/bin/virtualenvwrapper.sh

source .bashrc后，运行 mkvirtualenv xxx 即可建立虚拟环境。退出运行 deactivate。这样，就不需要再进入到虚拟环境目录运行 source xxx/activate，直接在终端输入 workon xxx 即可。
```

- Sentry
  在虚拟环境下，直接运行 `pip install sentry` 即可。

这样，安装基本上就结束了。接下来需要配置下 sentry。



### 配置 Sentry

运行 `sentry init`, 会在 $HOME 下生成 `.sentry` 目录。进入 .sentry 后，需要修改数据库配置(当然，你也可以不改，直接使用 PostgreSQL)：

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # 这里换成了 MySQL，默认是 pq
        'NAME': 'xxx',
        'USER': 'xxx',
        'PASSWORD': 'xxx',
        'HOST': 'xxx',
        'PORT': 'xxx',
    }
}
```

端口和队列等可以自行指定。这里，我指定的是15000。下面是一个配置参考：

```
# This file is just Python, with a touch of Django which means
# you can inherit and tweak settings to your hearts content.
from sentry.conf.server import *

import os.path

CONF_ROOT = os.path.dirname(__file__)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django_sentry',
        'USER': 'root',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '3306',
        'AUTOCOMMIT': True,
        'ATOMIC_REQUESTS': False,
    }
}

# You should not change this setting after your database has been created
# unless you have altered all schemas first
SENTRY_USE_BIG_INTS = True

# If you're expecting any kind of real traffic on Sentry, we highly recommend
# configuring the CACHES and Redis settings

###########
# General #
###########

# Instruct Sentry that this install intends to be run by a single organization
# and thus various UI optimizations should be enabled.
SENTRY_SINGLE_ORGANIZATION = True
DEBUG = False

#########
# Cache #
#########

# Sentry currently utilizes two separate mechanisms. While CACHES is not a
# requirement, it will optimize several high throughput patterns.

# If you wish to use memcached, install the dependencies and adjust the config
# as shown:
#
#   pip install python-memcached
#
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
#         'LOCATION': ['127.0.0.1:11211'],
#     }
# }

# A primary cache is required for things such as processing events
SENTRY_CACHE = 'sentry.cache.redis.RedisCache'

#########
# Queue #
#########

# See https://docs.sentry.io/on-premise/server/queue/ for more
# information on configuring your queue broker and workers. Sentry relies
# on a Python framework called Celery to manage queues.
CELERY_ALWAYS_EAGER = False
BROKER_URL = 'redis://127.0.0.1:6379'

###############
# Rate Limits #
###############

# Rate limits apply to notification handlers and are enforced per-project
# automatically.

SENTRY_RATELIMITER = 'sentry.ratelimits.redis.RedisRateLimiter'

##################
# Update Buffers #
##################

# Buffers (combined with queueing) act as an intermediate layer between the
# database and the storage API. They will greatly improve efficiency on large
# numbers of the same events being sent to the API in a short amount of time.
# (read: if you send any kind of real data to Sentry, you should enable buffers)

SENTRY_BUFFER = 'sentry.buffer.redis.RedisBuffer'

##########
# Quotas #
##########

# Quotas allow you to rate limit individual projects or the Sentry install as
# a whole.

SENTRY_QUOTAS = 'sentry.quotas.redis.RedisQuota'

########
# TSDB #
########

# The TSDB is used for building charts as well as making things like per-rate
# alerts possible.

SENTRY_TSDB = 'sentry.tsdb.redis.RedisTSDB'

###########
# Digests #
###########

# The digest backend powers notification summaries.

SENTRY_DIGESTS = 'sentry.digests.backends.redis.RedisBackend'

################
# File storage #
################

# Any Django storage backend is compatible with Sentry. For more solutions see
# the django-storages package: https://django-storages.readthedocs.org/en/latest/

SENTRY_FILESTORE = 'django.core.files.storage.FileSystemStorage'
SENTRY_FILESTORE_OPTIONS = {
    'location': '/tmp/sentry-files',
}

##############
# Web Server #
##############

# If you're using a reverse SSL proxy, you should enable the X-Forwarded-Proto
# header and uncomment the following settings
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# If you're not hosting at the root of your web server,
# you need to uncomment and set it to the path where Sentry is hosted.
# FORCE_SCRIPT_NAME = '/sentry'

SENTRY_WEB_HOST = '0.0.0.0'
SENTRY_WEB_PORT = 5000
SENTRY_WEB_OPTIONS = {
    # 'workers': 3,  # the number of web workers
    # 'protocol': 'uwsgi',  # Enable uwsgi protocol instead of http
}


LANGUAGES = (
    ('en', gettext_noop('English')),
    ('zh-cn', gettext_noop('Simplified Chinese')),
    # ('zh-cn', gettext_noop('Traditional Chinese')),
)
```



### 运行 Sentry

1. 初始化:

```
sentry upgrade
```

注意，这里可能会出现错误，可以参考下面遇到的坑。初始化的时候，需要设置一个 superuser 角色，直接按提示操作即可。

1. 启动 web 进程:

```
sentry run web
```

1. 启动 worker 进程:

```
sentry run worker
```

1. 这时候，通过 IP:PORT 的形式访问下，填写刚才填写的用户名和密码即可登录。登录后，我们创建一个 project。我这里设置的是 Odeon_Dev，接下来选择项目，我选择的是 Django。这个时候，会弹出一个在项目中配置的教程。我们按照提示操作即可。

测试环境的地址：

```
http://localhost:5000/sentry/odeon_dev/
```



### 项目中配置 Sentry

按照上面的操作，Sentry 服务就可以 run 起来了。接下来需要在 Odeon 的项目中配置下 Sentry 环境即可。这里，我们需要引入一个新包: raven。我安装的 是 raven 6.1.0

```
安装：
  A. 可以直接下载 raven 包，将其导入到环境中;
  B. 直接指令安装: build/env/bin/pip install raven==6.1.0

项目配置：
  直接将 sentry 创建 project 时返回的信息放入 settings 文件中即可

    import os
    import raven

    RAVEN_CONFIG = {
        'dsn': 'http://fxxx:xxx@localhost:xxx/2',
        'release': raven.fetch_git_sha(os.path.dirname(os.pardir)),
    }
```

至此，整个 Sentry 的搭建和项目中需要的配置就完全 OK 了。
当然，也可以更完善一下，比如：

1. 利用 Nginx 反向代理使用域名访问服务；
2. 利用 supervisor 来起 Sentry 服务等。

接下来，就是按需使用了。

### 遇到的坑

1. sentry默认使用 PostgreSQL。我用的是 mysql。运行 sentry upgrade 的时候，发现运行到 db migration 的时候抛了异常，查阅发现是 db engine 使用的是MyISAM，不支持 transaction 导致的。这里需要注意下，我将 engine 指定为 InnoDB后，执行 migration 的时候错误消失。
2. 页面打开后，提示 worker 没有正常运行。发现没有启动 worker。我们手动启动下 worker，启动时，需要在系统中将 C_FORCE_ROOT 设置为 true。详细点击： [参考链接](https://stackoverflow.com/questions/20346851/running-celery-as-root)

### 参考链接：

- https://yunsonbai.top/2016/05/30/django-sentry/
- https://tech.liuchao.me/2015/06/monitor-service-error-logs-by-using-sentry/