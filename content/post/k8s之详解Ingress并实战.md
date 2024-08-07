---
title: k8s之详解Ingress并实战
categories:
  - 容器编排
  - K8s
tags:
  - K8s
copyright: true
abbrlink: f6f38be4
date: 2020-07-07 17:39:06
---

## 目的

本文对k8s中Ingress反向代理进行详细剖析，详细介绍了原理，并通过实际例子来详细说明。



<!--more-->

## 简介

Kubernetes 暴露服务的有三种方式：分别为 LoadBlancer Service、NodePort Service、Ingress。

官网对 Ingress 的定义为管理对外服务到集群内服务之间规则的集合。通俗点讲就是它定义规则来允许进入集群的请求被转发到集群中对应服务上，从来实现服务暴露。 Ingress 能把集群内 Service 配置成外网能够访问的 URL，流量负载均衡，终止SSL，提供基于域名访问的虚拟主机等等。



**LoadBlancer**

LoadBlancer Service 是 Kubernetes 结合云平台的组件，如国外 GCE、AWS、国内阿里云等等，使用它向使用的底层云平台申请创建负载均衡器来实现，有局限性，对于使用云平台的集群比较方便，但有局限，费用高。



**NodePort**

NodePort Service 是通过在节点上暴露端口，然后通过将端口映射到具体某个服务上来实现服务暴露，比较直观方便，但是对于集群来说，随着 Service 的不断增加，需要的端口越来越多，很容易出现端口冲突，而且不容易管理。当然对于小规模的集群服务，还是比较不错的。但是还是有安全风险，因为看过前面k8s教程，并动手操作搭建的同学都知道，在搭建前会把各个节点的防火墙等等都关闭。那么如果用这种方式又打开很多端口，那么安全会面临很大挑战。

![](8.png)

***总结：以上两种服务从各方面看似都不太理想，所以通过情况下，我们会通过Ingress对象来实现安全，方便统一管理。***



## Ingress概述

在k8s集群中，我们知道service和pod的ip为内网ip，仅能在集群内部才可以访问。如果外部应用想要直接访问集群内的服务，就需要把外部请求通过负载均衡转发到service上，然后再由kube-proxy组件将其转发给相关的pod。

而Ingress的作用就是为进入集群的请求提供路由规则集合和转发。通俗点就是提供外部访问集群的入口，将外部的请求转发到集群内部service上。

![](9.png)

## Ingress组成

Ingress 使用开源的反向代理负载均衡器来实现对外暴露服务目的，比如用Nginx、Apache、Haproxy等。用的最多的是使用nginx来做的。

Nginx Ingress 一般有三个组件组成：

- **ingress**    是kubernetes的一个资源对象，用于编写定义规则。将nginx的配置抽象成一个Ingress对象，当用户每添加一个新的服务，只需要编写一个新的ingress的yaml文件即可。
- **反向代理负载均衡器**  通常以Service的Port方式运行，接收并按照ingress定义的规则进行转发，通常为nginx，haproxy，traefik等，本文使用nginx。
- **ingress-controller**    监听apiserver，获取服务新增，删除等变化，并结合ingress规则动态更新到反向代理负载均衡器上，并重载配置使其生效。
  以上三者有机的协调配合起来，就可以完成 Kubernetes 集群服务的暴漏。

![](1.png)

**组件说明**

externalLB :  外部的4层负载均衡器
<Service> ingress-nginx : nodePort 类型的 service 为 <IngressController> ingress-nginx 的 pod 接入外部流量
<IngressController> ingress-nginx : ingress-nginx pod, 负责创建负载均衡
<Ingress> : Ingress 根据后端 Service 实时识别分类及 IP 把结果生成配置文件注入到 ingress-nginx pod 中
<Service> site1 : Service 对后端的pod 进行分类(只起分类作用)



## Ingress工作原理

- ingress controller通过和kubernetes api交互，动态的去感知集群中ingress规则变化。
- 然后读取它，按照自定义的规则，规则就是写明了那个域名对应哪个service，生成一段nginx配置。
- 在写到nginx-ingress-controller的pod里，这个Ingress controller的pod里运行着一个Nginx服务，控制器会把生成的nginx配置写入/etc/nginx.conf文件中。
- 然后reload一下使配置生效，以此达到分配和动态更新问题。



