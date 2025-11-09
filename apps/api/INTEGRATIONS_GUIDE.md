# TradePal Integrations Guide

## Overview

This document details all third-party integrations configured in TradePal backend.

---

## 🗂️ File Storage: MinIO (S3-Compatible)

### Configuration

- **Service**: MinIO (Docker container)
- **API Port**: 9002 (mapped from 9000 internal)
- **Console Port**: 9001
- **Credentials**: minioadmin / minioadmin (development only)

### Docker Compose Setup

```yaml
minio:
  image: minio/minio:latest
  ports:
    - "9002:9000" # API
    - "9001:9001" # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
```

### Buckets Created Automatically

1. **tradepal-products** - Public read access for product images
2. **tradepal-documents** - Private access for verification documents (presigned URLs)

### Module: `src/modules/file-storage/`

**Service Methods**:

```typescript
uploadProductImage(file, fileName, contentType); // Returns public URL
uploadVerificationDocument(file, fileName, userId, contentType); // Returns object name
getPresignedUrl(objectName, expiresIn); // Generate temporary access URL (default: 1hr)
deleteFile(bucketName, objectName);
listProductImages(prefix);
```

### API Endpoints

#### Upload Verification Documents

```http
POST /store/verification/upload
Content-Type: multipart/form-data

{
  "file": <binary>
}

Response:
{
  "objectName": "verifications/{userId}/1234567890-document.pdf",
  "url": "https://presigned-url...",
  "message": "Document uploaded successfully"
}
```

#### Upload Product Images

```http
POST /store/products/:id/images
Content-Type: multipart/form-data

{
  "images": <binary[]>
}

Response:
{
  "images": ["http://localhost:9002/tradepal-products/products/..."],
  "count": 3,
  "message": "Images uploaded successfully"
}
```

### Environment Variables

```env
MINIO_ENDPOINT=minio:9000          # Docker internal
MINIO_PUBLIC_HOST=localhost        # External access
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
```

### Access MinIO Console

```
URL: http://localhost:9001
Username: minioadmin
Password: minioadmin
```

---

## 💳 Payment Gateway: Stripe

### Configuration

- **Package**: `stripe` (latest SDK)
- **Mode**: Manual capture for escrow (hold funds)
- **Module**: Medusa payment provider

### Medusa Config

```typescript
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/payment-stripe",
        id: "stripe",
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          capture: false, // Manual capture for escrow
        },
      },
    ],
  },
}
```

### Integration in Escrow Workflows

#### Create Escrow (Hold Funds)

```typescript
// workflow: create-escrow.ts
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Cents
  currency: "usd",
  capture_method: "manual", // Hold funds without charging
  metadata: {
    order_id,
    buyer_id,
    seller_id,
    escrow: "true",
  },
});
```

#### Release Escrow (Capture Payment)

```typescript
// workflow: release-escrow.ts
await stripe.paymentIntents.capture(paymentIntentId);
// Funds transferred to seller
```

#### Refund Escrow

```typescript
// workflow: refund-escrow.ts
await stripe.paymentIntents.cancel(paymentIntentId); // If not captured yet
// OR
await stripe.refunds.create({ payment_intent: paymentIntentId }); // If already captured
```

### Compensation (Rollback) Logic

All workflows include automatic rollback:

- **Create fails** → Cancel payment intent
- **Release fails** → Refund payment
- **Dispute fails** → No action (manual admin intervention)

### Environment Variables

```env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testing with Stripe CLI

```bash
# Listen to webhooks locally
stripe listen --forward-to localhost:9000/stripe/webhooks

# Trigger test payment
stripe trigger payment_intent.succeeded
```

### Webhook Events to Handle (TODO)

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`

---

## 🔍 Search Engine: MeiliSearch

### Configuration

- **Service**: MeiliSearch v1.13 (Docker container)
- **Port**: 7700
- **API Key**: masterKey (development only)

### Docker Compose Setup

```yaml
meilisearch:
  image: getmeili/meilisearch:v1.13
  ports:
    - "7700:7700"
  environment:
    MEILI_MASTER_KEY: masterKey
    MEILI_ENV: development
```

### Module: `src/modules/search/`

### Indexes Created Automatically

#### 1. Products Index

```typescript
Searchable: ["title", "description", "company_name", "tags"];
Filterable: [
  "category",
  "seller_location",
  "minimum_order_quantity",
  "price",
  "availability_status",
];
Sortable: ["price", "created_at", "minimum_order_quantity"];
```

#### 2. Partners Index

```typescript
Searchable: ["company_name", "description"];
Filterable: ["country", "industry", "looking_for", "offers", "is_verified"];
```

### Service Methods

#### Index Products

```typescript
searchService.indexProduct({
  id, title, description, category,
  company_name, seller_location,
  minimum_order_quantity, price,
  availability_status, tags, created_at
})

searchService.indexProducts([...]) // Bulk indexing
```

#### Search Products

```typescript
searchService.searchProducts({
  query: "laptop",
  category: "electronics",
  minPrice: 100,
  maxPrice: 1000,
  sellerLocation: "China",
  minMoq: 10,
  maxMoq: 100,
  availabilityStatus: "in_stock",
  limit: 20,
  offset: 0,
  sort: ["price:asc"],
});
```

#### Index Partners

