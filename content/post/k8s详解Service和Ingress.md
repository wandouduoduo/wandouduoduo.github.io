---
title: k8s详解Service和Ingress
categories:
  - 容器编排
  - K8s
tags:
  - K8s
copyright: true
abbrlink: a0eec1b7
date: 2022-07-26 11:18:20
---

# Service 的概念

Kubernetes Service定义了这样一种抽象：一个Pod的逻辑分组，一种可以访问它们的策略 —— 通常称为微服务。这一组Pod能够被Service访问到，通常是通过Label Selector

通俗的讲：SVC负责检测Pod的状态信息，不会因pod的改动IP地址改变（因为关注的是标签），导致Nginx负载均衡影响

![](1.png)


Service能够提供负载均衡的能力，但是在使用上有以下限制：

- 默认只提供 4 层负载均衡能力（IP+端口），而没有 7 层功能（主机名和域名），但有时我们可能需要更多的匹配规则来转发请求，这点上 4 层负载均衡是不支持的
- 后续可以通过Ingress方案，添加7层的能力

<!--more-->

# Service 的类型

Service 在 K8s 中有以下四种类型

- Clusterlp：默认类型，自动分配一个仅Cluster内部可以访问的虚拟IP
- NodePort：在ClusterlP基础上为Service在每台机器上绑定一个端口，这样就可以通过<NodeIP>:NodePort 来访问该服务
- LoadBalancer：在NodePort的基础上，借助 cloud provider 创建一个外部负载均衡器，并将请求转发到
  <NodeIP>：NodePort
- ExternalName：把集群外部的服务引入到集群内部来，在集群内部直接使用。没有任何类型代理被创建，这只有kubernetes1.7或更高版本的kube-dns才支持

①ClusterIp：默认类型，自动分配一个仅 Cluster 内部可以访问的虚拟 IP

![](2.png)

②NodePort：在 ClusterIP 基础上为 Service 在每台机器上绑定一个端口，这样就可以通过<NodeIP>:NodePort 来访问该服务
访问node01的30001相当于访问定义的SVC后端的80的三个不pod同服务（RR）
client——》nginx（负载接收器，反向代理）——》node1，node2

![](3.png)

③LoadBalancer：在 NodePort 的基础上，借助 cloud provider 创建一个外部负载均衡器，并将请求转发到<NodeIP>:NodePort

![](4.png)

④ExternalName：把集群外部的服务引入到集群内部来，在集群内部直接使用。没有任何类型代理被创建，这只有 kubernetes 1.7 或更高版本的 kube-dns 才支持

![](5.png)

**SVC基础导论**

![](6.png)

**总结:**

- 客户端访问节点时通过iptables实现的
- iptables规则是通过kube-proxy写入的
- apiserver通过监控kube-proxy去进行对服务和端点的监控的
- kube-proxy通过pod的标签（lables）去判断这个断点信息是否写入到Endpoints里去。

# VIP 和 Service 代理

在 Kubernetes 集群中，每个 Node 运行一个kube-proxy进程。kube-proxy负责为Service实现了一种VIP（虚拟 IP）的形式，而不是ExternalName的形式。在 Kubernetes v1.0 版本，代理完全在 userspace。在Kubernetes v1.1 版本，新增了 iptables 代理，但并不是默认的运行模式。从 Kubernetes v1.2 起，默认就是iptables 代理。在 Kubernetes v1.8.0-beta.0 中，添加了 ipvs 代理

代理层级：userspace——》iptables——》ipvs
在 Kubernetes 1.14 版本开始默认使用ipvs 代理

在 Kubernetes v1.0 版本，Service是 “4层”（TCP/UDP over IP）概念。在 Kubernetes v1.1 版本，新增了Ingress API（beta 版），用来表示 “7层”（HTTP）服务

**为何不使用 round-robin DNS？**
DNS会在很多的客户端里进行缓存，很多服务在访问DNS进行域名解析完成、得到地址后不会对DNS的解析进行清除缓存的操作，所以一旦有他的地址信息后，不管访问几次还是原来的地址信息，导致负载均衡无效。

# ipvs代理模式

ipvs 代理模式（标准）
这种模式，kube-proxy 会监视 Kubernetes Service对象和Endpoints，调用netlink接口以相应地创建ipvs 规则并定期与 Kubernetes Service对象和Endpoints对象同步 ipvs 规则，以确保 ipvs 状态与期望一致。访问服务时，流量将被重定向到其中一个后端 Pod

