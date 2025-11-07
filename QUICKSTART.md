# TradePal Quick Start Guide

This guide will help you get TradePal up and running in minutes.

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js v20 or higher installed
- ✅ Yarn package manager
- ✅ Docker and Docker Compose installed
- ✅ Git CLI tools

## Quick Start Steps

### 1. Install Dependencies

From the root of the monorepo:

```bash
yarn install
```

### 2. Start the Medusa Backend

Navigate to the API directory and start the services:

```bash
cd apps/api
yarn docker:up
```

Wait for the services to start. You can monitor the logs with:

```bash
docker compose logs -f
```

Look for the message: `✔ Server is ready on port: 9000`

### 3. Create an Admin User

Once the Medusa server is running, create an admin user:

```bash
docker compose run --rm medusa npx medusa user -e admin@tradepal.com -p your-secure-password
```

Replace `your-secure-password` with a strong password.

### 4. Seed Sample Data (Optional)

To populate the database with sample products and data:

```bash
docker compose run --rm medusa yarn seed
```

### 5. Access the Admin Dashboard

Open your browser and navigate to:

**http://localhost:9000/app**

Log in with the credentials you created in step 3.

### 6. Start the Storefront (Optional)

In a new terminal, from the root directory:

```bash
cd apps/web
yarn dev
```

Access the storefront at: **http://localhost:3000**

## What's Running?

After completing these steps, you'll have:

| Service | URL | Description |
|---------|-----|-------------|
| Medusa API | http://localhost:9000 | Backend REST APIs |
| Admin Dashboard | http://localhost:9000/app | Store management UI |
| API Docs | http://localhost:9000/api/docs | Interactive API documentation |
| PostgreSQL | localhost:5432 | Database (via Docker) |
| Redis | localhost:6379 | Cache/session storage (via Docker) |
| Web Storefront | http://localhost:3000 | Customer-facing store |

## Common Commands

### Medusa Backend

```bash
# Start services
yarn docker:up

# Stop services
yarn docker:down

# View logs
docker compose logs -f medusa

# Run migrations
docker compose run --rm medusa npx medusa db:migrate

# Seed data
docker compose run --rm medusa yarn seed

# Create admin user
docker compose run --rm medusa npx medusa user -e email@example.com -p password
```

### Development

```bash
# Build all apps
turbo build

# Run linting
turbo lint

# Format code
yarn format
```

## Troubleshooting

### Port Already in Use

If you get port conflict errors:

1. Check what's using the ports:
   ```bash
   lsof -i :9000  # Medusa
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

2. Either stop the conflicting service or modify the ports in `apps/api/docker-compose.yml`

### Docker Issues

If Docker containers fail to start:

```bash
# Stop all containers
cd apps/api
docker compose down

# Remove volumes (⚠️ this will delete your data)
docker compose down -v

# Rebuild and start
yarn docker:up
```

### Database Connection Errors

Ensure:
1. PostgreSQL container is running: `docker compose ps`
2. Environment variables in `.env` are correct
3. `databaseDriverOptions` in `medusa-config.ts` has SSL disabled

## Next Steps

1. **Explore the Admin Dashboard**: Create products, collections, and manage your store
2. **Read the API Documentation**: http://localhost:9000/api/docs
3. **Customize the Backend**: See `apps/api/README.md` for development guide
4. **Build the Storefront**: Integrate with the Medusa API
5. **Deploy**: Prepare for production deployment

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa Community Discord](https://discord.gg/medusajs)
- [API README](./apps/api/README.md)
- [Turborepo Docs](https://turbo.build/repo/docs)

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the logs: `docker compose logs -f`
3. Consult the [Medusa documentation](https://docs.medusajs.com)
4. Open an issue in the repository

Happy coding! 🚀
