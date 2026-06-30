# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"
  config.vm.hostname = "career-connect-k8s"
  config.vm.boot_timeout = 600
  config.vm.network "private_network", ip: "192.168.56.20"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "career-connect-k8s"
    vb.cpus = 2
    vb.memory = 4096
  end

  config.vm.provision "shell", inline: <<-SHELL
    set -eux
    export DEBIAN_FRONTEND=noninteractive
    export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

    apt-get update
    apt-get install -y ca-certificates curl docker.io gnupg lsb-release
    systemctl enable --now docker
    usermod -aG docker vagrant

    if ! command -v k3s >/dev/null 2>&1; then
      curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode=644 --disable=traefik" sh -
    fi

    mkdir -p /home/vagrant/.kube
    cp /etc/rancher/k3s/k3s.yaml /home/vagrant/.kube/config
    chown -R vagrant:vagrant /home/vagrant/.kube
    kubectl wait --for=condition=Ready node --all --timeout=180s

    if ! command -v helm >/dev/null 2>&1; then
      curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi

    docker build -t career-connect-local:latest /vagrant
    docker save career-connect-local:latest -o /tmp/career-connect-local.tar
    k3s ctr images import /tmp/career-connect-local.tar

    helm upgrade --install career-connect /vagrant/charts/career-connect \
      --namespace career-connect \
      --create-namespace \
      --set image.repository=career-connect-local \
      --set image.tag=latest \
      --set image.pullPolicy=IfNotPresent \
      --set service.type=NodePort \
      --set service.nodePort=30080 \
      --wait \
      --timeout 180s

    kubectl rollout status deployment/career-connect --namespace career-connect --timeout=180s
    kubectl get pods,svc --namespace career-connect
  SHELL
end