```typescript
searchService.indexPartner({
  id,
  company_name,
  description,
  country,
  industry: ["textiles", "apparel"],
  looking_for: ["suppliers", "buyers"],
  offers: ["wholesale", "manufacturing"],
  is_verified: true,
});
```

### API Endpoints

#### Search Products

```http
GET /store/search/products?q=laptop&category=electronics&min_price=100&max_price=1000&seller_location=China&min_moq=10&availability=in_stock&limit=20&offset=0&sort=price:asc

Response:
{
  "products": [...],
  "total": 156,
  "limit": 20,
  "offset": 0,
  "query": "laptop",
  "processingTimeMs": 12
}
```

#### Search Partners

```http
GET /store/search/partners?q=textile&country=India&industry=textiles&industry=apparel&looking_for=suppliers&offers=wholesale&limit=20&offset=0

Response:
{
  "partners": [...],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "query": "textile",
  "processingTimeMs": 8
}
```

### Environment Variables

```env
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=masterKey
```

### Access MeiliSearch Dashboard

```
URL: http://localhost:7700
API Key: masterKey
```

### Performance Notes

- Typo-tolerant by default (1-2 character typos handled)
- Sub-10ms search on datasets < 100k documents
- Real-time indexing (updates reflected immediately)
- Faceted search supported (filter counts)

---

## 📦 Dependencies Installed

```json
{
  "stripe": "19.3.0",
  "minio": "8.0.6",
  "@aws-sdk/client-s3": "3.927.0",
  "@aws-sdk/s3-request-presigner": "3.927.0",
  "meilisearch": "0.54.0",
  "formidable": "3.5.4",
  "@types/formidable": "3.4.6"
}
```

---

## 🐳 Docker Services Running

| Service       | Port | Purpose        | Access                                                        |
| ------------- | ---- | -------------- | ------------------------------------------------------------- |
| PostgreSQL    | 5432 | Database       | `postgres://postgres:postgres@localhost:5432/tradepal-medusa` |
| Redis         | 6379 | Cache/sessions | `redis://localhost:6379`                                      |
| MinIO API     | 9002 | File storage   | http://localhost:9002                                         |
| MinIO Console | 9001 | Admin UI       | http://localhost:9001                                         |
| MeiliSearch   | 7700 | Search engine  | http://localhost:7700                                         |
| Medusa API    | 9000 | Backend        | http://localhost:9000                                         |

---

## 🔄 Integration Workflow Examples

### Complete Order Flow with Integrations

1. **Buyer creates order**

   ```
   POST /store/cart/:id/complete
   ```

2. **Seller accepts order → Create escrow**

   ```
   POST /store/orders/:id/accept
   → Triggers create-escrow workflow
   → Stripe payment intent created (manual capture)
   → Funds held in escrow
   ```

3. **Seller uploads product images**

   ```
   POST /store/products/:id/images
   → Files uploaded to MinIO (tradepal-products bucket)
   → Public URLs returned
   → Product updated in MeiliSearch index
   ```

4. **Seller ships product → Add tracking**

   ```
   POST /store/orders/:id/tracking
   → Tracking info stored
   → Buyer notified (TODO: email notification)
   ```

5. **Buyer confirms delivery → Release escrow**

   ```
   POST /store/orders/:id/escrow/release
   → Triggers release-escrow workflow
   → Stripe payment intent captured
   → Funds transferred to seller
   ```

6. **Product appears in search**
   ```
   GET /store/search/products?q=product-name
   → MeiliSearch returns instant results
   → Filters applied (MOQ, price, location)
   ```

### Verification Flow with File Upload

1. **Seller uploads documents**

   ```
   POST /store/verification/upload
   → File uploaded to MinIO (tradepal-documents bucket)
   → Presigned URL generated (1hr expiry)
   → URL saved in verification_documents table
   ```

2. **Admin reviews documents**

   ```
   GET /admin/verifications
   → Retrieves verification with presigned URLs
   → Admin downloads documents securely
   ```

3. **Admin approves verification**
   ```
   POST /admin/verifications/:id/approve
   → Profile verification_status updated to 'verified'
   → Partner profile indexed in MeiliSearch
   → Partner appears in directory search
   ```

---

## 🚀 Starting All Services

```bash
make up              # Start all containers
make logs            # View logs
make down            # Stop all containers
```

Containers start in order:

1. PostgreSQL, Redis, MinIO, MeiliSearch
2. Medusa backend (waits for dependencies)

---

## ✅ Verification Checklist

### MinIO

- [ ] Access console at http://localhost:9001
- [ ] Verify buckets created: `tradepal-products`, `tradepal-documents`
- [ ] Test file upload via API endpoint
- [ ] Verify public URL works for product images

### Stripe

- [ ] Set `STRIPE_API_KEY` in `.env`
- [ ] Test escrow creation (check Stripe dashboard)
- [ ] Verify manual capture mode works
- [ ] Test refund workflow

### MeiliSearch

- [ ] Access dashboard at http://localhost:7700
- [ ] Verify indexes created: `products`, `partners`
- [ ] Test search API endpoints
- [ ] Check filtering and sorting

---

**Last Updated**: November 9, 2025
**Services**: MinIO, Stripe, MeiliSearch
**Status**: All integrations configured ✅
