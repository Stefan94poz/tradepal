---
mode: agent
---

# Design Document

## Overview

The **multi-vendor B2B marketplace platform** will be built as a full-stack application using **Medusa.js v2** as the backend commerce engine with **marketplace/multi-vendor architecture** and **Next.js 15** as the frontend framework. The architecture follows a headless commerce approach where Medusa.js provides the API layer for commerce operations, vendor management, order splitting, commission tracking, and data persistence, while Next.js handles the presentation layer with server-side rendering for optimal SEO and performance.

The platform supports three distinct user roles (**Vendors**, **Buyers**, **Administrators**) with role-based access control. The system emphasizes trust and security through profile verification, escrow payments (trade assurance), RFQ systems, multi-vendor order management, and shipment tracking integrations.

**Inspired by**: Alibaba.com's B2B marketplace model with vendor storefronts, bulk pricing, RFQs, and trade assurance.

## Architecture

### High-Level Multi-Vendor Marketplace Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Vendor Pages  │  │ Buyer Pages  │  │ Admin Pages  │     │
│  │ - Dashboard  │  │ - Search     │  │ - Vendors    │     │
│  │ - Products   │  │ - RFQs       │  │ - Orders     │     │
│  │ - Orders     │  │ - Cart       │  │ - Disputes   │     │
│  │ - Analytics  │  │ - Messages   │  │ - Commission │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Shared Components (shadcn/ui)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    API Calls (REST)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Medusa.js Backend                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Marketplace Custom Modules Layer             │  │
│  │  • VendorModule (vendors, vendor_admins)             │  │
│  │  • BuyerModule (buyer profiles)                      │  │
│  │  • PartnerModule (partner directory)                 │  │
│  │  • EscrowModule (trade assurance)                    │  │
│  │  • ShipmentModule (tracking)                         │  │
│  │  • RFQModule (request for quotations)                │  │
│  │  • CommissionModule (platform fees)                  │  │
│  │  • MessagingModule (buyer-vendor chat)               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Module Links (defineLink)                    │  │
│  │  • Vendor <-> Product (one-to-many)                  │  │
│  │  • Vendor <-> Order (parent order splitting)         │  │
│  │  • Commission <-> VendorOrder                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Medusa Services                     │  │
│  │  • ProductService  • OrderService  • AuthService     │  │
│  │  • PaymentService  • CartService                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Database Layer                       │  │
│  │              PostgreSQL with MikroORM                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    External Integrations
                            │
        ┌───────────────────┼───────────────────┬───────────────┐
        │                   │                   │               │
   ┌────────────┐     ┌──────────┐       ┌──────────┐   ┌─────────┐
   │  Stripe    │     │Webshipper│       │  MinIO   │   │SendGrid │
   │  Connect   │     │Multi-    │       │  S3      │   │Email    │
   │  (Payouts) │     │Carrier   │       │  Storage │   │Notify   │
   └────────────┘     └──────────┘       └──────────┘   └─────────┘
        │
   ┌────────────┐
   │MeiliSearch │
   │Product     │
   │Search      │
   └────────────┘
```

### Technology Stack Details

- **Backend**: Medusa.js v2.x with Node.js (Marketplace architecture)
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL 14+
- **ORM**: MikroORM (Medusa v2 default)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Authentication**: Medusa Auth with JWT (vendor admins, buyers, admin users)
- **File Storage**: MinIO (S3-compatible) for product images and verification documents
- **Payment Processing**: Stripe with Stripe Connect for vendor payouts
- **Search**: MeiliSearch for fast product and vendor search
- **Shipping**: Webshipper for multi-carrier tracking
- **Email**: SendGrid for transactional emails
- **Caching**: Redis for session management and caching
- **Analytics**: PostHog for event tracking

## Components and Interfaces

### Backend Components (Medusa.js)

#### 1. Custom Data Models (using Medusa v2 Data Model Language)

**Vendor Model (Marketplace Core)**

```typescript
// src/modules/vendor/models/vendor.ts
import { model } from "@medusajs/framework/utils";

const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().searchable(), // Unique URL handle
  name: model.text().searchable(),
  logo: model.text().nullable(),
  description: model.text().nullable(),
  business_type: model.text(), // manufacturer, wholesaler, supplier
  country: model.text(),
  city: model.text(),
  address: model.text(),
  phone: model.text(),
  email: model.text(),
  website: model.text().nullable(),
  certifications: model.array(), // Array of certification URLs
  industries: model.array(), // Array of industry categories
  verification_status: model
    .enum(["pending", "basic", "verified", "premium"])
    .default("pending"),
  verification_documents: model.array(), // Array of document URLs
  is_active: model.boolean().default(true),
  commission_rate: model.number().default(5), // Platform commission %
  created_at: model.dateTime().default("now"),
  updated_at: model.dateTime().default("now"),
});

