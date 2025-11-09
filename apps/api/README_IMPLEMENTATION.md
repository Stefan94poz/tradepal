# TradePal B2B E-Commerce Platform - Implementation Guide

## Overview

TradePal is a B2B e-commerce platform built on **Medusa v2.11.3** with Next.js 15, featuring:

- Seller & Buyer profile management with verification
- Partner directory for B2B networking
- Secure escrow payment system
- Shipment tracking integration
- B2B-specific product features

## Architecture

### Tech Stack

- **Backend**: Medusa v2.11.3 (Node.js, TypeScript)
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: Docker containers

### Custom Modules

All custom business logic is organized into Medusa modules following the framework's best practices:

#### 1. User Profile Module

**Path**: `apps/api/src/modules/user-profile/`

**Data Models**:

- `SellerProfile` - Business seller accounts
- `BuyerProfile` - Business buyer accounts
- `VerificationDocuments` - Document verification tracking

**Service**: `UserProfileModuleService`

- Auto-generated CRUD methods via `MedusaService`
- Methods: `createSellerProfiles()`, `updateBuyerProfiles()`, `listVerificationDocuments()`, etc.

#### 2. Partner Directory Module

**Path**: `apps/api/src/modules/partner-directory/`

**Data Models**:

- `PartnerDirectoryProfile` - B2B partner listings

**Service**: `PartnerDirectoryModuleService`

#### 3. Escrow Module

**Path**: `apps/api/src/modules/escrow/`

**Data Models**:

- `EscrowTransaction` - Secure payment holding

**Service**: `EscrowModuleService`

**Statuses**: `pending` → `held` → `released` | `refunded` | `disputed`

#### 4. Shipment Module

**Path**: `apps/api/src/modules/shipment/`

**Data Models**:

- `ShipmentTracking` - Order shipment tracking

**Service**: `ShipmentModuleService`

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. **Start services**:

```bash
cd /home/projects/tradepal
make up
```

This starts:

- PostgreSQL (port 5432)
- Redis (port 6379)
- Medusa backend (port 9000)

2. **Check health**:

```bash
curl http://localhost:9000/health/tradepal
```

Expected response:

```json
{
  "message": "TradePal custom modules are working!",
  "modules": {
    "userProfile": { "sellers": 0, "buyers": 0, "verifications": 0 },
    "partnerDirectory": { "profiles": 0 },
    "escrow": { "transactions": 0 },
    "shipment": { "trackings": 0 }
  }
}
```

### Database Management

**Generate migrations** (after model changes):

```bash
docker exec tradepal_medusa_backend npx medusa db:generate <moduleName>
```

**Run migrations**:

```bash
docker exec tradepal_medusa_backend npx medusa db:migrate
```

**Create admin user**:

```bash
make api-shell
npx medusa user -e admin@example.com -p password
```

## API Reference

### Verification Endpoints

#### Submit Verification (Store - Authenticated)

```bash
POST /store/verification/submit
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "profileType": "seller",  # or "buyer"
  "documentUrls": ["https://example.com/doc.pdf"]
}
```

#### Check Verification Status (Store - Authenticated)

```bash
GET /store/verification/status
Authorization: Bearer <customer_token>
```

#### List Pending Verifications (Admin)

```bash
GET /admin/verifications
Authorization: Bearer <admin_token>
```

#### Approve Verification (Admin)

```bash
POST /admin/verifications/{id}/approve
Authorization: Bearer <admin_token>
```

#### Reject Verification (Admin)

```bash
POST /admin/verifications/{id}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Documents are not clear"
}
```

## Workflows

Workflows are multi-step business processes with automatic rollback on failure.

### Verification Workflows

#### Submit Verification

**File**: `src/workflows/verification/submit-verification.ts`

**Steps**:

1. Create verification document record
2. Rollback: Delete verification if any later step fails

#### Approve Verification

**File**: `src/workflows/verification/approve-verification.ts`

**Steps**:

1. Update verification document status to "approved"
2. Update user profile verification status to "verified"
3. Rollback: Revert both changes if any step fails

### Using Workflows in Code

```typescript
import { submitVerificationWorkflow } from "./workflows/verification/submit-verification";

// In an API route
const { result } = await submitVerificationWorkflow(req.scope).run({
  input: {
    userId: "user_123",
    profileType: "seller",
    documentUrls: ["https://..."],
  },
});
```

## Data Models

### Seller Profile

```typescript
{
  id: string
  user_id: string
  company_name: string
  business_type: "manufacturer" | "wholesaler" | "distributor" | "retailer" | "other"
  location: string
  country: string
  certifications: string[] | null
  verification_status: "pending" | "verified" | "rejected"
  description: string | null
  phone: string | null
  email: string
  website: string | null
  logo_url: string | null
  verified_at: Date | null
  created_at: Date
  updated_at: Date
}
```

