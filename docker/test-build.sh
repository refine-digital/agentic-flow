#!/bin/bash
set -e

echo "Testing Docker builds (dry run)..."
echo ""

# Test building main app
echo "Testing Dockerfile.agentic-flow..."
docker build -f docker/Dockerfile.agentic-flow -t test-agentic-flow:test --no-cache --progress=plain . 2>&1 | tail -20

echo ""
echo "Build test successful!"