export default Vendor;
```

**Vendor Admin Model**

```typescript
// src/modules/vendor/models/vendor-admin.ts
import { model } from "@medusajs/framework/utils";
import Vendor from "./vendor";

const VendorAdmin = model.define("vendor_admin", {
  id: model.id().primaryKey(),
  email: model.text().searchable(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  vendor: model.belongsTo(() => Vendor, {
    mappedBy: "admins",
  }),
});

export default VendorAdmin;
```

**Buyer Profile Model (Enhanced)**

```typescript
// src/modules/buyer/models/buyer-profile.ts
import { model } from "@medusajs/framework/utils";

const BuyerProfile = model.define("buyer_profile", {
  id: model.id().primaryKey(),
  user_id: model.text().searchable(),
  company_name: model.text().searchable(),
  business_type: model.text(), // distributor, retailer, reseller
  business_interests: model.array(), // Array of product categories
  business_needs: model.text(),
  country: model.text(),
  city: model.text(),
  address: model.text(),
  phone: model.text(),
  email: model.text(),
  verification_status: model
    .enum(["pending", "basic", "verified", "premium"])
    .default("pending"),
  verification_documents: model.array(), // Array of URLs
  is_buyer: model.boolean().default(true),
  purchase_history_count: model.number().default(0),
  created_at: model.dateTime().default("now"),
  updated_at: model.dateTime().default("now"),
});

export default BuyerProfile;
```

**RFQ (Request for Quotation) Model**

```typescript
// src/modules/rfq/models/rfq.ts
import { model } from "@medusajs/framework/utils";

const RFQ = model
  .define("rfq", {
    id: model.id().primaryKey(),
    buyer_id: model.text().searchable(),
    product_name: model.text().searchable(),
    product_description: model.text(),
    quantity: model.number(),
    target_unit_price: model.bigNumber().nullable(),
    currency: model.text(),
    delivery_timeline: model.text(), // "ASAP", "1-2 weeks", etc.
    delivery_address: model.text(),
    special_requirements: model.text().nullable(),
    status: model
      .enum(["open", "quoted", "accepted", "closed"])
      .default("open"),
    created_at: model.dateTime().default("now"),
    expires_at: model.dateTime(),
  })
  .indexes([
    {
      on: ["buyer_id"],
    },
    {
      on: ["status"],
    },
  ]);

export default RFQ;
```

**RFQ Quotation Model**

```typescript
// src/modules/rfq/models/rfq-quotation.ts
import { model } from "@medusajs/framework/utils";
import RFQ from "./rfq";

const RFQQuotation = model
  .define("rfq_quotation", {
    id: model.id().primaryKey(),
    rfq: model.belongsTo(() => RFQ, {
      mappedBy: "quotations",
    }),
    vendor_id: model.text().searchable(),
    unit_price: model.bigNumber(),
    total_price: model.bigNumber(),
    minimum_order_quantity: model.number(),
    lead_time: model.text(), // "7-10 days", etc.
    payment_terms: model.text(), // "30% deposit, 70% on delivery"
    valid_until: model.dateTime(),
    notes: model.text().nullable(),
    status: model
      .enum(["pending", "accepted", "rejected", "expired"])
      .default("pending"),
    created_at: model.dateTime().default("now"),
  })
  .indexes([
    {
      on: ["vendor_id"],
    },
  ]);

export default RFQQuotation;
```

**Commission Model**

```typescript
// src/modules/commission/models/commission.ts
import { model } from "@medusajs/framework/utils";

const Commission = model
  .define("commission", {
    id: model.id().primaryKey(),
    vendor_id: model.text().searchable(),
    order_id: model.text().searchable(),
    order_total: model.bigNumber(),
    commission_rate: model.number(), // Percentage
    commission_amount: model.bigNumber(),
    currency: model.text(),
    status: model.enum(["pending", "calculated", "paid"]).default("pending"),
    payout_id: model.text().nullable(), // Stripe payout ID
    created_at: model.dateTime().default("now"),
    paid_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      on: ["vendor_id"],
    },
    {
      on: ["order_id"],
      unique: true,
    },
    {
      on: ["status"],
    },
  ]);

export default Commission;
```

**Message Model (Buyer-Vendor Communication)**

```typescript
// src/modules/messaging/models/message.ts
import { model } from "@medusajs/framework/utils";

