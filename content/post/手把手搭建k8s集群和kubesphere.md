---
title: 手把手搭建k8s集群和kubesphere
categories:
  - 容器编排
  - K8s
tags:
  - K8s
copyright: true
abbrlink: b645bc81
date: 2021-03-17 16:45:52
---

本文将从零开始在干净的机器上安装 `Docker、Kubernetes (使用 kubeadm)、Calico、NFS StorageClass等`，通过手把手的教程演示如何搭建一个 `Kubernetes集群`，并在 K8s集群之上安装开源的`KubeSphere` 容器平台可视化运营集群环境。



<!--more-->

## 环境和版本

所有机器处于同一内网网段，并且可以互相通信。

|     机器IP     | 工作内容 |
| :------------: | :------: |
| 10.220.170.240 |   NFS    |
| 10.209.208.238 |  master  |
| 10.145.197.182 |  nodes0  |
| 10.145.197.176 |  nodes1  |
| 10.145.197.120 |  nodes2  |
|  10.209.33.24  |  nodes3  |

Docker版本： v19.03.4

k8s集群(kubeadm、kubelet 和 kubectl等)版本：v1.17.3

kubesphere版本：v3.0



## 准备环境

在所有节点上执行

```bash
# 为了方便本操作关闭了防火墙，也建议你这样操作
systemctl stop firewalld
systemctl disable firewalld

# 关闭 SeLinux
setenforce 0
sed -i "s/SELINUX=enforcing/SELINUX=disabled/g" /etc/selinux/config

# 关闭 swap
swapoff -a
yes | cp /etc/fstab /etc/fstab_bak
cat /etc/fstab_bak |grep -v swap > /etc/fstab
```

更换CentOS YUM源为阿里云yum源

```bash
# 安装wget
yum install wget -y
# 备份
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
# 获取阿里云yum源
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
# 获取阿里云epel源
wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
# 清理缓存并创建新的缓存
yum clean all && yum makecache
# 系统更新
yum update -y
```

时间同步并确认

```bash
timedatectl
timedatectl set-ntp true
```



## 安装 Docker

### 安装 Docker

每台机器上也都要安装Docker

```bash
# 安装 Docker CE
# 设置仓库
# 安装所需包
yum install -y yum-utils \
    device-mapper-persistent-data \
    lvm2

# 新增 Docker 仓库,速度慢的可以换阿里云的源。
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
# 阿里云源地址
# http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 Docker CE.
yum install -y containerd.io-1.2.10 \
    docker-ce-19.03.4 \
    docker-ce-cli-19.03.4

# 启动 Docker 并添加开机启动
systemctl start docker
systemctl enable docker
```

### 修改Cgroup Driver

需要将Docker的Cgroup Driver 修改为 **systemd**，不然在为Kubernetes 集群添加节点时会报如下错误：

```bash
# 执行 kubeadm join 的 WARNING 信息
[WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
```

目前 Docker 的 Cgroup Driver 看起来应该是这样的：

```bash
docker info|grep "Cgroup Driver"
  Cgroup Driver: cgroupfs
```

需要将这个值修改为 **systemd** 。同时将registry替换成国内的一些仓库地址，以免直接在官方仓库拉取镜像会很慢，操作如下。

```bash
# Setup daemon.
cat > /etc/docker/daemon.json <<EOF
{
    "exec-opts": ["native.cgroupdriver=systemd"],
    "log-driver": "json-file",
    "log-opts": {
    "max-size": "100m"
    },
    "storage-driver": "overlay2",
    "registry-mirrors":[
        "https://kfwkfulq.mirror.aliyuncs.com",
        "https://2lqq34jg.mirror.aliyuncs.com",
        "https://pee6w651.mirror.aliyuncs.com",
        "http://hub-mirror.c.163.com",
        "https://docker.mirrors.ustc.edu.cn",
        "https://registry.docker-cn.com"
    ]
}
EOF

mkdir -p /etc/systemd/system/docker.service.d

# Restart docker.
systemctl daemon-reload
systemctl restart docker
```