与 iptables 类似，ipvs 于 netfilter 的 hook 功能，但使用哈希表作为底层数据结构并在内核空间中工作。这意味着 ipvs 可以更快地重定向流量，并且在同步代理规则时具有更好的性能。此外，ipvs 为负载均衡算法提供了更多选项，例如：

①rr：轮询调度
②lc：最小连接数
③dh：目标哈希
④sh：源哈希
⑤sed：最短期望延迟
⑥nq：不排队调度

![](7.png)


<–注意；ipvs模式假定在运行 kube-proxy 之前在节点上都已经安装了IPVS内核模块。当kube-proxy以ipvs代理模式启动时，kube-proxy 将验证节点上是否安装了IEVS模块，如果末安装，则kube-proxy 将回退到iptables 代理模式–>

```bash
ipvsadm -Ln
kubectl get svc
```

# Service实验讲解

## ClusterIP

clusterIP 主要在每个 node 节点使用 iptables，将发向 clusterIP 对应端口的数据，转发到 kube-proxy 中。然后 kube-proxy 自己内部实现有负载均衡的方法，并可以查询到这个 service 下对应 pod 的地址和端口，进而把数据转发给对应的 pod 的地址和端口

![](8.png)

为了实现图上的功能，主要需要以下几个组件的协同工作：

- apiserver 用户通过kubectl命令向apiserver发送创建service的命令，apiserver接收到请求后将数据存储到etcd中
- kube-proxy kubernetes的每个节点中都有一个叫做kube-porxy的进程，这个进程负责感知service，pod的变化，并将变化的信息写入本地的iptables规则中
- iptables 使用NAT等技术将virtualIP的流量转至endpoint中

***api将信息写到etcd，kubeproxy监测etcd的变化，得到变化以后写入到ipvs规则***

**第一步 创建 svc-deployment.yaml 文件**

```yaml
[root@k8s-master01 ~]# vim svc-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deploy # deployment的名字
  namespace: default
spec:
  replicas: 3  # 副本数目为3
  selector:
    matchLabels: # 匹配
      app: myapp
      release: stabel
  template:
    metadata:
      labels:
        app: myapp
        release: stabel
        env: test
    spec:
      containers:
      - name: myapp
        image: wangyanglinux/myapp:v2
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 80
```

```bash
kubectl apply -f svc-deployment.yaml
```

![](9.png)

```bash
kubectl get pod -o wide
curl 10.244.2.44
```

![](10.png)

这样地址访问，不太行。如果pod死亡后会出现新的pod，然后与之前的地址又不一致。因此 为了可靠的访问，需要进行第二步，SVC创建

**第二步 给deploy绑定svc，即创建 Service 信息**

```yaml
[root@k8s-master01 ~]# vim svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: default
spec:
  type: ClusterIP # 不指定的话默认而已是Cluster IP
  selector:
    app: myapp # 一定与svc-deployment.yaml的标签要匹配
    release: stabel
  ports:
  - name: http
    port: 80
    targetPort: 80 # 目标后端服务的端口
```

```bash
kubectl apply -f svc.yaml
kubectl get svc
ipvsadm -Ln
```

这里是两个的原因是因为有一个容器还在创建，没关系

![](11.png)

kubectl delete -f svc.yaml 也可以看得到对应的服务也被删除了。

直接访问svc的IP地址，相当于通过ipvs模块，负载均衡，实现代理到后端节点上。

![](12.png)

直接访问svc的IP地址，可以看到轮询RR效果

![](13.png)

## Headless Service

它属于一种特殊的Cluster IP，
有时不需要或不想要负载均衡，以及单独的 Service IP 。遇到这种情况，可以通过指定 ClusterIP(spec.clusterIP) 的值为 “None” 来创建 Headless Service 。这类 Service 并不会分配 Cluster IP， kube-proxy 不会处理它们，而且平台也不会为它们进行负载均衡和路由

```bash
[root@k8s-master01 ~]# vim svc-none.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-headless
  namespace: default
spec:
  selector:
   app: myapp
  clusterIP: "None"
  ports:
  - port: 80
    targetPort: 80
[root@k8s-master01 ~]# kubectl apply -f svc-none.yaml
[root@k8s-master01 ~]# kubectl get svc
```

![](14.png)