const Message = model
  .define("message", {
    id: model.id().primaryKey(),
    conversation_id: model.text().searchable(),
    sender_id: model.text(),
    sender_type: model.enum(["buyer", "vendor"]),
    recipient_id: model.text(),
    recipient_type: model.enum(["buyer", "vendor"]),
    subject: model.text().nullable(),
    body: model.text(),
    attachments: model.array(), // Array of file URLs
    is_read: model.boolean().default(false),
    product_reference: model.text().nullable(),
    created_at: model.dateTime().default("now"),
  })
  .indexes([
    {
      on: ["conversation_id"],
    },
    {
      on: ["sender_id"],
    },
    {
      on: ["recipient_id"],
    },
  ]);

export default Message;
```

**Partner Directory Profile Model**

```typescript
// src/modules/partner/models/partner-profile.ts
import { model } from "@medusajs/framework/utils";

const PartnerProfile = model
  .define("partner_profile", {
    id: model.id().primaryKey(),
    user_id: model.text().searchable(),
    profile_type: model.enum(["vendor", "buyer"]),
    company_name: model.text().searchable(),
    country: model.text(),
    industry: model.array(), // Array of strings
    looking_for: model.array(), // Array of enum values
    offers: model.array(), // Array of enum values
    is_verified: model.boolean().default(false),
  })
  .indexes([
    {
      on: ["country"],
    },
    {
      on: ["is_verified"],
    },
  ]);

export default PartnerProfile;
```

**Escrow Transaction Model**

```typescript
// src/modules/escrow/models/escrow-transaction.ts
import { model } from "@medusajs/framework/utils";

const EscrowTransaction = model
  .define("escrow_transaction", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    buyer_id: model.text(),
    vendor_id: model.text(), // Changed from seller_id
    amount: model.bigNumber(),
    currency: model.text(),
    status: model
      .enum(["held", "released", "disputed", "refunded"])
      .default("held"),
    payment_intent_id: model.text(),
    held_at: model.dateTime(),
    released_at: model.dateTime().nullable(),
    dispute_reason: model.text().nullable(),
  })
  .indexes([
    {
      on: ["order_id"],
      unique: true,
    },
    {
      on: ["status"],
    },
  ]);

export default EscrowTransaction;
```

**Shipment Tracking Model**

```typescript
// src/modules/shipment/models/shipment-tracking.ts
import { model } from "@medusajs/framework/utils";

const ShipmentTracking = model
  .define("shipment_tracking", {
    id: model.id().primaryKey(),
    order_id: model.text().searchable(),
    carrier: model.text(),
    tracking_number: model.text(),
    status: model
      .enum(["pending", "in_transit", "delivered", "failed"])
      .default("pending"),
    current_location: model.text().nullable(),
    estimated_delivery: model.dateTime().nullable(),
    last_updated: model.dateTime(),
    tracking_events: model.json(), // JSON array of tracking events
  })
  .indexes([
    {
      on: ["order_id"],
      unique: true,
    },
    {
      on: ["tracking_number"],
    },
  ]);

export default ShipmentTracking;
```

#### 2. Module Links (Critical for Marketplace Architecture)

Module links connect custom modules to Medusa core modules and each other. These links enable the multi-vendor marketplace functionality.

**Vendor-Product Link** (One-to-Many)

```typescript
// src/links/vendor-product.ts
import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(VendorModule.linkable.vendor, {
  linkable: ProductModule.linkable.product,
  isList: true, // One vendor has many products
});
```

**Usage**: Query products with vendor information:

```typescript
const { data: products } = await query.graph({
  entity: "product",
  fields: ["id", "title", "vendor.*"],
  filters: { vendor_id: "vendor_123" },
});
```

**Vendor-Order Link** (For Order Splitting)

```typescript
// src/links/vendor-order.ts
import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import OrderModule from "@medusajs/medusa/order";

export default defineLink(VendorModule.linkable.vendor, {
  linkable: OrderModule.linkable.order,
  isList: true, // One vendor has many orders
});
```

**Usage**: Retrieve vendor-specific orders:

```typescript
const { data: orders } = await query.graph({
  entity: "order",
  fields: ["*", "vendor.*"],
  filters: { vendor_id: "vendor_123" },
});
```

**VendorAdmin-User Link** (Authentication)

```typescript
// src/links/vendor-admin-user.ts
import { defineLink } from "@medusajs/framework/utils";
import VendorModule from "../modules/vendor";
import UserModule from "@medusajs/medusa/user";

