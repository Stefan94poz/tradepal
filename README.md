# TradePal

A modern e-commerce trading platform built with a monorepo architecture.

## Architecture

This is a Turborepo monorepo containing:

### Apps and Packages

#### Applications

- `api`: Medusa e-commerce backend (Node.js) with admin dashboard
  - Built on [Medusa v2](https://medusajs.com)
  - Provides REST APIs for products, cart, checkout, orders
  - Includes admin dashboard for store management
  - Runs on Docker with PostgreSQL and Redis
- `web`: Next.js storefront application

#### Shared Packages

- `@repo/ui`: Shared React component library
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configurations

## Getting Started

### Prerequisites

- Node.js v20+
- Yarn (configured as package manager)
- Docker & Docker Compose (for Medusa API)

### Development

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start Medusa API (Backend) with Docker:**
   
   From the root of the monorepo:
   ```bash
   # Using Makefile (recommended)
   make docker-up
   
   # OR using yarn
   yarn docker:up
   ```

   This starts the Medusa backend with PostgreSQL and Redis.

3. **Run database migrations:**
   ```bash
   make db-migrate
   ```

4. **Create admin user:**
   ```bash
   make api-shell
   # Inside the container:
   npx medusa user -e admin@tradepal.com -p your-password
   exit
   ```

5. **Start Next.js storefront:**
   ```bash
   cd apps/web
   yarn dev
   ```

6. **Access the applications:**
   - Medusa API: http://localhost:9000
   - Medusa Admin: http://localhost:9000/app
   - Web Storefront: http://localhost:3000

### Docker Commands (from root)

All Docker commands can be run from the root of the monorepo:

```bash
# Start containers
make docker-up          # or: yarn docker:up

# Stop containers
make docker-down        # or: yarn docker:down

# View logs
make docker-logs        # or: yarn docker:logs

# Rebuild containers
make docker-build       # or: yarn docker:build

# Clean up (removes volumes)
make docker-clean       # or: yarn docker:clean

# View all available commands
make help
```

See [Docker Setup Documentation](./apps/api/docker/README.md) for more details.

### Build

To build all apps and packages, run the following command:

```bash
turbo build
```

## Utilities

This monorepo includes:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turbo.build/repo) for build orchestration
- [Docker](https://www.docker.com/) for containerization

## Project Structure

```
tradepal/
├── apps/
│   ├── api/              # Medusa backend (Node.js + PostgreSQL + Redis)
│   │   ├── src/
│   │   │   ├── admin/    # Admin dashboard customizations
│   │   │   ├── api/      # Custom API routes
│   │   │   ├── modules/  # Custom business logic modules
│   │   │   └── workflows/# Business workflows
│   │   ├── docker/
│   │   │   ├── docker-compose.yml
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   └── medusa-config.ts
│   └── web/              # Next.js storefront
├── packages/
│   ├── ui/               # Shared React components
│   ├── eslint-config/    # Shared ESLint configs
│   └── typescript-config/# Shared TypeScript configs
├── Makefile              # Docker commands
└── turbo.json            # Turborepo configuration
```

## Documentation

- [API Documentation](./apps/api/README.md) - Medusa backend setup and usage
- [Web Documentation](./apps/web/README.md) - Next.js storefront

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## License

MIT


Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