虽然没有svc了，但是可以通过域名的方案依然可以访问
svc创建成功会把主机名（svc名.名字空间名.集群域名）写入到coredns

```bash
[root@k8s-master01 ~]# kubectl get pod -n kube-system -o wide 获取当前dns的地址信息
[root@k8s-master01 ~]# dig -t A myapp-headless.default.svc.cluster.local. @10.244.0.12
```

![](15.png)

## NodePort

可以在当前的物理机上，暴露一个端口，让内部服务暴露到外部
客户端可以通过物理机IP+端口方式 访问到集群内部

nodePort原理在于在 node 上开了一个端口，将向该端口的流量导入到 kube-proxy，然后由 kube-proxy 进一步（与接口层交互）到给对应的 pod

```bash
[root@k8s-master01 ~]# vim nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: default
spec:
  type: NodePort # 不指定的话默认而已是Cluster IP
  selector:
    app: myapp # 一定与svc-deployment.yaml的标签要匹配
    release: stabel
  ports:
  - name: http
    port: 80
    targetPort: 80 # 目标后端服务的端口

[root@k8s-master01 ~]# kubectl apply -f nodeport.yaml
[root@k8s-master01 ~]# kubectl get pod
[root@k8s-master01 ~]# kubectl get svc
```

同时可以看出，一组pod可以对应不同的svc的。只要pod标签与svc标签一致就可以关联。多对多的关系 n:m

![](16.png)

浏览器访问：master虚拟机IP:端口 **10.0.100.10:32642**
并且子节点pod也会开启这个端口
**10.0.100.11:32642与10.0.100.12:32642**

![](17.png)

![](18.png)

查询流程

```bash
ipvsadm -Ln
iptables -t nat -nvL
```

## LoadBalancer

loadBalancer和nodePort其实是同一种方式。区别在于loadBalancer比nodePort多了一步，就是可以调用cloud provider去创建LB来向节点导流（LB收费）

![](19.png)

## ExternalName

别名操作，外部服务引入到集群内
这种类型的 Service 通过返回 CNAME 和它的值，可以将服务映射到 externalName 字段的内容( 例如：hub.atguigu.com )。ExternalName Service 是 Service 的特例，它没有 selector，也没有定义任何的端口和Endpoint。相反的，对于运行在集群外部的服务，它通过返回该外部服务的别名这种方式来提供服务

```yaml
kind: Service
apiVersion: v1
metadata:
 name: my-service-1
 namespace: default
spec:
 type: ExternalName
 externalName: hub.atguigu.com
```

当查询主机 my-service-1.defalut.svc.cluster.local ( SVC_NAME.NAMESPACE.svc.cluster.local ) 时，集群的DNS 服务将返回一个值 hub.atguigu.com 的 CNAME 记录。访问这个服务的工作方式和其他的相同，唯一不同的是重定向发生在 DNS 层，而且不会进行代理或转发

```bash
vim ex.yaml
kubectl create -f ex.yaml
kubectl get svc
```

![](20.png)

```bash
dig -t A my-service-1.default.svc.cluster.local @10.244.0.13
```


这个IP是coredns地址，通过**kubectl get pod -n kube-system -o wide**

 ![](21.png)

# Ingress

对传统的SVC来说仅支持四层

## 资料信息

Ingress-Nginx github 地址：https://github.com/kubernetes/ingress-nginx
Ingress-Nginx 官方网站：https://kubernetes.github.io/ingress-nginx/

![](22.png)

其实对Nginx的暴露方案是Nodepod，内部的服务暴露给外部

![](23.png)

## 部署Ingress

```bash
kubectl apply -f mandatory.yaml
kubectl apply -f service-nodeport.yaml
```

进入官方下载

```bash
cd /usr/local/install-k8s/plugin/
mkdir ingress
wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/mandatory.yaml
cat mandatory.yaml | grep image
得到xxx
docker pull xxx
```

第一步：三个节点，一主二子都要解压导入

```bash
tar -zxvf ingree.contro.tar.gz #解压
docker load -i ingree.contro.tar  #导入
```

![](24.png)

第二步：创建pod和svc

```bash
kubectl apply -f mandatory.yaml
kubectl get pod -n ingress-nginx
kubectl apply -f service-nodeport.yaml
kubectl get svc -n ingress-nginx
```

![](25.png)

## Ingress HTTP代理访问

deployment、Service、Ingress Yaml 文件