export default defineLink(
  VendorModule.linkable.vendor_admin,
  UserModule.linkable.user
);
```

**Commission-Order Link**

```typescript
// src/links/commission-order.ts
import { defineLink } from "@medusajs/framework/utils";
import CommissionModule from "../modules/commission";
import OrderModule from "@medusajs/medusa/order";

export default defineLink(
  CommissionModule.linkable.commission,
  OrderModule.linkable.order
);
```

#### 3. Custom Module Services (using Medusa v2 Service Factory)

**VendorModule Service** (Replaces SellerModule)

```typescript
// src/modules/seller/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import SellerProfile from "./models/seller-profile";

class SellerModuleService extends MedusaService({
  SellerProfile,
}) {
  // Custom methods beyond auto-generated CRUD
  async submitVerification(userId: string, documents: string[]) {
    const profile = await this.listSellerProfiles({
      filters: { user_id: userId },
    });

    if (!profile.length) {
      throw new Error("Seller profile not found");
    }

    return await this.updateSellerProfiles(profile[0].id, {
      verification_documents: documents,
      verification_status: "pending",
    });
  }

  async approveVerification(userId: string) {
    const profile = await this.listSellerProfiles({
      filters: { user_id: userId },
    });

    return await this.updateSellerProfiles(profile[0].id, {
      verification_status: "verified",
    });
  }

  async rejectVerification(userId: string, reason: string) {
    const profile = await this.listSellerProfiles({
      filters: { user_id: userId },
    });

    return await this.updateSellerProfiles(profile[0].id, {
      verification_status: "rejected",
    });
  }
}

export default SellerModuleService;
```

**BuyerModule Service**

```typescript
// src/modules/buyer/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import BuyerProfile from "./models/buyer-profile";

class BuyerModuleService extends MedusaService({
  BuyerProfile,
}) {
  async submitVerification(userId: string, documents: string[]) {
    const profile = await this.listBuyerProfiles({
      filters: { user_id: userId },
    });

    if (!profile.length) {
      throw new Error("Buyer profile not found");
    }

    return await this.updateBuyerProfiles(profile[0].id, {
      verification_documents: documents,
      verification_status: "pending",
    });
  }

  async approveVerification(userId: string) {
    const profile = await this.listBuyerProfiles({
      filters: { user_id: userId },
    });

    return await this.updateBuyerProfiles(profile[0].id, {
      verification_status: "verified",
    });
  }
}

export default BuyerModuleService;
```

**EscrowModule Service**

```typescript
// src/modules/escrow/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import EscrowTransaction from "./models/escrow-transaction";

class EscrowModuleService extends MedusaService({
  EscrowTransaction,
}) {
  async createEscrow(data: {
    order_id: string;
    buyer_id: string;
    seller_id: string;
    amount: number;
    currency: string;
    payment_intent_id: string;
  }) {
    return await this.createEscrowTransactions({
      ...data,
      status: "held",
      held_at: new Date(),
    });
  }

  async releaseEscrow(orderId: string) {
    const escrow = await this.listEscrowTransactions({
      filters: { order_id: orderId },
    });

    if (!escrow.length) {
      throw new Error("Escrow transaction not found");
    }

    return await this.updateEscrowTransactions(escrow[0].id, {
      status: "released",
      released_at: new Date(),
    });
  }

  async disputeEscrow(orderId: string, reason: string) {
    const escrow = await this.listEscrowTransactions({
      filters: { order_id: orderId },
    });

    return await this.updateEscrowTransactions(escrow[0].id, {
      status: "disputed",
      dispute_reason: reason,
    });
  }

  async refundEscrow(orderId: string) {
    const escrow = await this.listEscrowTransactions({
      filters: { order_id: orderId },
    });

    return await this.updateEscrowTransactions(escrow[0].id, {
      status: "refunded",
    });
  }
}

export default EscrowModuleService;
```

**PartnerModule Service**

```typescript
// src/modules/partner/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import PartnerProfile from "./models/partner-profile";

class PartnerModuleService extends MedusaService({
  PartnerProfile,
}) {
  async searchPartners(filters: {
    country?: string;
    industry?: string[];
    looking_for?: string[];
    offers?: string[];
  }) {
    return await this.listPartnerProfiles({
      filters: {
        ...filters,
        is_verified: true,
      },
      skip: filters.skip || 0,
      take: filters.take || 20,
    });
  }
}

export default PartnerModuleService;
```

**ShipmentModule Service**

```typescript
// src/modules/shipment/service.ts
import { MedusaService } from "@medusajs/framework/utils";
import ShipmentTracking from "./models/shipment-tracking";

