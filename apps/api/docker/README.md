# Docker Setup for TradePal

This directory contains the Docker configuration for the TradePal Medusa backend.

## Services

- **PostgreSQL** (port 5432): Database for Medusa
- **Redis** (port 6379): Cache and session store
- **Medusa** (port 9000): Backend API and Admin Dashboard

## Quick Start

From the **root of the monorepo**, you can use either Makefile commands or npm scripts:

### Using Makefile (Recommended)

```bash
# Start all services
make docker-up

# Stop all services
make docker-down

# View logs
make docker-logs

# See all available commands
make help
```

### Using NPM Scripts

```bash
# Start all services
yarn docker:up

# Stop all services
yarn docker:down

# View logs
yarn docker:logs

# View container status
yarn docker:status
```

## Available Makefile Commands

| Command | Description |
|---------|-------------|
| `make docker-up` | Start all Docker containers |
| `make docker-down` | Stop all Docker containers |
| `make docker-restart` | Restart all Docker containers |
| `make docker-logs` | Show logs from all containers |
| `make docker-build` | Build Docker images |
| `make docker-clean` | Stop containers and remove volumes |
| `make api-shell` | Open a shell in the Medusa container |
| `make api-logs` | Show Medusa API logs |
| `make db-shell` | Open PostgreSQL shell |
| `make db-migrate` | Run database migrations |
| `make db-reset` | Reset database (destroys data!) |
| `make redis-cli` | Open Redis CLI |
| `make dev` | Start development environment |
| `make status` | Show status of all containers |

## Environment Variables

Make sure you have a `.env` file in `apps/api/` with the required environment variables. See `.env.template` for reference.

## Accessing Services

- **Medusa API**: http://localhost:9000
- **Medusa Admin**: http://localhost:9000/app
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Troubleshooting

### Containers won't start
```bash
# Clean up and restart
make docker-clean
make docker-build
make docker-up
```

### Database connection issues
```bash
# Check if PostgreSQL is running
make status

# View database logs
docker logs tradepal_medusa_postgres
```

### View Medusa logs
```bash
make api-logs
```

## Development Workflow

1. Start the containers:
   ```bash
   make docker-up
   ```

2. Run migrations:
   ```bash
   make db-migrate
   ```

3. Access the Medusa admin at http://localhost:9000/app

4. View logs if needed:
   ```bash
   make docker-logs
   ```

5. When done:
   ```bash
   make docker-down
   ```

## Volume Mounts

The Medusa service uses a volume mount to enable hot-reloading during development:
- Your local `apps/api` directory is mounted to `/server` in the container
- Changes to your code will be reflected immediately

## Data Persistence

PostgreSQL data is persisted in a Docker volume named `postgres_data_tradepal`. This data will survive container restarts but will be removed if you run `make docker-clean`.
