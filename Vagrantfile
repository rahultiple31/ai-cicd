# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-24.04"
  config.vm.hostname = "ubuntu-2404"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "ubuntu-2404"
    vb.cpus = 2
    vb.memory = 2048
  end

  config.vm.provision "shell", inline: <<-SHELL
    set -e
    apt-get update
    apt-get install -y curl ca-certificates gnupg lsb-release
    echo "Ubuntu version:"
    lsb_release -a
  SHELL
end