class ShipmentModuleService extends MedusaService({
  ShipmentTracking,
}) {
  async addTracking(data: {
    order_id: string;
    carrier: string;
    tracking_number: string;
  }) {
    return await this.createShipmentTrackings({
      ...data,
      status: "pending",
      last_updated: new Date(),
    });
  }

  async updateTrackingStatus(
    orderId: string,
    status: string,
    location?: string
  ) {
    const tracking = await this.listShipmentTrackings({
      filters: { order_id: orderId },
    });

    if (!tracking.length) {
      throw new Error("Tracking not found");
    }

    return await this.updateShipmentTrackings(tracking[0].id, {
      status,
      current_location: location,
      last_updated: new Date(),
    });
  }
}

export default ShipmentModuleService;
```

#### 3. Custom API Routes (using Medusa v2 File-Based Routing)

**Verification API Routes**

```typescript
// src/api/admin/verifications/[id]/approve/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { approveVerificationWorkflow } from "../../../../../workflows/approve-verification";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const { result } = await approveVerificationWorkflow(req.scope).run({
    input: { userId: id },
  });

  res.json({ verification: result });
}
```

```typescript
// src/api/admin/verifications/[id]/reject/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { rejectVerificationWorkflow } from "../../../../../workflows/reject-verification";

export async function POST(
  req: MedusaRequest<{ reason: string }>,
  res: MedusaResponse
) {
  const { id } = req.params;
  const { reason } = req.validatedBody;

  const { result } = await rejectVerificationWorkflow(req.scope).run({
    input: { userId: id, reason },
  });

  res.json({ verification: result });
}
```

```typescript
// src/api/admin/verifications/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SELLER_MODULE } from "../../../modules/seller";
import { BUYER_MODULE } from "../../../modules/buyer";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sellerService = req.scope.resolve(SELLER_MODULE);
  const buyerService = req.scope.resolve(BUYER_MODULE);

  const sellerVerifications = await sellerService.listSellerProfiles({
    filters: { verification_status: "pending" },
  });

  const buyerVerifications = await buyerService.listBuyerProfiles({
    filters: { verification_status: "pending" },
  });

  res.json({
    verifications: [...sellerVerifications, ...buyerVerifications],
  });
}
```

```typescript
// src/api/store/verification/submit/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { submitVerificationWorkflow } from "../../../../workflows/submit-verification";

export async function POST(
  req: MedusaRequest<{ documents: string[] }>,
  res: MedusaResponse
) {
  const userId = req.auth_context?.actor_id;
  const { documents } = req.validatedBody;

  const { result } = await submitVerificationWorkflow(req.scope).run({
    input: { userId, documents },
  });

  res.json({ verification: result });
}
```

```typescript
// src/api/store/verification/status/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SELLER_MODULE } from "../../../modules/seller";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const userId = req.auth_context?.actor_id;
  const sellerService = req.scope.resolve(SELLER_MODULE);

  const profile = await sellerService.listSellerProfiles({
    filters: { user_id: userId },
  });

  res.json({
    verification_status: profile[0]?.verification_status || "not_submitted",
  });
}
```

**Escrow API Routes**

```typescript
// src/api/store/orders/[id]/escrow/release/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { releaseEscrowWorkflow } from "../../../../../../workflows/release-escrow";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const { result } = await releaseEscrowWorkflow(req.scope).run({
    input: { orderId: id },
  });

  res.json({ escrow: result });
}
```

```typescript
// src/api/store/orders/[id]/escrow/dispute/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { disputeEscrowWorkflow } from "../../../../../../workflows/dispute-escrow";