### Buyer Profile

```typescript
{
  id: string
  user_id: string
  company_name: string
  business_interests: string[] | null
  business_needs: string | null
  location: string
  country: string
  verification_status: "pending" | "verified" | "rejected"
  description: string | null
  phone: string | null
  email: string
  verified_at: Date | null
  created_at: Date
  updated_at: Date
}
```

### Verification Documents

```typescript
{
  id: string
  user_id: string
  profile_type: "seller" | "buyer"
  document_urls: string[]
  status: "pending" | "approved" | "rejected"
  submission_date: Date
  reviewed_at: Date | null
  rejection_reason: string | null
  reviewed_by: string | null
  created_at: Date
  updated_at: Date
}
```

### Escrow Transaction

```typescript
{
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency_code: string;
  status: "pending" |
    "held" |
    "released" |
    "refunded" |
    "disputed" |
    "cancelled";
  payment_intent_id: string | null;
  payment_method: string | null;
  held_at: Date | null;
  released_at: Date | null;
  refunded_at: Date | null;
  dispute_reason: string | null;
  disputed_at: Date | null;
  resolved_at: Date | null;
  resolution_notes: string | null;
  auto_release_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
```

### Shipment Tracking

```typescript
{
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: "pending" |
    "picked_up" |
    "in_transit" |
    "out_for_delivery" |
    "delivered" |
    "failed" |
    "returned";
  tracking_events: object | null;
  estimated_delivery: Date | null;
  actual_delivery: Date | null;
  shipped_at: Date | null;
  last_updated: Date;
  tracking_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
```

## Development

### Project Structure

```
apps/api/
├── src/
│   ├── modules/              # Custom modules
│   │   ├── user-profile/
│   │   ├── partner-directory/
│   │   ├── escrow/
│   │   └── shipment/
│   ├── workflows/            # Business workflows
│   │   └── verification/
│   ├── api/                  # API routes
│   │   ├── admin/           # Admin endpoints
│   │   └── store/           # Customer endpoints
│   └── jobs/                # Scheduled jobs
├── medusa-config.ts         # Module registration
└── docker/                  # Docker setup
```

### Adding a New Module

1. **Create module structure**:

```
src/modules/my-module/
├── models/
│   └── my-model.ts
├── service.ts
└── index.ts
```

2. **Define data model**:

```typescript
// models/my-model.ts
import { model } from "@medusajs/framework/utils";

export const MyModel = model.define("my_model", {
  id: model.id().primaryKey(),
  name: model.text(),
});
```

3. **Create service**:

```typescript
// service.ts
import { MedusaService } from "@medusajs/framework/utils";
import { MyModel } from "./models/my-model";

class MyModuleService extends MedusaService({
  MyModel,
}) {}

export default MyModuleService;
```

4. **Export module**:

```typescript
// index.ts
import MyModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const MY_MODULE = "myModuleService";

export default Module(MY_MODULE, {
  service: MyModuleService,
});
```

5. **Register in config**:

```typescript
// medusa-config.ts
modules: [{ resolve: "./src/modules/my-module" }];
```

6. **Generate and run migration**:

```bash
docker exec tradepal_medusa_backend npx medusa db:generate myModuleService
docker exec tradepal_medusa_backend npx medusa db:migrate
```

### Adding a New API Route

Create `src/api/store/my-endpoint/route.ts`:

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({ message: "Hello!" });
};
```

Route will be available at: `http://localhost:9000/store/my-endpoint`

## Testing

### Manual Testing

Test health endpoint:

```bash
curl http://localhost:9000/health/tradepal
```

### Integration Tests

Run integration tests:

```bash
cd apps/api
yarn test:integration:http
```

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` and `COOKIE_SECRET`
- [ ] Configure proper CORS origins
- [ ] Set up production database
- [ ] Configure Redis for caching
- [ ] Set up file storage (S3/compatible)
- [ ] Configure payment gateway (Stripe)
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Set up backup strategy

### Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=<strong-secret>
COOKIE_SECRET=<strong-secret>
STORE_CORS=https://storefront.com
ADMIN_CORS=https://admin.storefront.com
STRIPE_API_KEY=sk_live_...
```

## Support

For issues or questions:

1. Check `/apps/api/IMPLEMENTATION_PROGRESS.md` for current status
2. Review Medusa v2 docs: https://docs.medusajs.com
3. Check `.github/copilot-instructions.md` for development guidelines

## License

MIT