## **Ingress解决痛点**

**动态配置服务**
如果按照传统方式，当新增加一个服务时，我们可能需要在流量入口加一个反向代理指向我们新的服务，而使用ingress，只需要配置好ingress，当服务启动时，会自动注册到ingress当中，不需要额外的操作。

**减少不必要的Port暴露（安全，端口容易管理）**
我们知道部署k8s时，是需要关闭防火墙的，主要原因是k8s的很多服务会以nodeport方式映射出去，这样对于宿主机来说是非常的不安全的，而ingress可以避免这个问题，只需要将ingress自身服务映射出去，就可代理后端所有的服务，则后端服务不需要映射出去。



## 环境

k8s 版本为1.18.3

*版本API 相关弃用*

*所有资源的 API `apps/v1beta1` 和 `apps/v1beta2` 都将弃用，请改用 `apps/v1` 替代。*
*`daemonsets`, `deployments`, `replicasets` 资源的 API `extensions/v1beta1` 将被弃用，请改用 apps/v1 替代。*
*`networkpolicies` 资源的 API `extensions/v1beta1` 将被弃用，请改用 networking.k8s.io/v1 替代。*
*`podsecuritypolicies` 资源的 API `extensions/v1beta1` 将被弃用，请使用 `policy/v1beta1` 替代。*



## 部署Ingress-nginx

可以将上面的Ingress理解为在集群的前端加了一个Nginx，用来提供Nginx所能提供的一切功能，例如基于url的反向代理，https认证，用户鉴权，域名重定向等等

![](10.png)

需要注意几点：

- Nginx是基于url的，如果没有DNS解析url到集群中任意ip可以考虑hosts文件劫持

- Nginx的本质也是NodePort的方式暴露给集群外的一个特殊Service