export async function POST(
  req: MedusaRequest<{ reason: string }>,
  res: MedusaResponse
) {
  const { id } = req.params;
  const { reason } = req.validatedBody;

  const { result } = await disputeEscrowWorkflow(req.scope).run({
    input: { orderId: id, reason },
  });

  res.json({ escrow: result });
}
```

```typescript
// src/api/store/orders/[id]/escrow/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ESCROW_MODULE } from "../../../../../modules/escrow";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const escrowService = req.scope.resolve(ESCROW_MODULE);

  const escrow = await escrowService.listEscrowTransactions({
    filters: { order_id: id },
  });

  res.json({ escrow: escrow[0] });
}
```

**Partner Directory API Routes**

```typescript
// src/api/store/partners/search/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PARTNER_MODULE } from "../../../../modules/partner";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const partnerService = req.scope.resolve(PARTNER_MODULE);
  const { country, industry, looking_for, offers } = req.query;

  const partners = await partnerService.searchPartners({
    country,
    industry: industry ? JSON.parse(industry) : undefined,
    looking_for: looking_for ? JSON.parse(looking_for) : undefined,
    offers: offers ? JSON.parse(offers) : undefined,
  });

  res.json({ partners });
}
```

```typescript
// src/api/store/partners/profile/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createPartnerProfileWorkflow } from "../../../../workflows/create-partner-profile";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const userId = req.auth_context?.actor_id;

  const { result } = await createPartnerProfileWorkflow(req.scope).run({
    input: { userId, ...req.validatedBody },
  });

  res.json({ profile: result });
}
```

**Shipment Tracking API Routes**

```typescript
// src/api/store/orders/[id]/tracking/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { addTrackingWorkflow } from "../../../../../workflows/add-tracking";
import { SHIPMENT_MODULE } from "../../../../../modules/shipment";

export async function POST(
  req: MedusaRequest<{ carrier: string; tracking_number: string }>,
  res: MedusaResponse
) {
  const { id } = req.params;
  const { carrier, tracking_number } = req.validatedBody;

  const { result } = await addTrackingWorkflow(req.scope).run({
    input: { order_id: id, carrier, tracking_number },
  });

  res.json({ tracking: result });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const shipmentService = req.scope.resolve(SHIPMENT_MODULE);

  const tracking = await shipmentService.listShipmentTrackings({
    filters: { order_id: id },
  });

  res.json({ tracking: tracking[0] });
}
```

#### 4. Custom Workflows (using Medusa v2 Workflow SDK)

**Approve Verification Workflow**

```typescript
// src/workflows/approve-verification/index.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { approveVerificationStep } from "./steps/approve-verification";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  userId: string;
};

export const approveVerificationWorkflow = createWorkflow(
  "approve-verification",
  (input: WorkflowInput) => {
    const verification = approveVerificationStep(input);
    sendNotificationStep({
      userId: input.userId,
      type: "verification_approved",
    });

    return new WorkflowResponse(verification);
  }
);
```

```typescript
// src/workflows/approve-verification/steps/approve-verification.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { SELLER_MODULE } from "../../../modules/seller";

export const approveVerificationStep = createStep(
  "approve-verification",
  async (input: { userId: string }, { container }) => {
    const sellerService = container.resolve(SELLER_MODULE);

    const profile = await sellerService.approveVerification(input.userId);

    return new StepResponse(profile, profile.id);
  },
  async (profileId, { container }) => {
    if (!profileId) return;

    const sellerService = container.resolve(SELLER_MODULE);
    await sellerService.updateSellerProfiles(profileId, {
      verification_status: "pending",
    });
  }
);
```

**Create Escrow Workflow**

```typescript
// src/workflows/create-escrow/index.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createEscrowStep } from "./steps/create-escrow";
import { holdPaymentStep } from "./steps/hold-payment";

type WorkflowInput = {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
};

export const createEscrowWorkflow = createWorkflow(
  "create-escrow",
  (input: WorkflowInput) => {
    const paymentIntent = holdPaymentStep({
      amount: input.amount,
      currency: input.currency,
    });

    const escrow = createEscrowStep({
      ...input,
      payment_intent_id: paymentIntent.id,
    });

    return new WorkflowResponse(escrow);
  }
);
```

**Release Escrow Workflow**

```typescript
// src/workflows/release-escrow/index.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { releaseEscrowStep } from "./steps/release-escrow";
import { capturePaymentStep } from "./steps/capture-payment";
import { sendNotificationStep } from "./steps/send-notification";

type WorkflowInput = {
  orderId: string;
};

export const releaseEscrowWorkflow = createWorkflow(
  "release-escrow",
  (input: WorkflowInput) => {
    const escrow = releaseEscrowStep(input);
    capturePaymentStep({ paymentIntentId: escrow.payment_intent_id });
    sendNotificationStep({
      orderId: input.orderId,
      type: "escrow_released",
    });

    return new WorkflowResponse(escrow);
  }
);
```

### Frontend Components (Next.js)

#### Page Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── register/[role]/ (seller or buyer specific)
├── (seller)/
│   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── profile/
│   └── store/[sellerId]/
├── (buyer)/
│   ├── search/
│   ├── partners/
│   ├── orders/
│   └── profile/
├── (admin)/
│   ├── dashboard/
│   ├── verifications/
│   ├── escrow/
│   └── settings/
└── (public)/
    ├── sellers/[sellerId]/
    └── buyers/[buyerId]/
```

