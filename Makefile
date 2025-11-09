.PHONY: help up down restart logs build clean api-shell api-logs db-shell db-migrate db-reset redis-cli

# Variables
API_DIR := apps/api

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Docker Compose commands
up: ## Start all Docker containers
	@echo "🚀 Starting Docker containers..."
	cd $(API_DIR) && docker compose up -d
	@echo "✅ Containers started! Access Medusa at http://localhost:9002"

down: ## Stop all Docker containers
	@echo "🛑 Stopping Docker containers..."
	cd $(API_DIR) && docker compose down
	@echo "✅ Containers stopped!"

restart: ## Restart all Docker containers
	@echo "🔄 Restarting Docker containers..."
	cd $(API_DIR) && docker compose restart
	@echo "✅ Containers restarted!"

logs: ## Show logs from all containers
	cd $(API_DIR) && docker compose logs -f

build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	cd $(API_DIR) && docker compose build
	@echo "✅ Build complete!"

clean: ## Stop containers and remove volumes
	@echo "🧹 Cleaning up Docker containers and volumes..."
	cd $(API_DIR) && docker compose down -v
	@echo "✅ Cleanup complete!"

# Service-specific commands
api-shell: ## Open a shell in the Medusa container
	docker exec -it tradepal_medusa_backend sh

api-logs: ## Show Medusa API logs
	docker logs -f tradepal_medusa_backend

db-shell: ## Open PostgreSQL shell
	docker exec -it tradepal_postgres psql -U postgres -d tradepal-store

db-migrate: ## Run database migrations
	docker exec -it tradepal_medusa_backend yarn medusa db:migrate

db-reset: ## Reset database (Warning: destroys data!)
	@echo "⚠️  This will destroy all data! Press Ctrl+C to cancel..."
	@sleep 3
	cd $(API_DIR) && docker compose down -v
	cd $(API_DIR) && docker compose up -d postgres redis
	@echo "Waiting for database to be ready..."
	@sleep 5
	cd $(API_DIR) && docker compose up -d medusa

redis-cli: ## Open Redis CLI
	docker exec -it tradepal_redis redis-cli

# Development commands
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	$(MAKE) up
	@echo "✅ Development environment ready!"

stop: ## Stop development environment
	@echo "🛑 Stopping development environment..."
	$(MAKE) down

rebuild: ## Rebuild and restart containers
	@echo "🔄 Rebuilding containers..."
	$(MAKE) down
	$(MAKE) build
	$(MAKE) up

# Quick status check
status: ## Show status of all containers
	@echo "📊 Container Status:"
	cd $(API_DIR) && docker compose ps
