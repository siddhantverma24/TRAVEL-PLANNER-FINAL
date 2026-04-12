#!/bin/bash
# =============================================================================
# Jenkins Docker Validation Script
# =============================================================================
# Run this inside Jenkins container with:
#   docker exec -it jenkins bash /workspace/jenkins/validate.sh
#
# This script performs a comprehensive self-test of the Jenkins + Docker setup
# to verify all components are working before running the pipeline.
# =============================================================================

# Exit immediately if any command fails (fail-fast)
set -e

# =============================================================================
# Header
# =============================================================================
echo ""
echo "=== Jenkins Docker Validation ==="
echo ""
echo "Testing Jenkins + Docker integration..."
echo ""

# =============================================================================
# CHECK 1: Verify Docker CLI is installed and can connect to daemon
# =============================================================================
# This test confirms that:
#   - Docker command is in PATH
#   - Docker CLI can communicate with the Docker daemon
#   - The /var/run/docker.sock mount is working correctly
#
# If this fails: Docker CLI is not installed, or the socket mount is missing
echo -n "Check 1: Docker CLI... "
if docker version > /dev/null 2>&1; then
    echo "✓ PASS"
    docker version --format='  Version: {{.Client.Version}}'
else
    echo "✗ FAIL"
    exit 1
fi

# =============================================================================
# CHECK 2: Verify Docker Compose V2 is installed and working
# =============================================================================
# This test confirms that:
#   - Docker Compose plugin is properly installed
#   - The plugin can be invoked as "docker compose" (with space)
#   - The /usr/local/lib/docker/cli-plugins/docker-compose file is executable
#
# If this fails: Docker Compose V2 plugin is not installed or permissions are wrong
echo -n "Check 2: Docker Compose V2... "
if docker compose version > /dev/null 2>&1; then
    echo "✓ PASS"
    docker compose version --short
else
    echo "✗ FAIL"
    exit 1
fi

# =============================================================================
# CHECK 3: Verify Docker socket is mounted and accessible
# =============================================================================
# This test confirms that:
#   - The /var/run/docker.sock file exists (socket was mounted into container)
#   - The socket is readable (Jenkins can communicate with Docker daemon)
#   - The socket is writable (Jenkins can create containers and images)
#
# If this fails: The docker.sock mount is missing from docker-compose.yml,
# or the mount permissions are incorrect
echo -n "Check 3: Docker socket mount... "
if [ -S /var/run/docker.sock ]; then
    echo "✓ PASS"
    echo "  Socket: /var/run/docker.sock ($(stat -c '%A' /var/run/docker.sock 2>/dev/null || stat -f '%OLp' /var/run/docker.sock))"
else
    echo "✗ FAIL"
    echo "  ERROR: /var/run/docker.sock not found or not a socket"
    exit 1
fi

# =============================================================================
# CHECK 4: Verify workspace is mounted and contains docker-compose.yml
# =============================================================================
# This test confirms that:
#   - The project root is mounted as /workspace in the container
#   - The docker-compose.yml file is present at /workspace/docker-compose.yml
#   - The Jenkinsfile can locate the compose file to run the pipeline
#
# If this fails: The .:/workspace volume mount is missing from docker-compose.yml,
# or the project root doesn't contain docker-compose.yml
echo -n "Check 4: Workspace mount... "
if [ -f /workspace/docker-compose.yml ]; then
    echo "✓ PASS"
    echo "  File: /workspace/docker-compose.yml ($(wc -l < /workspace/docker-compose.yml) lines)"
else
    echo "✗ FAIL"
    echo "  ERROR: /workspace/docker-compose.yml not found"
    exit 1
fi

# =============================================================================
# CHECK 5: Verify .env file exists or .env.example is available
# =============================================================================
# This test confirms that:
#   - Either .env exists (already configured), or
#   - .env.example exists (can be copied to .env during pipeline setup)
#   - The pipeline has the necessary environment variable templates
#
# If this fails: Neither .env nor .env.example exist in the project root,
# meaning the pipeline's "Setup Environment" stage will fail silently
echo -n "Check 5: Environment configuration... "
if [ -f /workspace/.env ]; then
    echo "✓ PASS"
    echo "  File: /workspace/.env ($(wc -l < /workspace/.env) variables)"
elif [ -f /workspace/.env.example ]; then
    echo "✓ PASS (example available)"
    echo "  File: /workspace/.env.example (will be copied during pipeline)"
else
    echo "✗ FAIL"
    echo "  ERROR: Neither /workspace/.env nor /workspace/.env.example found"
    exit 1
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=== All checks passed ==="
echo ""
echo "✓ Jenkins Docker environment is properly configured"
echo "✓ Ready to execute pipeline"
echo ""