## 安装 kubeadm、kubelet 和 kubectl

### 安装准备

需要在每台机器上安装以下的软件包：

- kubeadm：用来初始化集群的指令。
- kubelet：在集群中的每个节点上用来启动 pod 和容器等。
- kubectl：用来与集群通信的命令行工具（Worker 节点可以不装，但是我装了，不影响什么）。

```bash
# 配置K8S的yum源
# 这部分用是阿里云的源，如果可以访问Google，则建议用官方的源
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 官方源配置如下
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
```

### 开始安装

安装指定版本 kubelet、 kubeadm 、kubectl， 这里选择当前较新的稳定版 Kubernetes 1.17.3，如果选择的版本不一样，在执行集群初始化的时候，注意 –kubernetes-version 的值。

```bash
# 增加配置
cat <<EOF > /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
# 加载
sysctl --system

# 安装
yum install -y kubelet-1.17.3 kubeadm-1.17.3 kubectl-1.17.3 --disableexcludes=kubernetes

# 启动并设置 kubelet 开机启动
systemctl start kubelet
systemctl enable --now kubelet
```

## 使用 Kubeadm创建集群

### 初始化Master节点

在 Master上执行初始化，执行初始化使用 kubeadm init 命令。

```bash
# 设置hosts
echo "127.0.0.1 $(hostname)" >> /etc/hosts
export MASTER_IP=10.209.208.238
export APISERVER_NAME=kuber4s.api
echo "${MASTER_IP} ${APISERVER_NAME}" >> /etc/hosts
```

下面有不带注释的初始化命令，建议先查看带注释的每个参数对应的意义，确保与你的当前配置的环境是一致的，然后再执行初始化操作，避免踩雷。

```bash
# 初始化 Control-plane/Master 节点
kubeadm init \
    --apiserver-advertise-address 0.0.0.0 \
    # API 服务器所公布的其正在监听的 IP 地址,指定“0.0.0.0”以使用默认网络接口的地址
    # 切记只可以是内网IP，不能是外网IP，如果有多网卡，可以使用此选项指定某个网卡
    --apiserver-bind-port 6443 \
    # API 服务器绑定的端口,默认 6443
    --cert-dir /etc/kubernetes/pki \
    # 保存和存储证书的路径，默认值："/etc/kubernetes/pki"
    --control-plane-endpoint kuber4s.api \
    # 为控制平面指定一个稳定的 IP 地址或 DNS 名称,
    # 这里指定的 kuber4s.api 已经在 /etc/hosts 配置解析为本机IP
    --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers \
    # 选择用于拉取Control-plane的镜像的容器仓库，默认值："k8s.gcr.io"
    # 因 Google被墙，这里选择国内仓库
    --kubernetes-version 1.17.3 \
    # 为Control-plane选择一个特定的 Kubernetes 版本， 默认值："stable-1"
    --node-name master01 \
    #  指定节点的名称,不指定的话为主机hostname，默认可以不指定
    --pod-network-cidr 10.10.0.0/16 \
    # 指定pod的IP地址范围
    --service-cidr 10.20.0.0/16 \
    # 指定Service的VIP地址范围
    --service-dns-domain cluster.local \
    # 为Service另外指定域名，默认"cluster.local"
    --upload-certs
    # 将 Control-plane 证书上传到 kubeadm-certs Secret
```

不带注释的内容如下，如果初始化超时，可以修改DNS为8.8.8.8后重启网络服务再次尝试。

```bash
kubeadm init \
 --apiserver-advertise-address 0.0.0.0 \
 --apiserver-bind-port 6443 \
 --cert-dir /etc/kubernetes/pki \
 --control-plane-endpoint kuber4s.api \
 --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers \
 --kubernetes-version 1.17.3 \
 --pod-network-cidr 10.10.0.0/16 \
 --service-cidr 10.20.0.0/16 \
 --service-dns-domain cluster.local \
 --upload-certs
```

