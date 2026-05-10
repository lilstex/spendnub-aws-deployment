#!/bin/bash

# Update packages
apt-get update -y

# Install Java 21 (Per official Jenkins documentation)
apt-get install fontconfig openjdk-21-jre -y

# Create the keyrings directory if it does not already exist
mkdir -p /etc/apt/keyrings

# Add Jenkins Repository and GPG Key
wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list with the new signed repository
apt-get update -y

# Install Jenkins
apt-get install jenkins -y

# Install Docker
apt-get install docker.io -y

# Install Docker Compose v2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Add Jenkins user to the Docker groupyes
usermod -aG docker jenkins

# Enable and start services
systemctl enable docker
systemctl start docker
systemctl enable jenkins
systemctl restart jenkins