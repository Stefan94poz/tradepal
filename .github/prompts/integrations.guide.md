# Third-Party Integrations Guide

This guide covers all third-party service integrations for the TradePal **multi-vendor B2B marketplace platform** using Medusa v2.

## Overview

TradePal integrates with the following services:

1. **MeiliSearch** - Product search and discovery (multi-vendor support)
2. **MinIO** - File storage for images and documents
3. **PostHog** - Analytics and feature flags (marketplace events)
4. **SendGrid** - Email notifications
5. **Stripe** - Payment processing and escrow
6. **Stripe Connect** - Vendor payout management (NEW - Marketplace Critical)
7. **Webshipper** - Multi-carrier shipment tracking

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

## 6. Stripe Connect Integration (Marketplace Critical)

### Purpose

Vendor payout management for the multi-vendor marketplace. Stripe Connect enables:

- Automated vendor payouts
- Platform commission deduction
- Split payments between platform and vendors
- Vendor onboarding and verification

### Prerequisites

**Stripe Account Setup**:

1. Enable Stripe Connect on your Stripe Dashboard
2. Choose Connect type: **Express** (recommended for TradePal)
3. Configure platform settings and branding

### Installation

Stripe Connect uses the same `@medusajs/medusa-payment-stripe` package with additional configuration.

```bash
cd apps/api
# Already installed if using Stripe for payments
yarn add @medusajs/medusa-payment-stripe
```

### Configuration

**Environment Variables (`.env`):**

```env
STRIPE_API_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CONNECT_ENABLED=true
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id
```

**medusa-config.ts:**

```typescript
import { defineConfig } from "@medusajs/framework/utils";

export default defineConfig({
  plugins: [
    {
      resolve: "@medusajs/medusa-payment-stripe",
      options: {
        api_key: process.env.STRIPE_API_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        // Stripe Connect configuration for marketplace
        connect: {
          enabled: true,
          client_id: process.env.STRIPE_CONNECT_CLIENT_ID,
          automatic_payouts: true,
          payout_schedule: {
            interval: "daily", // "daily", "weekly", or "monthly"
            delay_days: 2, // Delay before payout
          },
        },
      },
    },
  ],
});
```

### Vendor Onboarding Flow

**1. Create Connect Account for Vendor**

```typescript
// src/workflows/create-vendor/steps/create-connect-account.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import Stripe from "stripe";

type CreateConnectAccountInput = {
  vendor_id: string;
  email: string;
  business_name: string;
  country: string;
};

const createConnectAccountStep = createStep(
  "create-connect-account",
  async (input: CreateConnectAccountInput, { container }) => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });

    const account = await stripe.accounts.create({
      type: "express",
      email: input.email,
      business_type: "company",
      company: {
        name: input.business_name,
      },
      country: input.country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        vendor_id: input.vendor_id,
      },
    });

    return new StepResponse(
      {
        connect_account_id: account.id,
      },
      account.id
    );
  },
  async (accountId, { container }) => {
    if (!accountId) return;

    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-10-16",
    });

    // Delete account on rollback
    await stripe.accounts.del(accountId);
  }
);

export default createConnectAccountStep;
```

**2. Generate Account Onboarding Link**

```typescript
// src/api/vendors/connect/onboarding/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { vendor_id } = req.auth_context; // From authenticated vendor admin

  const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2023-10-16",
  });

  // Get vendor's Connect account ID from database
  const vendorModuleService = req.scope.resolve("vendorModuleService");
  const vendor = await vendorModuleService.retrieveVendor(vendor_id);

  if (!vendor.connect_account_id) {
    return res.status(400).json({
      error: "Vendor does not have a Connect account",
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: vendor.connect_account_id,
    refresh_url: `${process.env.FRONTEND_URL}/vendors/dashboard/connect/refresh`,
    return_url: `${process.env.FRONTEND_URL}/vendors/dashboard/connect/success`,
    type: "account_onboarding",
  });

  res.json({
    url: accountLink.url,
  });
}
```

**3. Update Vendor Model with Connect Account**

```typescript
// Add to vendor.ts model
const Vendor = model.define("vendor", {
  // ... existing fields
  connect_account_id: model.text().nullable(),
  connect_onboarding_complete: model.boolean().default(false),
  connect_charges_enabled: model.boolean().default(false),
  connect_payouts_enabled: model.boolean().default(false),
});
```

### Commission Calculation and Payout

**1. Calculate Commission on Order Completion**

