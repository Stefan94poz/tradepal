# Multi-Vendor B2B Marketplace Migration Summary

## Overview

The TradePal platform has been redesigned from a simple B2B platform to a **comprehensive multi-vendor B2B marketplace** inspired by **Alibaba.com**. This document summarizes the key changes and new features required.

## Key Architectural Changes

### 1. From Seller to Vendor Model

**Before**: Simple seller profiles with products
**After**: Full vendor management system with:

- **Vendor** entity (company-level)
- **VendorAdmin** entity (user-level management)
- Vendor storefronts with custom URLs/handles
- Commission-based revenue model
- Vendor-specific analytics and dashboards

### 2. Multi-Vendor Order Management

**New Feature**: Order Splitting by Vendor

- Single buyer cart can contain products from multiple vendors
- System automatically splits parent order into vendor-specific orders
- Each vendor fulfills their portion independently
- Separate escrow transactions per vendor
- Individual shipment tracking per vendor order

### 3. Module Links (Critical for Marketplace)

Using Medusa v2's `defineLink()` to connect:

- **Vendor → Product** (one-to-many): Each product belongs to one vendor
- **Vendor → Order** (one-to-many): Orders are split by vendor
- **VendorAdmin → User** (one-to-one): Authentication linking
- **Commission → Order** (one-to-one): Commission tracking per order

## New Modules to Implement

### 1. Enhanced Vendor Module

**Location**: `apps/api/src/modules/vendor/`

**Models**:

- `vendor.ts` - Company-level vendor entity
  - Fields: handle, name, logo, business_type, country, certifications, verification_status, commission_rate, etc.
- `vendor-admin.ts` - User account for managing vendor
  - Fields: email, first_name, last_name, vendor (relationship)

**Key Features**:

- Unique vendor handle for custom URLs (e.g., `/vendors/acme-manufacturing`)
- Per-vendor commission rates (default 5%)
- Tiered verification levels (pending, basic, verified, premium)
- Vendor-specific analytics

### 2. RFQ Module (Request for Quotation)

**Location**: `apps/api/src/modules/rfq/`

**Models**:

- `rfq.ts` - Buyer's quotation request
  - Fields: buyer_id, product_name, quantity, target_unit_price, delivery_timeline, etc.
- `rfq-quotation.ts` - Vendor's quotation response
  - Fields: rfq, vendor_id, unit_price, lead_time, payment_terms, status, etc.

**Workflow**:

1. Buyer creates RFQ with product requirements
2. Multiple vendors can submit quotations
3. Buyer compares quotations side-by-side
4. Buyer accepts best quotation → converts to order

**Alibaba Inspiration**: Similar to Alibaba's "Request for Quotation" feature

### 3. Commission Module

**Location**: `apps/api/src/modules/commission/`

**Model**:

- `commission.ts` - Platform fee tracking
  - Fields: vendor_id, order_id, order_total, commission_rate, commission_amount, status, payout_id, paid_at

**Features**:

- Automatic commission calculation on order completion
- Configurable rates per vendor (or platform-wide default)
- Integration with Stripe Connect for vendor payouts
- Commission analytics for platform admin

### 4. Messaging Module

**Location**: `apps/api/src/modules/messaging/`

**Model**:

- `message.ts` - Buyer-vendor communication
  - Fields: conversation_id, sender_id, sender_type, recipient_id, body, attachments, is_read, etc.

**Features**:

- Direct messaging between buyers and vendors
- Product inquiry forms with product reference
- Message threading by conversation
- File attachments support
- Read/unread status tracking

### 5. Enhanced Buyer Module

**Updates to existing module**:

- Add `business_type` field (distributor, retailer, reseller)
- Add `purchase_history_count` for credibility
- Add `phone` and `email` fields
- Support tiered verification (basic, verified, premium)

### 6. Enhanced Escrow Module

**Updates to existing module**:

- Change `seller_id` → `vendor_id`
- Support partial releases for multi-shipment orders
- Automatic release after timeout period (e.g., 14 days)
- Commission deduction before release to vendor

## New Workflows to Implement

### 1. Create Vendor Workflow

**Path**: `apps/api/src/workflows/create-vendor/`

**Steps**:

1. Create vendor entity
2. Create vendor admin user
3. Link vendor admin to auth user
4. Create vendor storefront URL
5. Send welcome email

**Compensation**: Delete vendor, admin, and links on failure

### 2. Create Vendor Product Workflow

**Path**: `apps/api/src/workflows/create-vendor-product/`

**Steps**:

1. Retrieve vendor information from vendor admin context
2. Create product using Medusa's core product workflow
3. Link product to vendor using module link
4. Add product to default sales channel (or vendor-specific channel)
5. Index product in MeiliSearch with vendor metadata

**Usage**: Called from vendor dashboard product creation

### 3. Split Order by Vendor Workflow