- Nginx的配置文件根据Ingress的规则自动添加和修改

  *更详细的介绍可以查看[官方网站]*(https://kubernetes.github.io/ingress-nginx/)。
  下面通过nodepore和ingree-nginx对比实战，让你充分理解。

  

### 先用NodePort测试

##### 拉取镜像

需要使用到httpd、tomcat镜像

```bash
docker pull httpd
docker pull tomcat
```

![](2.png)

##### 创建namespace

```yaml
##创建yaml文件：
vim ns.yaml

apiVersion: v1
kind: Namespace
metadata:
  name: ingress-test
  
#创建并查看namespace：
 kubectl create -f ns.yaml 
 kubectl  get ns 
```

![](3.png)

##### **创建deployment及service资源**

**创建httpd及service资源文件**

```yaml
#mkdir ingress-nginx
#cd ingress-nginx

#vim httpd.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpd
  namespace: ingress-test
spec:
  replicas: 3
  selector:
    matchLabels:
      name: httpd
  template:
    metadata:
      labels:
        name: httpd
    spec:
      containers:
      - name: httpd
        image: 10.145.197.182/ops/httpd:latest  #镜像从私有仓库中进行拉取
---
apiVersion: v1
kind: Service
metadata:
  name: httpd-svc
  namespace: ingress-test
spec:
  type: NodePort
  selector:
    name: httpd
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 32134
```

**创建tomcat及service资源文件**

```yaml
# vim tomcat.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: tomcat
  namespace: ingress-test
spec:
  replicas: 3
  selector:
    matchLabels:
      name: tomcat
  template:
    metadata:
      labels:
        name: tomcat
    spec:
      containers:
      - name: tomcat
        image: 10.145.197.182/ops/tomcat:latest
---
apiVersion: v1
kind: Service
metadata:
  name: tomcat-svc
  namespace: ingress-test
spec:
  type: NodePort
  selector:
    name: tomcat
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
    nodePort: 32135
```

**创建并查看**

```bash
#创建
kubectl create -f  httpd.yaml 
kubectl create -f tomcat.yaml

#查看状态
kubectl get pods -n ingress-test
kubectl get svc -n ingress-test
```

![](4.png)

![](5.png)

可以看到通过nodeport暴露的方式是没有问题的，但是到该种方式在大规模的集群服务中，有很大的缺陷，所以接下来通过ingress-nginx进行实现。



### 创建ingress-nginx

从GitHub上下载yaml文件：[官方地址](https://github.com/kubernetes/ingress-nginx/blob/master/docs/deploy/index.md)

```bash
wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f deploy.yaml

# 部署环境为私有环境没有lb 所有把Deployment改成DaemonSet 同时网络模式使用hostNetwork
# 同时配文件 跟启动参数修改
# kubelet 参数node-ip 为ipv6 模式记得修改 service ipFamily: IPv6 模式不然新版本webhook 会报错
# 报错内容 Error from server (InternalError): error when creating "STDIN": Internal error occurred: failed calling webhook "validate.nginx.ingress.kubernetes.io": Post https://ingress-nginx-controller-admission.ingress-nginx.svc:443/extensions/v1beta1/ingresses?timeout=30s: no endpoints available for service "ingress-nginx-controller-admission"
```

```yaml
#对照如下deploy.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx
  labels:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx

---
# Source: ingress-nginx/templates/controller-serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx
  namespace: ingress-nginx
---
# Source: ingress-nginx/templates/controller-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
data:
  allow-backend-server-header: "true"
  client-body-buffer-size: 1024k
  enable-underscores-in-headers: "true"
  generate-request-id: "true"
  ignore-invalid-headers: "true"
  large-client-header-buffers: 4 128k
  log-format-upstream: $remote_addr - [$remote_addr] - $remote_user [$time_local]
    "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length
    "$http_x_forwarded_for" $remote_addr $request_time [$proxy_upstream_name] $upstream_addr
    $upstream_response_length $upstream_response_time $upstream_status $req_id $host
  max-worker-connections: "65536"
  proxy-body-size: 8192m
  proxy-buffer-size: 64k
  proxy-connect-timeout: "300"
  proxy-next-upstream-timeout: "10"
  proxy-read-timeout: "300"
  proxy-send-timeout: "300"
  reuse-port: "true"
  server-tokens: "false"
  ssl-redirect: "false"
  upstream-keepalive-connections: "10000"
  upstream-keepalive-requests: "1000"
  upstream-keepalive-timeout: "300"
  worker-cpu-affinity: auto
---
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: tcp-services
  namespace: ingress-nginx
data:
---
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: udp-services
  namespace: ingress-nginx
data:
---
# Source: ingress-nginx/templates/clusterrole.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
  name: ingress-nginx
  namespace: ingress-nginx
rules:
  - apiGroups:
      - ''
    resources:
      - configmaps
      - endpoints
      - nodes
      - pods
      - secrets
    verbs:
      - list
      - watch
  - apiGroups:
      - ''
    resources:
      - nodes
    verbs:
      - get
  - apiGroups:
      - ''
    resources:
      - services
    verbs:
      - get
      - list
      - update
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ''
    resources:
      - events
    verbs:
      - create
      - patch
  - apiGroups:
      - extensions
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingresses/status
    verbs:
      - update
  - apiGroups:
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingressclasses
    verbs:
      - get
      - list
      - watch
---
# Source: ingress-nginx/templates/clusterrolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
  name: ingress-nginx
  namespace: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx
subjects:
  - kind: ServiceAccount
    name: ingress-nginx
    namespace: ingress-nginx
---
# Source: ingress-nginx/templates/controller-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx
  namespace: ingress-nginx
rules:
  - apiGroups:
      - ''
    resources:
      - namespaces
    verbs:
      - get
  - apiGroups:
      - ''
    resources:
      - configmaps
      - pods
      - secrets
      - endpoints
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ''
    resources:
      - services
    verbs:
      - get
      - list
      - update
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingresses/status
    verbs:
      - update
  - apiGroups:
      - networking.k8s.io   # k8s 1.14+
    resources:
      - ingressclasses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ''
    resources:
      - configmaps
    resourceNames:
      - ingress-controller-leader-nginx
    verbs:
      - get
      - update
  - apiGroups:
      - ''
    resources:
      - configmaps
    verbs:
      - create
  - apiGroups:
      - ''
    resources:
      - endpoints
    verbs:
      - create
      - get
      - update
  - apiGroups:
      - ''
    resources:
      - events
    verbs:
      - create
      - patch
---
# Source: ingress-nginx/templates/controller-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx
  namespace: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ingress-nginx
subjects:
  - kind: ServiceAccount
    name: ingress-nginx
    namespace: ingress-nginx
---
# Source: ingress-nginx/templates/controller-service-webhook.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller-admission
  namespace: ingress-nginx
spec:
  type: ClusterIP
  ipFamily: IPv6 # ipv4 ¿ÉÒÔ²»Ìí¼Ó
  ports:
    - name: https-webhook
      port: 443
      targetPort: webhook
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
---
# Source: ingress-nginx/templates/controller-service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: ClusterIP
  ipFamily: IPv6   # ipv4 ¿ÉÒÔ²»Ìí¼Ó
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: http
    - name: https
      port: 443
      protocol: TCP
      targetPort: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/component: controller
---
# Source: ingress-nginx/templates/controller-deployment.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
      app.kubernetes.io/instance: ingress-nginx
      app.kubernetes.io/component: controller
  revisionHistoryLimit: 10
  minReadySeconds: 0
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/instance: ingress-nginx
        app.kubernetes.io/component: controller
      annotations:
        prometheus.io/port: "10254"
        prometheus.io/scrape: "true"
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: controller
          image: quay.io/kubernetes-ingress-controller/nginx-ingress-controller:0.33.0
          imagePullPolicy: IfNotPresent
          lifecycle:
            preStop:
              exec:
                command:
                  - /wait-shutdown
          args:
            - /nginx-ingress-controller
            - --election-id=ingress-controller-leader
            - --ingress-class=nginx
            - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --annotations-prefix=nginx.ingress.kubernetes.io
            - --v=2            
            - --validating-webhook=:8443
            - --validating-webhook-certificate=/usr/local/certificates/cert
            - --validating-webhook-key=/usr/local/certificates/key
          securityContext:
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE
            runAsUser: 101
            allowPrivilegeEscalation: true
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          livenessProbe:
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 1
            successThreshold: 1
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 1
            successThreshold: 1
            failureThreshold: 3
          ports:
            - name: http
              containerPort: 80
              hostPort: 80
              protocol: TCP
            - name: https
              containerPort: 443
              hostPort: 443
              protocol: TCP
            - name: webhook
              containerPort: 8443
              hostPort: 8443
              protocol: TCP
          volumeMounts:
            - name: webhook-cert
              mountPath: /usr/local/certificates/
              readOnly: true
            - name: localtime
              mountPath: /etc/localtime
              readOnly: true
          resources:
            requests:
              cpu: 100m
              memory: 90Mi
      serviceAccountName: ingress-nginx
      terminationGracePeriodSeconds: 300
      volumes:
        - name: webhook-cert
          secret:
            secretName: ingress-nginx-admission
        - name: localtime
          hostPath:
            path: /etc/localtime
            type: File
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1        
---
# Source: ingress-nginx/templates/admission-webhooks/validating-webhook.yaml
# before changing this value, check the required kubernetes version
# https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#prerequisites
apiVersion: admissionregistration.k8s.io/v1beta1
kind: ValidatingWebhookConfiguration
metadata:
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  name: ingress-nginx-admission
  namespace: ingress-nginx
webhooks:
  - name: validate.nginx.ingress.kubernetes.io
    rules:
      - apiGroups:
          - extensions
          - networking.k8s.io
        apiVersions:
          - v1beta1
        operations:
          - CREATE
          - UPDATE
        resources:
          - ingresses
    failurePolicy: Fail
    clientConfig:
      service:
        namespace: ingress-nginx
        name: ingress-nginx-controller-admission
        path: /extensions/v1beta1/ingresses
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/clusterrole.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ingress-nginx-admission
  annotations:
    helm.sh/hook: pre-install,pre-upgrade,post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
rules:
  - apiGroups:
      - admissionregistration.k8s.io
    resources:
      - validatingwebhookconfigurations
    verbs:
      - get
      - update
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/clusterrolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ingress-nginx-admission
  annotations:
    helm.sh/hook: pre-install,pre-upgrade,post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ingress-nginx-admission
subjects:
  - kind: ServiceAccount
    name: ingress-nginx-admission
    namespace: ingress-nginx
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/job-createSecret.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ingress-nginx-admission-create
  annotations:
    helm.sh/hook: pre-install,pre-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
spec:
  template:
    metadata:
      name: ingress-nginx-admission-create
      labels:
        helm.sh/chart: ingress-nginx-2.10.0
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/instance: ingress-nginx
        app.kubernetes.io/version: 0.33.0
        app.kubernetes.io/managed-by: Helm
        app.kubernetes.io/component: admission-webhook
    spec:
      containers:
        - name: create
          image: docker.io/jettech/kube-webhook-certgen:v1.2.2
          imagePullPolicy: IfNotPresent
          args:
            - create
            - --host=ingress-nginx-controller-admission,ingress-nginx-controller-admission.ingress-nginx.svc
            - --namespace=ingress-nginx
            - --secret-name=ingress-nginx-admission
      restartPolicy: OnFailure
      serviceAccountName: ingress-nginx-admission
      securityContext:
        runAsNonRoot: true
        runAsUser: 2000
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/job-patchWebhook.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ingress-nginx-admission-patch
  annotations:
    helm.sh/hook: post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
spec:
  template:
    metadata:
      name: ingress-nginx-admission-patch
      labels:
        helm.sh/chart: ingress-nginx-2.10.0
        app.kubernetes.io/name: ingress-nginx
        app.kubernetes.io/instance: ingress-nginx
        app.kubernetes.io/version: 0.33.0
        app.kubernetes.io/managed-by: Helm
        app.kubernetes.io/component: admission-webhook
    spec:
      containers:
        - name: patch
          image: docker.io/jettech/kube-webhook-certgen:v1.2.2
          imagePullPolicy: IfNotPresent
          args:
            - patch
            - --webhook-name=ingress-nginx-admission
            - --namespace=ingress-nginx
            - --patch-mutating=false
            - --secret-name=ingress-nginx-admission
            - --patch-failure-policy=Fail
      restartPolicy: OnFailure
      serviceAccountName: ingress-nginx-admission
      securityContext:
        runAsNonRoot: true
        runAsUser: 2000
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ingress-nginx-admission
  annotations:
    helm.sh/hook: pre-install,pre-upgrade,post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
rules:
  - apiGroups:
      - ''
    resources:
      - secrets
    verbs:
      - get
      - create
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ingress-nginx-admission
  annotations:
    helm.sh/hook: pre-install,pre-upgrade,post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: ingress-nginx-admission
subjects:
  - kind: ServiceAccount
    name: ingress-nginx-admission
    namespace: ingress-nginx
---
# Source: ingress-nginx/templates/admission-webhooks/job-patch/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ingress-nginx-admission
  annotations:
    helm.sh/hook: pre-install,pre-upgrade,post-install,post-upgrade
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
  labels:
    helm.sh/chart: ingress-nginx-2.10.0
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.33.0
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: admission-webhook
  namespace: ingress-nginx
```

![](6.png)

```
#查看ingress-nginx pod是否运行
kubectl get svc -n ingress-nginx
kubectl get pods -n ingress-nginx
```

![](7.png)



### **创建ingress规则**

yaml文件内容如下：

```yaml
# 创建该规则就是用于分别代理后端的apache和tomcat服务。
vim ingress-rule.yaml

apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: test-ingress
  namespace: ingress-test
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ingress.test.com   #后端应用通过该域名进行访问
    http:
      paths:
      - path: /   #apache的网页根目录：/
        backend:
          serviceName: httpd-svc
          servicePort: 80
      - path: /tomcat   #tomcat的网页更目录：/tomcat
        backend:
          serviceName: tomcat-svc
          servicePort: 8080
```

```bash
# 规则生效
kubectl create -f ingress-rule.yaml
# 查看绑定信息
kubectl get ingresses. -n ingress-test
# 查看describe查看详细信息
kubectl describe ingresses. -n ingress-test
```

![](11.png)

```
# 查看状态
kubectl get pods -n ingress-nginx
# 进入ingress容器查看nginx的配置文件
kubectl exec -it -n ingress-nginx ingress-nginx-controller-cf5dx /bin/bash
```

![](12.png)

![](13.png)

通过查看nginx配置文件，我们可以清楚的知道之前所说的ingress-controller会根据我们编写的ingress规则（代理后端应用），动态的去更改nginx的配置文件。

### **通过域名访问集群内的服务**

```
#当前我们需要知道ingress运行在那个node上
kubectl get pod -o wide -n ingress-nginx
```

![](14.png)

```bash
#在windows主机上将node02的ip地址添加到hosts文件中，做域名解析：
#修改路径：C:\Windows\System32\drivers\etc\hosts（需要给予修改权限）
10.145.197.120  ingress.test.com  #ip无论是node1,2都可以添加该条内容
```

![](15.png)

ingress-nginx 双栈部署成功。

## 基于虚拟主机的ingress

**搭建虚拟主机的目的：实现以不同的域名访问同一个web界面**
本文就仅基于上面的httpd服务，我们为该服务绑定两个不同的域名来访问：

```yaml
#vim ingress-rule.yaml

apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: test-ingress
  namespace: ingress-test
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ingress.test.com   #后端应用通过该域名进行访问
    http:
      paths:
      - path: /   #apache的网页根目录：/
        backend:
          serviceName: httpd-svc
          servicePort: 80
      - path: /tomcat   #tomcat的网页更目录：/tomcat
        backend:
          serviceName: tomcat-svc
          servicePort: 8080
  - host: ingress.test2.com   #只需要在rules字段下添加另一个host字段即可。
    http:
      paths:
      - path: /   
        backend:
          serviceName: httpd-svc          #注意，serviceName所有虚拟主机必须保持一致
          servicePort: 80
```

```
#创建新的虚拟主机并查看
kubectl apply -f ingress-rule.yaml
kubectl get ingresses. -n ingress-test 
```

![](16.png)

```
#通过不同的域名进行访问httpd网页：
#因为我们没有搭建dns服务器，所以需要在windows hosts文件将新的域名进行绑定
10.145.197.176 ingress.test.com
10.145.197.120 ingress.test2.com
```

![](17.png)

## 基于HTTPS的Ingress

通过部署ingress后，我们不必按照常规的，为后端所有的pod都颁发一个证书，只需为ingress代理的域名颁发证书就能够实现。

### **创建CA证书**

```bash
mkdir https
cd https
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=nginxsvc/O=nginxsvc"  #参数可根据需求自定义
#查看
ls
```

![](18.png)

### **创建deployment，service，ingress资源:（以nginx服务来实践）**

```yaml
vim nginx-ingress2.yaml

apiVersion: apps/v1    #创建deployment
kind: Deployment
metadata:
  name: web
  namespace: ingress-test
spec:
  selector:
    matchLabels:
      name: test-web
  template:
    metadata:
      labels:
        name: test-web
    spec:
      containers:
      - name: web
        image: nginx:latest  #私有仓库中的镜像（已提供）
---
apiVersion: v1    #创建service，关联上述deployment
kind: Service
metadata:
  name: web-svc
  namespace: ingress-test
spec:
  selector:
    name: test-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
---
apiVersion: extensions/v1beta1  #创建ingress规则
kind: Ingress
metadata:
  name: test-ingress2
  namespace: ingress-test
spec:
  tls:          #为域名颁发证书
    - hosts:
      - ingress.nginx.com
      secretName: tls-secret
  rules:
    - host: ingress.nginx.com
      http:   #注意，此处字段为http，不支持https
        paths:
        - path: /
          backend:
            serviceName: web-svc
            servicePort: 80
```

```bash
# 创建基于https的ingress服务
kubectl create -f  nginx-ingress2.yaml 
# 查看ingress资源和映射的service端口
kubectl get pod -n ingress-test | grep web
kubectl get ingresses. -n ingress-test
#可以看到新创建的ingress提供了80和443端口

kubectl get svc -n ingress-nginx 
```

![](19.png)

![](20.png)

### **通过ingress代理的443端口访问nginx服务**

```
#在hosts文件中绑定域名：
10.145.197.120 ingress.nginx.com
```

![](21.png)

基于HTTPS的ingress服务成功实现，至此，ingress-nginx部署完成。。。。。。。