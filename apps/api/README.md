# TradePal Medusa API<p align="center">

  <a href="https://www.medusajs.com">

This is the Medusa backend application for TradePal, providing e-commerce APIs and admin dashboard.  <picture>

    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">

## Overview    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">

    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">

The Medusa API provides:    </picture>

- **REST APIs** for storefront operations (products, cart, checkout, orders)  </a>

- **Admin Dashboard** for managing your store</p>

- **Admin APIs** for backend operations<h1 align="center">

- **Extensible architecture** with custom modules, workflows, and API routes  Medusa

</h1>

## Prerequisites

<h4 align="center">

- Docker & Docker Compose  <a href="https://docs.medusajs.com">Documentation</a> |

- Node.js v20+ (for local development without Docker)  <a href="https://www.medusajs.com">Website</a>

- PostgreSQL (if running without Docker)</h4>



## Getting Started<p align="center">

  Building blocks for digital commerce

### Running with Docker (Recommended)</p>

<p align="center">

1. **Start the application:**  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">

   ```bash    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />

   yarn docker:up  </a>

   ```    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>

  <a href="https://discord.gg/xpCwq3Kfn8">

   This command will:    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />

   - Build the Docker image  </a>

   - Start PostgreSQL database  <a href="https://twitter.com/intent/follow?screen_name=medusajs">

   - Start Redis    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />

   - Run database migrations  </a>

   - Start the Medusa server in development mode</p>



2. **Check logs:**## Compatibility

   ```bash

   docker compose logs -f medusaThis starter is compatible with versions >= 2 of `@medusajs/medusa`. 

   ```

## Getting Started

3. **Create an admin user:**

   ```bashVisit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

   docker compose run --rm medusa npx medusa user -e admin@tradepal.com -p your-password

   ```Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.



4. **Access the services:**## What is Medusa

   - Medusa API: http://localhost:9000

   - Admin Dashboard: http://localhost:9000/appMedusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

   - API Documentation: http://localhost:9000/api/docs

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

5. **Stop the application:**

   ```bash## Community & Contributions

   yarn docker:down

   ```The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.



### Running Locally (Without Docker)Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.



1. **Install dependencies:**## Other channels

   ```bash

   yarn install- [GitHub Issues](https://github.com/medusajs/medusa/issues)

   ```- [Twitter](https://twitter.com/medusajs)

- [LinkedIn](https://www.linkedin.com/company/medusajs)

2. **Update `.env` file:**- [Medusa Blog](https://medusajs.com/blog/)

   - Set `DATABASE_URL` to your local PostgreSQL instance
   - Set `REDIS_URL` to your local Redis instance

3. **Run migrations:**
   ```bash
   yarn medusa db:migrate
   ```

4. **Start development server:**
   ```bash
   yarn dev
   ```

5. **Create an admin user:**
   ```bash
   npx medusa user -e admin@tradepal.com -p your-password
   ```

## Project Structure

```
apps/api/
├── src/
│   ├── admin/          # Admin dashboard customizations (widgets, UI routes)
│   ├── api/            # Custom API routes
│   ├── jobs/           # Scheduled jobs
│   ├── links/          # Module links (data associations)
│   ├── modules/        # Custom modules
│   ├── scripts/        # CLI scripts (e.g., seed data)
│   ├── subscribers/    # Event listeners
│   └── workflows/      # Custom workflows
├── medusa-config.ts    # Medusa configuration
├── docker-compose.yml  # Docker services configuration
├── Dockerfile          # Docker image definition
└── start.sh            # Docker startup script
```

## Development

### Seed Data

To populate your database with sample data:

```bash
yarn seed
```

Or with Docker:

```bash
docker compose run --rm medusa yarn seed
```

### Database Migrations

After modifying data models, generate and run migrations:

```bash
# Generate migration
npx medusa db:generate <migration-name>

# Run migrations
npx medusa db:migrate
```

### Testing

```bash
# Unit tests
yarn test:unit

# Integration tests - HTTP
yarn test:integration:http

# Integration tests - Modules
yarn test:integration:modules
```

## Environment Variables

Key environment variables (see `.env.template` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | Secret for JWT tokens | `supersecret` |
| `COOKIE_SECRET` | Secret for cookies | `supersecret` |
| `STORE_CORS` | Allowed origins for store API | `http://localhost:8000` |
| `ADMIN_CORS` | Allowed origins for admin API | `http://localhost:9000` |

## API Documentation

Once the server is running, you can access:

- **API Reference**: http://localhost:9000/api/docs
- **Admin Dashboard**: http://localhost:9000/app

## Troubleshooting

### Container name conflicts

If you're running multiple Medusa projects, ensure unique container names in `docker-compose.yml`.

### Start script not found (Windows)

Ensure `start.sh` uses LF line endings, not CRLF. Configure Git to maintain LF endings:

```bash
git config --global core.autocrlf false
```

### Database connection errors

Verify that:
1. PostgreSQL container is running: `docker compose ps`
2. `DATABASE_URL` in `.env` matches your setup
3. `databaseDriverOptions` in `medusa-config.ts` has SSL disabled for local development

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa GitHub](https://github.com/medusajs/medusa)
- [Medusa Discord Community](https://discord.gg/medusajs)

## License

MIT