现在想通过Nginx的Ingress方案暴露出去，实现域名访问的这么一个结构

```bash
[root@k8s-master01 ~]# vim ingress.http.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-dm
spec:
  replicas: 2
  template:
    metadata:
      labels:
        name: nginx
    spec:
      containers:
        - name: nginx
          image: wangyanglinux/myapp:v1
          imagePullPolicy: IfNotPresent # 如果有就不下载
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector: # 匹配，当name=nginx的时
    name: nginx

[root@k8s-master01 ~]# kubectl apply -f ingress.http.yaml
deployment.extensions/nginx-dm created
service/nginx-svc created
[root@k8s-master01 ~]# kubectl get svc
NAME             TYPE           CLUSTER-IP       EXTERNAL-IP          PORT(S)        AGE
nginx-svc        ClusterIP      10.102.101.216   <none>               80/TCP         5s
[root@k8s-master01 ~]# curl 10.102.101.216
Hello MyApp | Version: v1 | <a href="hostname.html">Pod Name</a>
```

![](26.png)

```
[root@k8s-master01 ~]# vim ingress1.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
   name: nginx-test
spec:
  rules:
    - host: www1.atguigu.com
      http:
        paths:
        - path: /
          backend:
            serviceName: nginx-svc # 链接的是上面svc的名字
            servicePort: 80

[root@k8s-master01 ~]# kubectl apply -f ingress1.yaml 
ingress.extensions/nginx-test created
```

在W10下进行测试，修改本地host解析，C:\Windows\System32\drivers\etc\hosts
**10.0.100.10 www1.atguigu.com**
注意访问的端口不是80，而是ingress的端口32510

```bash
kubectl get svc -n ingress-nginx
```

![](27.png)

![](28.png)

![](29.png)

## 基于Ingress实现虚拟主机方案

![](30.png)

第一个deployment和第一个svc

```bash
[root@k8s-master01 ~]# mkdir ingress-vh
[root@k8s-master01 ~]# cd ingress-vh/
[root@k8s-master01 ingress-vh]# vim deployment.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: deployment1
spec:
  replicas: 2
  template:
    metadata:
      labels:
        name: nginx
    spec:
      containers:
        - name: nginx
          image: wangyanglinux/myapp:v1
          imagePullPolicy: IfNotPresent # 如果有就不下载
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: svc-1
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector: # 匹配，当name=nginx的时
    name: nginx
[root@k8s-master01 ingress-vh]# kubectl apply -f deployment.yaml 
```

![](31.png)

第二个deployment和第二个svc

```bash
[root@k8s-master01 ingress-vh]# cp -a deployment.yaml deployment2.yaml
[root@k8s-master01 ingress-vh]# vim deployment2.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: deployment2
spec:
  replicas: 2
  template:
    metadata:
      labels:
        name: nginx2
    spec:
      containers:
        - name: nginx2
          image: wangyanglinux/myapp:v2
          imagePullPolicy: IfNotPresent # 如果有就不下载
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: svc-2
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector: # 匹配，当name=nginx的时
    name: nginx2

[root@k8s-master01 ingress-vh]# kubectl apply -f deployment2.yaml 
[root@k8s-master01 ingress-vh]# kubectl get svc
```

![](32.png)

写Ingress1、2规则

```bash
[root@k8s-master01 ~]# vim ingressrule.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
   name: ingress1
spec:
  rules:
    - host: www1.atguigu.com
      http:
        paths:
        - path: /
          backend:
            serviceName: svc-1 # 链接的是上面svc的名字
            servicePort: 80
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
   name: ingress2
spec:
  rules:
    - host: www2.atguigu.com
      http:
        paths:
        - path: /
          backend:
            serviceName: svc-2 # 链接的是上面svc的名字
            servicePort: 80
[root@k8s-master01 ~]# kubectl apply -f ingressrule.yaml
```

![](33.png)

```bash
[root@k8s-master01 ingress-vh]# kubectl get pod -n ingress-nginx
NAME                                        READY   STATUS    RESTARTS   AGE
nginx-ingress-controller-7995bd9c47-kzqh2   1/1     Running   0          83m
[root@k8s-master01 ingress-vh]# kubectl exec nginx-ingress-controller-7995bd9c47-kzqh2 -n ingress-nginx -it -- /bin/bash

#查看发现，写入的Ingress规则会自己转换注入到配置文件
```

![](34.png)

