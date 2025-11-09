# TradePal Development Guide

## Architecture Overview

TradePal is a **Turborepo monorepo** combining a Medusa v2 e-commerce backend with a Next.js 15 storefront:

- `apps/api/` - Medusa v2 backend (Node.js, TypeScript) with admin dashboard
- `apps/web/` - Next.js 15 App Router storefront (React 19)
- `packages/ui/` - Shared React component library
- `packages/eslint-config/` & `packages/typescript-config/` - Shared configs

**Key Integration**: The web app consumes Medusa REST APIs at `http://localhost:9000` for products, cart, checkout, and orders.

## Development Workflow

### Starting Services

**Critical**: All Docker commands must run from monorepo root (not `apps/api/docker/`):

```bash
make up              # Start all services (postgres + redis + medusa)
make logs            # View container logs
make down            # Stop all services
```

Alternatives: `yarn docker:up`, `yarn docker:down`, `yarn docker:logs`

### Running Next.js Storefront

```bash
cd apps/web && yarn dev    # Port 3000
```

### Database & Admin Setup

```bash
make db-migrate             # Run migrations (auto-runs on container start)
make api-shell              # Access container shell
# Inside container:
npx medusa user -e admin@example.com -p password
```

## Medusa v2 Extension Patterns

Medusa uses a **file-based routing system** with strict conventions:

### 1. Custom API Routes (`src/api/`)

Routes are **directory-based** with `route.ts` files:

```typescript
// src/api/store/hello-world/route.ts → GET /store/hello-world
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ message: "Hello" });
}
```

**Supported HTTP methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
**API Zones**: `/admin/*` (protected), `/store/*` (public)

### 2. Custom Modules (`src/modules/`)

Modules encapsulate domain logic with models + services:

```typescript
// src/modules/blog/models/post.ts
import { model } from "@medusajs/framework/utils";

const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
});
```

Each module **must have a service** in `service.ts`.

### 3. Workflows (`src/workflows/`)

Multi-step business processes using workflow SDK:

```typescript
import {
  createStep,
  createWorkflow,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

const step1 = createStep("step-1", async () => {
  return new StepResponse("Result");
});
```

Workflows enable **transactional rollbacks** across steps.

### 4. Admin Dashboard Extensions (`src/admin/`)

Create widgets/pages using Admin SDK:

```tsx
// src/admin/widgets/product-widget.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk";

const ProductWidget = () => <div>Custom Widget</div>;

export const config = defineWidgetConfig({
  zone: "product.details.after", // Injection point
});
```

## Monorepo Conventions

### Shared UI Package

Components in `packages/ui/src/*.tsx` are exported individually:

```json
// package.json exports
"exports": {
  "./*": "./src/*.tsx"
}
```

**Import pattern**: `import { Button } from "@repo/ui/button"`

### Turborepo Build Dependencies

Build order defined in `turbo.json`:

```json
"build": {
  "dependsOn": ["^build"],  // Build dependencies first
  "outputs": [".next/**"]
}
```

Run builds: `yarn build` (runs all apps+packages in dependency order)

## Testing

Medusa uses `@medusajs/test-utils` for integration tests:

```typescript
// integration-tests/http/*.spec.ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

medusaIntegrationTestRunner({
  inApp: true,
  testSuite: ({ api }) => {
    it("tests endpoint", async () => {
      const res = await api.get("/health");
      expect(res.status).toEqual(200);
    });
  },
});
```

**Run tests**:

- `yarn test:integration:http` - HTTP API tests
- `yarn test:unit` - Unit tests
- All tests run with `NODE_OPTIONS=--experimental-vm-modules`

## Configuration

### Medusa Config (`apps/api/medusa-config.ts`)

Uses `defineConfig` from `@medusajs/framework/utils`:

```typescript
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      // ...CORS and security settings
    },
  },
});
```

**Environment variables** loaded via `.env` in `apps/api/`.

### Next.js Config

Transpiles shared packages:

```javascript
const nextConfig = {
  transpilePackages: ["@repo/ui"], // Required for monorepo packages
};
```

## Docker Architecture

All services run in Docker during development:

- **postgres** (port 5432) - Database: `tradepal-medusa`
- **redis** (port 6379) - Cache/sessions
- **medusa** (port 9000) - API + Admin dashboard

**Volume mounts**: `apps/api` is mounted to `/server` for hot reload.

## Common Gotchas

1. **API routes must be named `route.ts`** - directory structure determines URL (e.g., `src/api/store/products/route.ts` → `/store/products`)
2. **UI imports are per-file, not bundled** - `import { Button } from "@repo/ui/button"` ✓ not `"@repo/ui"` ✗
3. **Modules require a service** - Every module in `src/modules/*/` must export a service class in `service.ts`
4. **Docker context is critical** - Compose file in `apps/api/docker/` references `..` paths; only run via root Makefile/scripts
5. **Environment variables** - Medusa loads from `apps/api/.env` (not root `.env`)

## Documentation References

- Medusa v2 Docs: https://docs.medusajs.com/learn/introduction
- Medusa API Routes: https://docs.medusajs.com/learn/fundamentals/api-routes
- Medusa Modules: https://docs.medusajs.com/learn/fundamentals/modules
- Medusa Workflows: https://docs.medusajs.com/learn/fundamentals/workflows
- Medusa Admin SDK: https://docs.medusajs.com/learn/fundamentals/admin
