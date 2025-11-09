# Third-Party Integrations Guide

This guide covers all third-party service integrations for the TradePal B2B marketplace platform using Medusa v2.

## Overview

TradePal integrates with the following services:

1. **MeiliSearch** - Product search and discovery
2. **MinIO** - File storage for images and documents
3. **PostHog** - Analytics and feature flags
4. **SendGrid** - Email notifications
5. **Stripe** - Payment processing and escrow
6. **Webshipper** - Multi-carrier shipment tracking

---

## 1. MeiliSearch Integration

### Purpose

Provides fast, typo-tolerant search for products with faceted filtering for B2B features.

### Installation

```bash
cd apps/api
yarn add @medusajs/medusa-plugin-meilisearch
```

### Configuration

**Environment Variables (`.env`):**

```env
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

**medusa-config.ts:**

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@medusajs/medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: [
                "title",
                "description",
                "variant_sku",
                "metadata.seller_location",
                "metadata.min_order_quantity",
              ],
              filterableAttributes: [
                "variants.prices.amount",
                "collection_id",
                "type_id",
                "metadata.seller_location",
                "metadata.min_order_quantity",
              ],
              sortableAttributes: ["variants.prices.amount", "created_at"],
            },
          },
        },
      },
    },
  ],
});
```

### Usage

**Search API Endpoint (`src/api/store/products/search/route.ts`):**

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const searchService = req.scope.resolve("searchService");

  const { q, limit = 20, offset = 0, filters } = req.query;

  const results = await searchService.search("products", q, {
    limit,
    offset,
    filter: filters,
  });

  res.json(results);
}
```

### Docker Setup

**docker-compose.yml:**

```yaml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=masterKey
      - MEILI_ENV=development
    volumes:
      - meilisearch_data:/meili_data

volumes:
  meilisearch_data:
```

### Documentation

- [Medusa MeiliSearch Plugin](https://docs.medusajs.com/resources/integrations/meilisearch)
- [MeiliSearch Docs](https://www.meilisearch.com/docs)

---

## 2. MinIO Integration

### Purpose

S3-compatible object storage for product images and verification documents.

### Installation

```bash
cd apps/api
yarn add @medusajs/medusa-file-minio
```

### Configuration

**Environment Variables (`.env`):**

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=tradepal
MINIO_USE_SSL=false
```

**medusa-config.ts:**

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@medusajs/medusa-file-minio",
      options: {
        endpoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT || "9000"),
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
        bucket: process.env.MINIO_BUCKET,
        useSSL: process.env.MINIO_USE_SSL === "true",
      },
    },
  ],
});
```

### Usage

**File Upload API (`src/api/admin/uploads/route.ts`):**

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const fileService = req.scope.resolve("fileService");

  const files = req.files as Express.Multer.File[];

  const uploads = await Promise.all(
    files.map((file) => fileService.upload(file))
  );

  res.json({ uploads });
}
```

**Generate Signed URL:**

```typescript
const fileService = req.scope.resolve("fileService");
const url = await fileService.getPresignedDownloadUrl({
  fileKey: "verification-docs/doc123.pdf",
  expiresIn: 3600, // 1 hour
});
```

### Docker Setup

**docker-compose.yml:**

```yaml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### Documentation

- [Medusa MinIO Plugin](https://docs.medusajs.com/resources/integrations/file/minio)
- [MinIO Docs](https://min.io/docs/minio/linux/index.html)

---

## 3. PostHog Integration

### Purpose

Analytics, event tracking, and feature flags for A/B testing.

### Installation

```bash
cd apps/api
yarn add posthog-node
```

### Configuration

**Environment Variables (`.env`):**

```env
POSTHOG_API_KEY=phc_your_project_api_key
POSTHOG_HOST=https://app.posthog.com
```

**Analytics Service (`src/services/analytics.ts`):**

```typescript
import { PostHog } from "posthog-node";

export default class AnalyticsService {
  private client: PostHog;

  constructor() {
    this.client = new PostHog(process.env.POSTHOG_API_KEY!, {
      host: process.env.POSTHOG_HOST,
    });
  }