查看Ingress暴露的端口**kubectl get svc -n ingress-nginx**

![](35.png)

**kubectl get ingress** 查看规则

浏览器访问测试

![](36.png)

动态图效果演示虚拟主机

![](20201001194827956.gif)

## Ingress HTTPS 代理访问

![](37.png)

创建证书，以及 cert 存储方式

```bash
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=nginxsvc/O=nginxsvc"
kubectl create secret tls tls-secret --key tls.key --cert tls.crt
```

deployment、Service、Ingress Yaml 文件

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-test
spec:
  tls:
    - hosts:
      - foo.bar.com
      secretName: tls-secret
  rules:
    - host: foo.bar.com
      http:
        paths:
        - path: /
          backend:
            serviceName: nginx-svc
            servicePort: 80
```

操作过程
第一步：创建证书，以及cert存储方式

```bash
[root@k8s-master01 ~]# mkdir https
[root@k8s-master01 ~]# cd https
[root@k8s-master01 https]# openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=nginxsvc/O=nginxsvc"
Generating a 2048 bit RSA private key
....................................................................+++
...............+++
writing new private key to 'tls.key'
-----
[root@k8s-master01 https]# kubectl create secret tls tls-secret --key tls.key --cert tls.crt
```

![](38.png)

第二步：创建deployment、Service文件

```bash
[root@k8s-master01 https]# cp /root/ingress-vh/deployment.yaml .
[root@k8s-master01 https]# vim deployment.yaml 

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: deployment3
spec:
  replicas: 2
  template:
    metadata:
      labels:
        name: nginx3
    spec:
      containers:
        - name: nginx
          image: wangyanglinux/myapp:v3
          imagePullPolicy: IfNotPresent # 如果有就不下载
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: svc-3
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector: # 匹配，当name=nginx的时
    name: nginx3

[root@k8s-master01 https]# kubectl apply -f deployment.yaml 
deployment.extensions/deployment3 created
service/svc-3 created
[root@k8s-master01 https]# kubectl get svc
```

![](39.png)

第三步：创建Ingress Yaml文件
多了个tls

```bash
[root@k8s-master01 https]# vim https.ingress.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: https
spec:
  tls:
    - hosts:
      - www3.atguigu.com
      secretName: tls-secret
  rules:
    - host: www3.atguigu.com
      http:
        paths:
        - path: /
          backend:
            serviceName: svc-3
            servicePort: 80
[root@k8s-master01 https]# kubectl apply -f https.ingress.yaml
ingress.extensions/https created
[root@k8s-master01 https]# kubectl get svc -n ingress-nginx
NAME            TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx   NodePort   10.110.174.77   <none>        80:32510/TCP,443:31401/TCP   118m
```

![](41.png)

浏览器访问看效果
https://www3.atguigu.com:31401

![](40.png)

![](42.png)

## Nginx进行BasicAuth

对于nginx来说采用的apache认证的模块

```bash
mkdir basic-auth
cd basic-auth
yum -y install httpd
htpasswd -c auth foo # 用户名为foo，文件为auth
kubectl create secret generic basic-auth --from-file=auth
```

![](43.png)

vim ingress.yaml

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: ingress-with-auth
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: 'Authentication Required - foo'
spec:
  rules:
  - host: auth.atguigu.com  # 访问该域名进行认证方案
    http:
      paths:
      - path: /
        backend:
          serviceName: svc-1
          servicePort: 80
```

```bash
[root@k8s-master01 basic-auth]# kubectl apply -f ingress.yaml
ingress.extensions/ingress-with-auth created
```

访问的是80端口对应的32510端口

![](44.png)

浏览器访问

![](45.png)

![](46.png)

![](47.png)

## Nginx进行重写

![](48.png)

实验操作
访问www4，跳到www3。 https访问

![](49.png)

vim re.yaml

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-test
  annotations:
    # 重定向到目标的url，注意这里是s
    nginx.ingress.kubernetes.io/rewrite-target: https://www3.atguigu.com:31401/hostname.html
spec:
 rules:
 - host: re.atguigu.com
   http:
     paths:
     - path: /
       backend:
         serviceName: svc-1 # 这个svc也可不指定，因为他上面已跳转
         servicePort: 80
```

ps:遇到粘贴错乱可以在set paste

![](50.png)

浏览器访问：http://re.atguigu.com:32510/
跳转到 https://www3.atguigu.com:31401/hostname.html