接下来这个过程有点漫长（初始化会下载镜像、创建配置文件、启动容器等操作），泡杯茶，耐心等待。你也可以执行 tailf /var/log/messages 来实时查看系统日志，观察 Master 的初始化进展，期间碰到一些报错不要紧张，可能只是暂时的错误，等待最终反馈的结果即可。

如果初始化最终成功执行，你将看到如下信息：

```bash
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of the control-plane node running the following command on each as root:

  kubeadm join kuber4s.api:6443 --token 0j287q.jw9zfjxud8w85tis \
    --discovery-token-ca-cert-hash sha256:5e8bcad5ec97c1025e8044f4b8fd0a4514ecda4bac2b3944f7f39ccae9e4921f \
    --control-plane --certificate-key 528b0b9f2861f8f02dfd4a59fc54ad21e42a7dea4dc5552ac24d9c650c5d4d80

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join kuber4s.api:6443 --token 0j287q.jw9zfjxud8w85tis \
    --discovery-token-ca-cert-hash sha256:5e8bcad5ec97c1025e8044f4b8fd0a4514ecda4bac2b3944f7f39ccae9e4921f
```

为普通用户添加 kubectl 运行权限，命令内容在初始化成功后的输出内容中可以看到。

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

建议root用户也进行以上操作，作者使用的是root用户执行的初始化操作，然后在操作完成后查看集群状态的时候，出现如下错误：

```
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

这时候请备份好 kubeadm init 输出中的 kubeadm join 命令，因为将会需要这个命令来给集群添加节点。



### 安装Pod网络附加组件

集群必须安装Pod网络插件，以使Pod可以相互通信，只需在Master节点操作，其他新加入的节点会自动创建相关pod。必须在任何应用程序之前部署网络组件。另外，在安装网络之前，CoreDNS将不会启动，你可以通过命令 来查看CoreDNS 的状态

```bash
# 查看 CoreDNS 的状态,并不是 Running 状态
$ kubectl get pods --all-namespaces|grep coredns
kube-system   coredns-7f9c544f75-bzksd    0/1   Pending   0     14m
kube-system   coredns-7f9c544f75-mtrwq    0/1   Pending   0     14m
```

kubeadm 支持多种网络插件，我们选择Calico 网络插件（kubeadm 仅支持基于容器网络接口（CNI）的网络（不支持kubenet），默认情况下，它给出的pod的IP段地址是 192.168.0.0/16 ,如果你的机器已经使用了此IP段，就需要修改这个配置项，将其值改为在初始化 Master 节点时使用 kubeadm init –pod-network-cidr=x.x.x.x/x 的IP地址段，即我们上面配置的 10.10.0.0/16 ，大概在625行左右，操作如下:

```bash
# 获取配置文件
mkdir calico && cd calico
wget https://docs.projectcalico.org/v3.8/manifests/calico.yaml

# 修改配置文件
# 找到 625 行左右的 192.168.0.0/16 ，并修改为我们初始化时配置的 10.10.0.0/16
vim calico.yaml

# 部署 Pod 网络组件
kubectl apply -f calico.yaml
```

稍等片刻查询 pod 详情，你也可以使用 watch 命令来实时查看 pod 的状态，等待 Pod 网络组件部署成功后，就可以看到一些信息了，包括 Pod 的 IP 地址信息，这个过程时间可能会有点长。

```bash
watch -n 2 kubectl get pods --all-namespaces -o wide
```



### 将Worker节点添加到Kubernetes

请首先确认所有Worker节点满足第一部分的环境说明，并且已经安装了 Docker 和 kubeadm、kubelet 、kubectl，并且已经启动 kubelet。

```bash
# 添加 Hosts 解析
echo "127.0.0.1 $(hostname)" >> /etc/hosts
export MASTER_IP=10.209.208.238
export APISERVER_NAME=kuber4s.api
echo "${MASTER_IP} ${APISERVER_NAME}" >> /etc/hosts
```

将 Worker 节点添加到集群，这里注意，执行后可能会报错，有幸的话你会跳进这个坑，这是因为 Worker 节点加入集群的命令实际上在初始化 master 时已经有提示出来了，不过两小时后会删除上传的证书，所以如果你此时加入集群的时候提示证书相关的错误，请执行 kubeadm init phase upload-certs –upload-certs 重新加载证书。

```bash
kubeadm join kuber4s.api:6443 --token 0y1dj2.ih27ainxwyib0911 \
    --discovery-token-ca-cert-hash sha256:5204b3e358a0d568e147908cba8036bdb63e604d4f4c1c3730398f33144fac61 \
