#!/bin/bash
set -e

# Load credentials from .env
source ../.env

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Agentic Flow - Quick Deploy to Docker Hub            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Login to Docker Hub
echo "Logging in to Docker Hub..."
echo "$DOCKER_PERSONAL_ACCESS_TOKEN" | docker login -u ruvnet --password-stdin

if [ $? -eq 0 ]; then
    echo "✓ Successfully logged in to Docker Hub"
else
    echo "✗ Failed to login to Docker Hub"
    exit 1
fi

echo ""
echo "Docker Hub login successful!"
echo ""
echo "Ready to build and push images."
echo ""
echo "Run ./DEPLOY_TO_DOCKERHUB.sh to complete deployment"