  async trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ) {
    this.client.capture({
      distinctId: userId,
      event,
      properties,
    });
  }

  async identifyUser(userId: string, traits: Record<string, any>) {
    this.client.identify({
      distinctId: userId,
      properties: traits,
    });
  }

  async isFeatureEnabled(userId: string, feature: string): Promise<boolean> {
    return await this.client.isFeatureEnabled(feature, userId);
  }

  async shutdown() {
    await this.client.shutdown();
  }
}
```

### Usage in Subscribers

**Order Tracking (`src/subscribers/order-placed.ts`):**

```typescript
import { SubscriberArgs } from "@medusajs/framework";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const analyticsService = container.resolve("analyticsService");

  await analyticsService.trackEvent(data.customer_id, "Order Placed", {
    order_id: data.id,
    total: data.total,
    currency: data.currency_code,
  });
}
```

### Documentation

- [PostHog Node.js Library](https://posthog.com/docs/libraries/node)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)

---

## 4. SendGrid Integration

### Purpose

Transactional email notifications for verifications, orders, and escrow updates.

### Installation

```bash
cd apps/api
yarn add @sendgrid/mail
```

### Configuration

**Environment Variables (`.env`):**

```env
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@tradepal.com
SENDGRID_FROM_NAME=TradePal
```

**Email Service (`src/services/email.ts`):**

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default class EmailService {
  async sendVerificationApproved(to: string, data: { companyName: string }) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!,
      },
      templateId: "d-verification-approved-template-id",
      dynamicTemplateData: data,
    };

    await sgMail.send(msg);
  }

  async sendOrderConfirmation(
    to: string,
    data: { orderNumber: string; total: number }
  ) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!,
      },
      templateId: "d-order-confirmation-template-id",
      dynamicTemplateData: data,
    };

    await sgMail.send(msg);
  }

  async sendEscrowReleased(
    to: string,
    data: { amount: number; currency: string }
  ) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!,
      },
      templateId: "d-escrow-released-template-id",
      dynamicTemplateData: data,
    };

    await sgMail.send(msg);
  }
}
```

### Usage in Workflows

**Update notification steps to use SendGrid:**

```typescript
// src/workflows/approve-verification/steps/notify-verification-approved.ts
export const notifyVerificationApprovedStep = createStep(
  "notify-verification-approved-step",
  async (input: NotifyVerificationApprovedStepInput, { container }) => {
    const emailService = container.resolve("emailService");

    // Get user email from user service
    const userEmail = "user@example.com"; // TODO: Fetch from user module

    await emailService.sendVerificationApproved(userEmail, {
      companyName: "Company Name", // TODO: Fetch from profile
    });

    return new StepResponse({
      notificationSent: true,
      timestamp: new Date().toISOString(),
    });
  }
);
```

### Email Templates

Create templates in SendGrid dashboard:

- Verification Approved
- Verification Rejected
- Order Confirmation
- Escrow Released
- Escrow Disputed
- Shipment Tracking Added
- Shipment Delivered

### Documentation

- [SendGrid Node.js Library](https://docs.sendgrid.com/for-developers/sending-email/api-getting-started)
- [Dynamic Templates](https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates)

---

## 5. Stripe Integration

### Purpose

Payment processing for escrow transactions with hold and capture workflow.

### Installation

```bash
cd apps/api
yarn add @medusajs/medusa-payment-stripe
```

### Configuration

**Environment Variables (`.env`):**

```env
STRIPE_API_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**medusa-config.ts:**

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@medusajs/medusa-payment-stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        capture: false, // Manual capture for escrow
      },
    },
  ],
});
```

### Usage in Workflows

**Hold Payment Step (`src/workflows/create-escrow/steps/hold-payment.ts`):**

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-10-16",
});

export const holdPaymentStep = createStep(
  "hold-payment-step",
  async (input: HoldPaymentStepInput) => {
    const { amount, currency, buyerId } = input;

    // Create Payment Intent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      capture_method: "manual",
      metadata: {
        buyer_id: buyerId,
      },
    });

    return new StepResponse(
      {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: "held",
      },
      {
        paymentIntentId: paymentIntent.id,
      }
    );
  },
  async (compensateData) => {
    if (!compensateData) return;

    // Cancel payment intent on rollback
    await stripe.paymentIntents.cancel(compensateData.paymentIntentId);
  }
);
```

**Capture Payment Step:**

```typescript
export const capturePaymentStep = createStep(
  "capture-payment-step",
  async (input: CapturePaymentStepInput) => {
    const { paymentIntentId, amount } = input;

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return new StepResponse(
      {
        paymentIntentId,
        amount,
        status: "captured",
        capturedAt: new Date().toISOString(),
      },
      {
        paymentIntentId,
        amount,
      }
    );
  },
  async (compensateData) => {
    if (!compensateData) return;

    // Refund on rollback
    await stripe.refunds.create({
      payment_intent: compensateData.paymentIntentId,
    });
  }
);
```

### Webhook Handler

**Create webhook endpoint (`src/api/webhooks/stripe/route.ts`):**

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case "payment_intent.succeeded":
      // Handle successful payment
      break;
    case "payment_intent.payment_failed":
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
```

### Documentation