```

执行加入操作，你可能会发现卡着不动，大概率是因为令牌ID对此集群无效或已过 2 小时的有效期（通过执行 kubeadm join –v=5 来获取详细的加入过程，看到了内容为 ”token id “0y1dj2” is invalid for this cluster or it has expired“ 的提示），接下来需要在 Master 上通过 kubeadm token create 来创建新的令牌。

```bash
$ kubeadm token create --print-join-command
W0129 19:10:04.842735   15533 validation.go:28] Cannot validate kube-proxy config - no validator is available
W0129 19:10:04.842808   15533 validation.go:28] Cannot validate kubelet config - no validator is available
# 输出结果如下
kubeadm join kuber4s.api:6443 --token 1hk9bc.oz7f3lmtbzf15x9b     --discovery-token-ca-cert-hash sha256:5e8bcad5ec97c1025e8044f4b8fd0a4514ecda4bac2b3944f7f39ccae9e4921f
```

在 Worker节点上重新执行加入集群命令

```bash
kubeadm join kuber4s.api:6443 \
    --token 1hk9bc.oz7f3lmtbzf15x9b \
    --discovery-token-ca-cert-hash sha256:5e8bcad5ec97c1025e8044f4b8fd0a4514ecda4bac2b3944f7f39ccae9e4921f
```

接下来在Master上查看 Worker 节点加入的状况，直到 Worker 节点的状态变为 Ready 便证明加入成功，这个过程可能会有点漫长，30 分钟以内都算正常的，主要看你网络的情况或者说拉取镜像的速度；另外不要一看到 /var/log/messages 里面报错就慌了，那也得看具体报什么错，看不懂就稍微等一下，一般在 Master 上能看到已经加入（虽然没有Ready）就没什么问题。

```
watch kubectl get nodes -o wide
```



## 安装nfs服务

kubesphere安装条件是必须k8s集群有StorageClass，这里用nfs。所以需要安装nfs服务来作为StorageClass。

### 安装

```bash
yum install -y nfs-utils
```

### 修改配置文件

```bash
mkdir -p /data/k8s --创建一个存储目录
vi /etc/exports
/data/k8s    *(rw,sync,no_root_squash)
#目录/data/k8s共享给10.0.0.0/8网段，允许读写，同步写入
#第一列代表共享哪个目录;第二列代表允许哪个客户端去访问;第三列共享目录的一些权限设置
#权限：ro 只读 rw允许读写 sync同步写入 no_root_squash当客户机以root身份访问时，赋予root权限（即超级用户保留权限）否则，root用户所有请求映射成anonymous用户一样的权限（默认）
```

### 启动服务

先启动rpcbind,再启动nfs

```bash
systemctl start rpcbind
systemctl start nfs
netstat -anptu | grep rpcbind

