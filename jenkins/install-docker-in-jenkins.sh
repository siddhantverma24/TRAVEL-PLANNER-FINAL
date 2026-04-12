#!/bin/bash
# Script to install Docker CLI inside Jenkins container
# This script runs INSIDE the Jenkins LTS container to enable Docker command execution
# Docker socket is mounted from host, so we only need the CLI, not the daemon

# Exit immediately if any command fails (except those with || true)
set -e

# Print informational message
echo "======================================"
echo "Installing Docker CLI in Jenkins..."
echo "======================================"

# Update apt package lists to ensure we have latest package information
apt-get update

# Install required system packages for Docker repository setup
# ca-certificates: for HTTPS certificate validation
# curl: for downloading Docker's GPG key
# gnupg: for verifying GPG signatures on Docker packages
# lsb-release: for identifying Ubuntu/Debian release information
apt-get install -y ca-certificates curl gnupg lsb-release

# Create directory for Docker's GPG key
mkdir -p /etc/apt/keyrings

# Download Docker's official GPG key for package signature verification
# This ensures packages come from Docker and haven't been tampered with
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker's official apt repository for Debian/Ubuntu
# This allows apt-get to find Docker packages
# Uses the official Docker repository instead of system repo (ensures latest versions)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update apt again to include packages from the newly added Docker repository
apt-get update

# Install docker-ce-cli (Docker command-line interface only)
# We don't install docker-ce (full daemon) because it's running on the host
# Jenkins will communicate with the host's Docker daemon via the mounted socket
apt-get install -y docker-ce-cli

# Add jenkins user to docker group so it can run docker commands without sudo
# This allows Jenkins pipeline jobs to execute docker and docker-compose commands
usermod -aG docker jenkins

# Verify installation by showing Docker version
echo "======================================"
echo "Docker CLI installed successfully!"
echo "Docker version:"
docker --version
echo "======================================"

# Script execution complete
echo "Jenkins can now execute Docker commands via the mounted socket."
echo "Restart Jenkins container for group changes to take effect."