#### Key UI Components (shadcn/ui based)

**ProductCard**

- Display product image, name, price, seller info
- Quick view and add to inquiry actions
- Used in search results and seller store pages

**SellerStoreHeader**

- Company information display
- Verification badge
- Contact buttons
- Used on public seller store pages

**OrderTable**

- Tabular display of orders with status
- Filtering and sorting capabilities
- Action buttons (accept, decline, add tracking)
- Used in seller dashboard and buyer order history

**PartnerSearchFilters**

- Multi-select filters for country, industry, looking for, offers
- Search input for company name
- Used in partner directory page

**VerificationBadge**

- Visual indicator of verification status
- Tooltip with verification details
- Used throughout the platform

**EscrowStatusCard**

- Display escrow transaction status
- Action buttons (release, dispute)
- Timeline of escrow events
- Used in order detail pages

**TrackingTimeline**

- Visual timeline of shipment events
- Current location and status
- Estimated delivery date
- Used in order detail pages

## Data Models

### Database Schema Extensions

The platform extends Medusa's core schema with custom tables managed through modules:

**Module Registration**

All custom modules must be registered in `medusa-config.ts`:

```typescript
// medusa-config.ts
import { defineConfig } from "@medusajs/framework/utils";

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ... other config
  },
  modules: [
    {
      resolve: "./modules/seller",
    },
    {
      resolve: "./modules/buyer",
    },
    {
      resolve: "./modules/partner",
    },
    {
      resolve: "./modules/escrow",
    },
    {
      resolve: "./modules/shipment",
    },
  ],
});
```

**Generating and Running Migrations**

Medusa v2 uses MikroORM for migrations. Generate migrations for your modules:

```bash
# Generate migrations for all modules
npx medusa db:generate seller
npx medusa db:generate buyer
npx medusa db:generate partner
npx medusa db:generate escrow
npx medusa db:generate shipment

# Run all migrations
npx medusa db:migrate
```

**seller_profiles Table**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: user_id, verification_status, country
- Searchable fields: company_name, user_id

**buyer_profiles Table**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: user_id, verification_status, country
- Searchable fields: company_name, user_id

**partner_profiles Table**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: country, is_verified
- Searchable fields: company_name, user_id

**escrow_transactions Table**

- Primary key: id (uuid)
- Foreign key: order_id → orders.id (unique)
- Indexes: order_id (unique), status
- Searchable fields: order_id

**shipment_trackings Table**

- Primary key: id (uuid)
- Foreign key: order_id → orders.id (unique)
- Indexes: order_id (unique), tracking_number
- Searchable fields: order_id

### Data Relationships

```
User (Medusa Core)
  ├── has one SellerProfile (if seller)
  ├── has one BuyerProfile (if buyer)
  ├── has one PartnerDirectoryProfile
  └── has many VerificationDocuments

Order (Medusa Core)
  ├── has one EscrowTransaction
  ├── has one ShipmentTracking
  ├── belongs to Buyer (Customer)
  └── belongs to Seller (via Product → Store)

Product (Medusa Core)
  └── belongs to Seller (via Store)
```

## Error Handling

### Error Categories

**Authentication Errors**

- 401 Unauthorized: Invalid or expired token
- 403 Forbidden: Insufficient permissions for role-based actions
- Handle with redirect to login and clear error messages

**Validation Errors**

- 400 Bad Request: Invalid input data
- Return detailed field-level validation errors
- Display inline validation messages in forms

**Business Logic Errors**

- 409 Conflict: Verification already submitted, escrow already released
- 422 Unprocessable Entity: Cannot perform action in current state
- Display user-friendly error messages with suggested actions

**External Service Errors**

- 502 Bad Gateway: Payment gateway or shipping API failures
- Implement retry logic with exponential backoff
- Provide fallback UI and manual intervention options

**Database Errors**

- 500 Internal Server Error: Database connection or query failures
- Log errors for monitoring
- Display generic error message to users

### Error Handling Strategy

**Backend (Medusa.js)**

```typescript
// Custom error classes
class VerificationError extends Error {
  code: string;
  statusCode: number;
}

// Global error handler middleware
app.use((error, req, res, next) => {
  logger.error(error);

  if (error instanceof VerificationError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
  }

  // Default error response
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
});
```

**Frontend (Next.js)**

```typescript
// API client with error handling
async function apiCall(endpoint, options) {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.code, error.message, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle known API errors
      toast.error(error.message);
    } else {
      // Handle network errors
      toast.error("Network error. Please try again.");
    }
    throw error;
  }
}
```