#验证
showmount -e 127.0.0.1
Export list for 127.0.0.1:
/data/k8s *
```



## 安装 StorageClass

Kubernetes 支持多种 StorageClass，这选择NFS 作为集群的 StorageClass。

### 下载所需文件

下载所需文件，并进行内容调整

```bash
mkdir nfsvolume && cd nfsvolume
for file in class.yaml deployment.yaml rbac.yaml ; do wget https://raw.githubusercontent.com/kubernetes-incubator/external-storage/master/nfs-client/deploy/$file ; done
```

修改 deployment.yaml 中的两处 NFS 服务器 IP 和目录

```yaml
...
          env:
            - name: PROVISIONER_NAME
              value: fuseim.pri/ifs
            - name: NFS_SERVER
              value: 10.220.170.240
            - name: NFS_PATH
              value: /data/k8s
      volumes:
        - name: nfs-client-root
          nfs:
            server: 10.220.170.240
            path: /data/k8s
```

### 部署创建

```bash
kubectl create -f rbac.yaml
kubectl create -f class.yaml
kubectl create -f deployment.yaml
```

在集群内所有机器上安装nfs-utils并启动。

```bash
yum -y install nfs-utils
systemctl start nfs-utils
systemctl enable nfs-utils
rpcinfo -p
```

查看storageclass

```bash
$ kubectl get storageclass
NAME PROVISIONER RECLAIMPOLICY VOLUMEBINDINGMODE ALLOWVOLUMEEXPANSION AGE
managed-nfs-storage fuseim.pri/ifs Delete Immediate false 10m
```

### 标记默认的 StorageClass

操作命令格式如下

```bash
kubectl patch storageclass managed-nfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

请注意，最多只能有一个 StorageClass 能够被标记为默认。

验证标记是否成功

```bash
$ kubectl get storageclass
NAME PROVISIONER RECLAIMPOLICY VOLUMEBINDINGMODE ALLOWVOLUMEEXPANSION AGE
managed-nfs-storage (default) fuseim.pri/ifs Delete Immediate false 12m
```



## 安装KubeSphere3.0

[KubeSphere](https://kubesphere.com.cn/docs/zh-CN/) 是在 [Kubernetes](https://kubernetes.io/) 之上构建的以应用为中心的容器平台，提供简单易用的操作界面以及向导式操作方式，在降低用户使用容器调度平台学习成本的同时，极大减轻开发、测试、运维的日常工作的复杂度，旨在解决 Kubernetes 本身存在的存储、网络、安全和易用性等痛点。除此之外，平台已经整合并优化了多个适用于容器场景的功能模块，以完整的解决方案帮助企业轻松应对敏捷开发与自动化运维、DevOps、微服务治理、灰度发布、多租户管理、工作负载和集群管理、监控告警、日志查询与收集、服务与网络、应用商店、镜像构建与镜像仓库管理和存储管理等多种场景。后续版本将提供和支持多集群管理、大数据、AI 等场景。

![](4.png)

### 安装要求

```
k8s集群版本必须是1.15.x, 1.16.x, 1.17.x, or 1.18.x
必须有默认的storageclass
内存和cpu最低要求：CPU > 1 Core, Memory > 2 G
```

按照上面教程操作，完全符合要求。

### 安装yaml文件

```bash
kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.0.0/kubesphere-installer.yaml

kubectl apply -f https://github.com/kubesphere/ks-installer/releases/download/v3.0.0/cluster-configuration.yaml
```

### 查看安装日志

```bash
kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f
```

### 查看所有pod

```bash
kubectl get pods -A
```

![](1.png)

### 登陆kubesphere

浏览器访问ip:30880    用户名：admin     默认密码：P@88w0rd

![](2.png)

![](3.png)



## 补充内容

- kubeadm init               初始化Kubernetes主节点
- kubeadm token          管理 kubeadm join 的令牌，包括查看、创建和删除等
- kubeadm reset           将kubeadm init或kubeadm join对主机的更改恢复到之前状态，一般与 -f 参数使用

**POD创建流程**

![](5.png)

![](6.png)

**Ingress与Service关系图**

![](7.png)

**nfs异常排查**

```
kubectl get sc
kubectl get pvc -n kubesphere-system
kubectl logs nfs-client-provisioner-69459bbf5b-wqstl
```

![](8.png)

添加- --feature-gates=RemoveSelfLink=false

![](9.png)