**Path**: `apps/api/src/workflows/split-order-by-vendor/`

**Steps**:

1. Group cart items by vendor_id
2. Create parent order for buyer
3. For each vendor:
   - Create vendor-specific order
   - Link vendor order to parent order
   - Link vendor order to vendor
   - Calculate commission
   - Notify vendor

**Triggered**: On cart checkout completion

### 4. Calculate and Track Commission Workflow

**Path**: `apps/api/src/workflows/calculate-commission/`

**Steps**:

1. Retrieve vendor commission rate
2. Calculate commission amount (order_total \* commission_rate / 100)
3. Create commission record
4. Link commission to order

**Triggered**: When vendor order is completed

### 5. Vendor Payout Workflow

**Path**: `apps/api/src/workflows/process-vendor-payout/`

**Steps**:

1. Retrieve all "calculated" commissions for vendor
2. Calculate net payout (total sales - total commission)
3. Create Stripe Connect payout to vendor account
4. Mark commissions as "paid"
5. Send payout confirmation email

**Triggered**: Scheduled (daily/weekly/monthly) or manual admin action

### 6. RFQ Creation and Quotation Workflow

**Path**: `apps/api/src/workflows/create-rfq/`, `submit-quotation/`, `accept-quotation/`

**RFQ Creation Steps**:

1. Validate buyer account
2. Create RFQ with expiration date
3. Notify selected vendors (or all matching vendors)

**Submit Quotation Steps**:

1. Validate vendor account
2. Create quotation linked to RFQ
3. Notify buyer

**Accept Quotation Steps**:

1. Validate quotation is still valid
2. Convert quotation to cart/order
3. Notify vendor
4. Close RFQ

## New API Routes to Implement

### Vendor Routes

**Public Vendor Routes** (`/vendors/*`):

- `POST /vendors` - Create new vendor (with admin account)
- `GET /vendors/:handle` - Get vendor storefront by handle
- `GET /vendors/:id/products` - Get vendor product catalog

**Vendor Dashboard Routes** (`/vendors/dashboard/*`):

- `GET /vendors/products` - List vendor's own products
- `POST /vendors/products` - Create product (executes create-vendor-product workflow)
- `PUT /vendors/products/:id` - Update product
- `DELETE /vendors/products/:id` - Delete product
- `GET /vendors/orders` - List vendor orders
- `POST /vendors/orders/:id/accept` - Accept order
- `POST /vendors/orders/:id/decline` - Decline order
- `GET /vendors/analytics` - Get vendor analytics
- `GET /vendors/commissions` - Get commission history
- `GET /vendors/earnings` - Get earnings summary

### RFQ Routes

**Buyer RFQ Routes** (`/store/rfq/*`):

- `POST /store/rfq` - Create RFQ
- `GET /store/rfq` - List buyer's RFQs
- `GET /store/rfq/:id` - Get RFQ with all quotations
- `POST /store/rfq/:id/accept-quotation/:quotation_id` - Accept quotation

**Vendor Quotation Routes** (`/vendors/rfq/*`):

- `GET /vendors/rfq` - List RFQs sent to vendor
- `GET /vendors/rfq/:id` - Get RFQ details
- `POST /vendors/rfq/:id/quote` - Submit quotation

### Messaging Routes

**Messaging Routes** (`/store/messages/*`, `/vendors/messages/*`):

- `POST /store/messages` - Buyer sends message to vendor
- `POST /vendors/messages` - Vendor sends message to buyer
- `GET /store/messages/conversations` - List buyer's conversations
- `GET /vendors/messages/conversations` - List vendor's conversations
- `GET /*/messages/:conversation_id` - Get conversation history
- `PUT /*/messages/:id/read` - Mark message as read

### Admin Commission Routes

**Admin Routes** (`/admin/commissions/*`):

- `GET /admin/commissions` - List all commissions
- `GET /admin/commissions/stats` - Commission analytics
- `GET /admin/vendors/:id/commissions` - Vendor-specific commissions
- `POST /admin/vendors/:id/payout` - Trigger vendor payout

## Integration Updates Required

### 1. Stripe Connect Integration

**Purpose**: Vendor payout management

**Setup**:

- Enable Stripe Connect on Stripe dashboard
- Create Connect accounts for each vendor
- Store Connect account ID in vendor record
- Use Connect to split payments (platform commission + vendor payout)

**Configuration**:

```typescript
// apps/api/medusa-config.ts
{
  resolve: "@medusajs/medusa-payment-stripe",
  options: {
    api_key: process.env.STRIPE_API_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    connect: {
      enabled: true,
      automatic_payouts: true,
      payout_schedule: "daily", // or "weekly", "monthly"
    },
  },
}
```

### 2. MeiliSearch Enhancement

**Purpose**: Multi-vendor product search with vendor metadata

**Updated Searchable Attributes**:

```typescript
searchableAttributes: [
  "title",
  "description",
  "variant_sku",
  "metadata.vendor_name",
  "metadata.vendor_location",
  "metadata.vendor_verification",
],
filterableAttributes: [
  "vendor_id",
  "metadata.vendor_country",
  "metadata.vendor_verification_status",
  "metadata.min_order_quantity",
  "metadata.bulk_pricing_available",
],
```

### 3. PostHog Analytics Enhancement

**Purpose**: Multi-vendor marketplace analytics

**New Events to Track**:

- `vendor_registered`
- `vendor_product_created`
- `rfq_submitted`
- `quotation_submitted`
- `quotation_accepted`
- `vendor_order_created`
- `commission_calculated`
- `vendor_payout_processed`
- `buyer_vendor_message_sent`

## Frontend Updates (Next.js)

### New Pages Required

**Vendor Pages** (`apps/web/src/app/vendors/*`):

- `/vendors/register` - Vendor registration form
- `/vendors/[handle]` - Public vendor storefront
- `/vendors/dashboard` - Vendor dashboard home
- `/vendors/dashboard/products` - Product management
- `/vendors/dashboard/orders` - Order management
- `/vendors/dashboard/rfqs` - RFQ inbox
- `/vendors/dashboard/messages` - Message inbox
- `/vendors/dashboard/analytics` - Sales analytics
- `/vendors/dashboard/commissions` - Commission history

**Buyer RFQ Pages** (`apps/web/src/app/rfq/*`):

- `/rfq/create` - Create RFQ form
- `/rfq` - List buyer's RFQs
- `/rfq/[id]` - View RFQ with quotations

**Messaging Pages** (`apps/web/src/app/messages/*`):

- `/messages` - Message inbox (buyer or vendor)
- `/messages/[conversation_id]` - Conversation thread

**Admin Pages** (`apps/web/src/app/admin/*`):

- `/admin/vendors` - Vendor management
- `/admin/vendors/[id]` - Vendor details
- `/admin/commissions` - Commission tracking
- `/admin/payouts` - Payout management

## Migration Steps from Current Implementation

### Step 1: Create Vendor Module (Replaces Seller)

1. Create new Vendor and VendorAdmin models
2. Create module links (vendor-product, vendor-order, vendor-admin-user)
3. Migrate existing seller data to vendor table
4. Update all seller-related API routes to vendor routes

### Step 2: Implement Order Splitting

1. Create split-order-by-vendor workflow
2. Update cart checkout to group items by vendor
3. Create vendor order table/model
4. Update order display to show parent/vendor orders

### Step 3: Add Commission Tracking

1. Create Commission module
2. Create calculate-commission workflow
3. Integrate with order completion
4. Create admin commission dashboard

### Step 4: Add RFQ System

1. Create RFQ and RFQQuotation models
2. Create RFQ workflows
3. Create buyer RFQ interface
4. Create vendor quotation interface

### Step 5: Add Messaging

1. Create Message model
2. Create messaging API routes
3. Create buyer/vendor message interfaces
4. Integrate with PostHog for analytics

### Step 6: Integrate Stripe Connect

1. Set up Stripe Connect
2. Create vendor onboarding flow
3. Implement payout workflow
4. Test commission deduction and payouts

## Key Differences from Alibaba

| Feature         | Alibaba                | TradePal                                   |
| --------------- | ---------------------- | ------------------------------------------ |
| Vendor Fees     | Transaction fees       | Commission-based (configurable per vendor) |
| Payment         | Alipay escrow          | Stripe escrow + Connect payouts            |
| Verification    | Gold/Assessed Supplier | Tiered (Basic/Verified/Premium)            |
| Search          | Proprietary            | MeiliSearch                                |
| RFQ             | Full RFQ system        | Simplified RFQ with quotations             |
| Messaging       | Trade Messenger        | Built-in messaging module                  |
| Logistics       | Integrated logistics   | Webshipper multi-carrier                   |
| Trade Assurance | Full trade protection  | Escrow + dispute resolution                |

## Next Steps

1. ✅ Update requirements.prompt.md (COMPLETED)
2. ✅ Update design.prompt.md with marketplace architecture (COMPLETED)
3. ⏳ Update tasks.prompt.md with implementation tasks (IN PROGRESS)
4. ⏳ Update integrations.guide.md with Stripe Connect and enhanced MeiliSearch
5. ⏳ Create database migration plan for seller → vendor transition
6. ⏳ Implement Vendor module with module links
7. ⏳ Implement order splitting workflow
8. ⏳ Implement Commission module and tracking
9. ⏳ Implement RFQ module
10. ⏳ Implement Messaging module

## References

- [Medusa Marketplace Documentation](https://docs.medusajs.com/marketplace/)
- [Alibaba.com B2B Model](https://www.alibaba.com/)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [MeiliSearch Marketplace Search](https://www.meilisearch.com/blog/ecommerce-search)
