# TradePal Docker Setup

## Quick Start

```bash
# Start all services
make up

# View logs
make logs

# Stop all services
make down

# Restart services
make restart
```

## Services

- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Cache and session storage
- **MinIO** (ports 9001, 9002) - S3-compatible file storage
- **MeiliSearch** (port 7700) - Search engine
- **Medusa** (port 9000) - Backend API and Admin dashboard

## Environment Variables

All environment variables are defined in `docker-compose.yml` for development.

For production, create a `.env` file in the api directory.

## Database Migrations

Migrations run automatically when the Medusa container starts.

To run migrations manually:
```bash
docker exec tradepal_medusa yarn medusa db:migrate
```

## Creating Admin User

```bash
docker exec -it tradepal_medusa yarn medusa user -e admin@tradepal.com -p admin123
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs tradepal_medusa

# Restart specific service
docker restart tradepal_medusa
```

### Database issues
```bash
# Reset database (WARNING: deletes all data)
docker volume rm tradepal_postgres_data
make up
```

### Module resolution errors
The Dockerfile uses volume mounts to preserve node_modules across rebuilds.
If you encounter issues, rebuild without cache:
```bash
docker compose build --no-cache
```