- [Medusa Stripe Provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## 6. Webshipper Integration

### Purpose

Multi-carrier shipment management and tracking (DHL, FedEx, UPS, etc.).

### Installation

```bash
cd apps/api
yarn add axios
```

### Configuration

**Environment Variables (`.env`):**

```env
WEBSHIPPER_API_TOKEN=your_api_token
WEBSHIPPER_BASE_URL=https://api.webshipper.io/v2
```

**Shipment Service (`src/services/webshipper.ts`):**

```typescript
import axios from "axios";

export default class WebshipperService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.WEBSHIPPER_BASE_URL,
      headers: {
        Authorization: `Bearer ${process.env.WEBSHIPPER_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  }

  async createShipment(data: {
    orderId: string;
    carrier: string;
    fromAddress: any;
    toAddress: any;
    packages: any[];
  }) {
    const response = await this.client.post("/orders", {
      data: {
        type: "orders",
        attributes: {
          external_id: data.orderId,
          carrier_id: data.carrier,
          delivery_address: data.toAddress,
          sender_address: data.fromAddress,
          packages: data.packages,
        },
      },
    });

    return response.data;
  }

  async getTracking(shipmentId: string) {
    const response = await this.client.get(`/orders/${shipmentId}/tracking`);
    return response.data;
  }

  async listCarriers() {
    const response = await this.client.get("/carriers");
    return response.data;
  }
}
```

### Usage in Workflows

**Add Tracking with Webshipper (`src/workflows/add-tracking/steps/add-tracking-info.ts`):**

```typescript
export const addTrackingInfoStep = createStep(
  "add-tracking-info-step",
  async (input: AddTrackingInfoStepInput, { container }) => {
    const { orderId, carrier, trackingNumber } = input;
    const webshipperService = container.resolve("webshipperService");
    const shipmentModuleService = container.resolve("shipmentModuleService");

    // Create shipment in Webshipper
    const webshipperShipment = await webshipperService.createShipment({
      orderId,
      carrier,
      // ... address and package data
    });

    // Store in local database
    const tracking = await (shipmentModuleService as any).addTracking({
      order_id: orderId,
      carrier,
      tracking_number: trackingNumber,
      status: "in_transit",
      webshipper_id: webshipperShipment.id,
    });

    return new StepResponse(
      {
        id: tracking.id,
        webshipperId: webshipperShipment.id,
      },
      {
        trackingId: tracking.id,
        webshipperId: webshipperShipment.id,
      }
    );
  }
);
```

### Webhook Handler

**Tracking Updates (`src/api/webhooks/webshipper/route.ts`):**

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { event, data } = req.body;

  const shipmentModuleService = req.scope.resolve("shipmentModuleService");

  if (event === "tracking_update") {
    // Update local tracking status
    await (shipmentModuleService as any).updateTrackingStatus(
      data.external_id, // order_id
      {
        status: data.status,
        current_location: data.current_location,
        estimated_delivery: data.estimated_delivery,
      }
    );
  }

  res.json({ received: true });
}
```

### Documentation

- [Webshipper API Docs](https://docs.webshipper.io/api/)
- [Webshipper Webhooks](https://docs.webshipper.io/api/#webhooks)

---

## Environment Variables Summary

Create `.env` file in `apps/api/`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tradepal-medusa

# Redis
REDIS_URL=redis://localhost:6379

# MeiliSearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=tradepal
MINIO_USE_SSL=false

# PostHog
POSTHOG_API_KEY=phc_your_project_api_key
POSTHOG_HOST=https://app.posthog.com

# SendGrid
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@tradepal.com
SENDGRID_FROM_NAME=TradePal

# Stripe
STRIPE_API_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Webshipper
WEBSHIPPER_API_TOKEN=your_api_token
WEBSHIPPER_BASE_URL=https://api.webshipper.io/v2
```

## Docker Compose Setup

Add all services to `apps/api/docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tradepal-medusa
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=masterKey
      - MEILI_ENV=development
    volumes:
      - meilisearch_data:/meili_data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  medusa:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "9000:9000"
    depends_on:
      - postgres
      - redis
      - meilisearch
      - minio
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tradepal-medusa
      - REDIS_URL=redis://redis:6379
      - MEILISEARCH_HOST=http://meilisearch:7700
      - MINIO_ENDPOINT=minio
    volumes:
      - .:/app

volumes:
  postgres_data:
  meilisearch_data:
  minio_data:
```

## Next Steps

1. Run `docker-compose up -d` to start all services
2. Install dependencies: `yarn install`
3. Run migrations: `yarn medusa db:migrate`
4. Seed data if needed: `yarn seed`
5. Start dev server: `yarn dev`
6. Test integrations using API endpoints