## Testing Strategy

### Backend Testing

**Unit Tests**

- Test custom services in isolation with mocked dependencies
- Focus on business logic: verification approval, escrow release conditions
- Target: 80% code coverage for custom services
- Tools: Jest, ts-mockito

**Integration Tests**

- Test API endpoints with test database
- Verify database transactions and data integrity
- Test authentication and authorization flows
- Tools: Jest, Supertest, test PostgreSQL instance

**Example Test Cases**

- VerificationService: Approve verification updates status and sends notification
- EscrowService: Cannot release escrow without buyer confirmation
- PartnerSearchService: Search filters return correct results
- ShipmentTrackingService: Tracking updates trigger buyer notifications

### Frontend Testing

**Component Tests**

- Test UI components with various props and states
- Verify user interactions and event handlers
- Test form validation and submission
- Tools: Jest, React Testing Library

**Integration Tests**

- Test page-level components with mocked API responses
- Verify navigation and routing
- Test authentication flows
- Tools: Jest, React Testing Library

**E2E Tests**

- Test critical user flows end-to-end
- Seller: Register → Verify → Add Product → Receive Order
- Buyer: Register → Search → Place Order → Track Shipment
- Admin: Review Verification → Manage Escrow Dispute
- Tools: Playwright or Cypress

**Example Test Cases**

- ProductCard: Displays product information correctly
- OrderTable: Filters orders by status
- PartnerSearchFilters: Applies multiple filters correctly
- EscrowStatusCard: Shows correct actions based on user role and escrow status

### Testing Environments

- **Local**: Developer machines with Docker Compose for services
- **CI/CD**: Automated test runs on pull requests
- **Staging**: Pre-production environment for manual QA
- **Production**: Monitoring and error tracking with Sentry

### Performance Testing

- Load testing for product search with 10,000+ products
- Stress testing for concurrent order processing
- API response time targets: < 200ms for reads, < 500ms for writes
- Tools: k6 or Artillery

## Security Considerations

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC) for seller, buyer, admin routes
- API endpoints protected with role middleware
- Session management with Redis for scalability

### Data Protection

- Encrypt sensitive data at rest (verification documents, payment info)
- Use HTTPS for all communications
- Sanitize user inputs to prevent XSS and SQL injection
- Implement rate limiting on API endpoints

### Payment Security

- PCI DSS compliance through payment gateway (Stripe)
- Never store raw credit card data
- Escrow funds held in payment gateway, not in application
- Audit trail for all financial transactions

### File Upload Security

- Validate file types and sizes for document uploads
- Scan uploaded files for malware
- Store files in isolated S3 buckets with restricted access
- Generate signed URLs for temporary file access

## Deployment Architecture

### Infrastructure

- **Application Servers**: Docker containers on AWS ECS or similar
- **Database**: Managed PostgreSQL (AWS RDS)
- **Cache**: Managed Redis (AWS ElastiCache)
- **File Storage**: AWS S3 with CloudFront CDN
- **Load Balancer**: Application Load Balancer for high availability

### CI/CD Pipeline

1. Code push triggers GitHub Actions workflow
2. Run linting and type checking
3. Run unit and integration tests
4. Build Docker images
5. Push images to container registry
6. Deploy to staging environment
7. Run E2E tests on staging
8. Manual approval for production deployment
9. Deploy to production with blue-green strategy

### Monitoring & Observability

- Application logs: CloudWatch or ELK stack
- Error tracking: Sentry
- Performance monitoring: New Relic or Datadog
- Uptime monitoring: Pingdom or UptimeRobot
- Custom metrics: Order volume, verification queue length, escrow disputes

## Scalability Considerations

### Database Optimization

- Index frequently queried fields (verification_status, location, etc.)
- Implement database connection pooling
- Use read replicas for search queries
- Partition large tables (orders, products) by date

### Caching Strategy

- Cache product catalog data with Redis (TTL: 5 minutes)
- Cache partner directory search results (TTL: 10 minutes)
- Cache user profile data in session
- Invalidate cache on data updates

### API Optimization

- Implement pagination for list endpoints (default: 20 items)
- Use GraphQL or field selection for flexible data fetching
- Compress API responses with gzip
- Implement API response caching with ETags

### Frontend Optimization

- Server-side rendering for SEO-critical pages (product listings, seller stores)
- Static generation for public pages where possible
- Image optimization with Next.js Image component
- Code splitting and lazy loading for large components
- CDN for static assets
