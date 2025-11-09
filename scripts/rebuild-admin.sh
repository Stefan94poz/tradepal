#!/bin/bash

# Script to rebuild Medusa admin in Docker

echo "🔨 Rebuilding Medusa Admin Dashboard..."
echo ""

# Stop containers
echo "1. Stopping containers..."
cd /home/projects/tradepal
make down

# Rebuild without cache
echo ""
echo "2. Rebuilding Docker images without cache..."
cd apps/api/docker
docker compose build --no-cache medusa

# Start containers
echo ""
echo "3. Starting containers..."
docker compose up -d

echo ""
echo "✅ Done! Wait 30-60 seconds for migrations and admin build to complete."
echo "📊 Check logs with: make logs"
echo "🌐 Access admin at: http://localhost:9000/app"