```typescript
// src/workflows/complete-vendor-order/steps/calculate-commission.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type CalculateCommissionInput = {
  vendor_id: string;
  order_id: string;
  order_total: number;
  currency: string;
};

const calculateCommissionStep = createStep(
  "calculate-commission",
  async (input: CalculateCommissionInput, { container }) => {
    const vendorModuleService = container.resolve("vendorModuleService");
    const commissionModuleService = container.resolve(
      "commissionModuleService"
    );

    // Get vendor's commission rate
    const vendor = await vendorModuleService.retrieveVendor(input.vendor_id);
    const commissionRate = vendor.commission_rate || 5; // Default 5%

    const commissionAmount = Math.round(
      (input.order_total * commissionRate) / 100
    );

    // Create commission record
    const commission = await commissionModuleService.createCommissions({
      vendor_id: input.vendor_id,
      order_id: input.order_id,
      order_total: input.order_total,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      currency: input.currency,
      status: "calculated",
    });

    return new StepResponse(commission);
  }
);

export default calculateCommissionStep;
```

**2. Process Vendor Payout**

```typescript
// src/workflows/process-vendor-payout/index.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import Stripe from "stripe";

type ProcessPayoutInput = {
  vendor_id: string;
};

const processVendorPayoutWorkflow = createWorkflow(
  "process-vendor-payout",
  (input: ProcessPayoutInput) => {
    // Implementation steps:
    // 1. Retrieve all "calculated" commissions for vendor
    // 2. Calculate total sales and total commission
    // 3. Calculate net payout (sales - commission)
    // 4. Create Stripe payout to Connect account
    // 5. Mark commissions as "paid"
    // 6. Send payout confirmation email
  }
);
```

**Payout API Route**:

```typescript
// src/api/admin/vendors/[id]/payout/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { processVendorPayoutWorkflow } from "../../../../workflows/process-vendor-payout";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: vendor_id } = req.params;

  const { result } = await processVendorPayoutWorkflow(req.scope).run({
    input: { vendor_id },
  });

  res.json({
    payout: result,
  });
}
```

### Split Payments (Alternative to Separate Payouts)

For real-time commission deduction during payment:

```typescript
// Create payment intent with application fee
const stripe = new Stripe(process.env.STRIPE_API_KEY!);

const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000, // $100.00
  currency: "usd",
  application_fee_amount: 500, // $5.00 commission (5%)
  transfer_data: {
    destination: vendor.connect_account_id,
  },
});
```

### Webhook Handling

**Handle Connect Account Updates**:

```typescript
// src/api/webhooks/stripe-connect/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Stripe from "stripe";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const stripe = new Stripe(process.env.STRIPE_API_KEY!);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const vendorModuleService = req.scope.resolve("vendorModuleService");

  switch (event.type) {
    case "account.updated":
      const account = event.data.object;
      const vendor_id = account.metadata.vendor_id;

      await vendorModuleService.updateVendors(vendor_id, {
        connect_charges_enabled: account.charges_enabled,
        connect_payouts_enabled: account.payouts_enabled,
        connect_onboarding_complete:
          account.charges_enabled && account.payouts_enabled,
      });
      break;

    case "payout.paid":
      // Handle successful payout
      break;

    case "payout.failed":
      // Handle failed payout
      break;
  }

  res.json({ received: true });
}
```

### Frontend Integration

**Vendor Onboarding Button**:

```tsx
// apps/web/src/components/vendor/connect-onboarding.tsx
"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";

export function ConnectOnboardingButton() {
  const [loading, setLoading] = useState(false);

  const handleOnboarding = async () => {
    setLoading(true);
    const response = await fetch("/api/vendors/connect/onboarding", {
      method: "POST",
      credentials: "include",
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <Button onClick={handleOnboarding} disabled={loading}>
      {loading ? "Loading..." : "Complete Stripe Onboarding"}
    </Button>
  );
}
```

### Testing

**Test Mode Setup**:

1. Use Stripe test API keys
2. Create test Connect accounts
3. Use test credit cards (4242 4242 4242 4242)
4. Monitor events in Stripe Dashboard → Developers → Events

**Test Payouts**:

```bash
# Trigger test payout via Stripe CLI
stripe trigger payout.paid
```

### Documentation

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Split Payments](https://stripe.com/docs/connect/charges#on-behalf-of)
- [Account Onboarding](https://stripe.com/docs/connect/onboarding)
- [Stripe CLI Testing](https://stripe.com/docs/stripe-cli)

---

## 7. Webshipper Integration

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

# Stripe Connect (Marketplace)
STRIPE_CONNECT_ENABLED=true
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id

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
