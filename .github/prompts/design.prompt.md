---
mode: agent
---

# Design Document

## Overview

The B2B marketplace platform will be built as a full-stack application using Medusa.js as the backend commerce engine and Next.js as the frontend framework. The architecture follows a headless commerce approach where Medusa.js provides the API layer for commerce operations, user management, and data persistence, while Next.js handles the presentation layer with server-side rendering for optimal SEO and performance.

The platform supports three distinct user roles (Sellers, Buyers, Administrators) with role-based access control. The system emphasizes trust and security through profile verification, escrow payments, and shipment tracking integrations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Seller Pages │  │ Buyer Pages  │  │ Admin Pages  │     │
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
│  │              Custom Services Layer                    │  │
│  │  • VerificationService  • EscrowService              │  │
│  │  • PartnerSearchService • ShipmentTrackingService    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Medusa Services                     │  │
│  │  • ProductService  • OrderService  • CustomerService │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Database Layer                       │  │
│  │              PostgreSQL with TypeORM                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    External Integrations
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────────┐         ┌──────────┐       ┌──────────┐
   │Payment │         │Shipping  │       │File      │
   │Gateway │         │Carriers  │       │Storage   │
   └────────┘         └──────────┘       └──────────┘
```

### Technology Stack Details

- **Backend**: Medusa.js v2.x with Node.js
- **Frontend**: Next.js 14+ with App Router
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM (Medusa default)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Authentication**: Medusa Auth with JWT
- **File Storage**: S3-compatible storage (AWS S3 or MinIO)
- **Payment Processing**: Stripe or similar payment gateway
- **Caching**: Redis for session management and caching

## Components and Interfaces

### Backend Components (Medusa.js)

#### 1. Custom Data Models

**Seller Profile Extension**

```typescript
// Extends Medusa Customer entity
{
  id: string
  user_id: string // Reference to Medusa User
  company_name: string
  business_type: string
  description: string
  location: {
    country: string
    city: string
    address: string
  }
  certifications: string[] // URLs to certification documents
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents: string[] // URLs to verification docs
  is_seller: boolean
  created_at: Date
  updated_at: Date
}
```

**Buyer Profile Extension**

```typescript
// Extends Medusa Customer entity
{
  id: string
  user_id: string // Reference to Medusa User
  company_name: string
  business_interests: string[]
  business_needs: string
  location: {
    country: string
    city: string
    address: string
  }
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents: string[] // URLs to verification docs
  is_buyer: boolean
  created_at: Date
  updated_at: Date
}
```

**Partner Directory Profile**

```typescript
{
  id: string
  user_id: string
  profile_type: 'seller' | 'buyer'
  company_name: string
  country: string
  industry: string[]
  looking_for: ('suppliers' | 'buyers' | 'distributors')[]
  offers: ('manufacturing' | 'wholesale' | 'distribution')[]
  is_verified: boolean
  created_at: Date
  updated_at: Date
}
```

**Escrow Transaction**

```typescript
{
  id: string;
  order_id: string; // Reference to Medusa Order
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  status: "held" | "released" | "disputed" | "refunded";
  payment_intent_id: string; // Payment gateway reference
  held_at: Date;
  released_at: Date | null;
  dispute_reason: string | null;
  created_at: Date;
  updated_at: Date;
}
```

**Shipment Tracking**

```typescript
{
  id: string;
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: "pending" | "in_transit" | "delivered" | "failed";
  current_location: string | null;
  estimated_delivery: Date | null;
  last_updated: Date;
  tracking_events: {
    timestamp: Date;
    status: string;
    location: string;
    description: string;
  }
  [];
  created_at: Date;
  updated_at: Date;
}
```

#### 2. Custom Services

**VerificationService**

- `submitVerification(userId, documents)`: Submit verification documents
- `approveVerification(userId, adminId)`: Approve a verification request
- `rejectVerification(userId, adminId, reason)`: Reject with reason
- `getVerificationStatus(userId)`: Get current verification status
- `listPendingVerifications()`: List all pending verifications for admin

**EscrowService**

- `createEscrow(orderId, amount)`: Create escrow transaction when order is accepted
- `releaseEscrow(orderId, buyerId)`: Release funds to seller on delivery confirmation
- `disputeEscrow(orderId, reason)`: Flag escrow for dispute resolution
- `refundEscrow(orderId, adminId)`: Refund to buyer (admin action)
- `getEscrowStatus(orderId)`: Get escrow transaction status

**PartnerSearchService**

- `searchPartners(filters)`: Search partner directory with filters
- `createPartnerProfile(userId, profileData)`: Create partner directory entry
- `updatePartnerProfile(userId, profileData)`: Update partner profile
- `getPartnerProfile(userId)`: Retrieve partner profile details

**ShipmentTrackingService**

- `addTracking(orderId, carrier, trackingNumber)`: Add tracking to order
- `updateTrackingStatus(orderId)`: Fetch and update tracking from carrier API
- `getTrackingDetails(orderId)`: Get current tracking information
- `subscribeToTrackingUpdates(orderId)`: Set up automatic tracking updates

#### 3. Custom API Endpoints

**Verification Endpoints**

- `POST /admin/verifications/:id/approve`: Approve verification
- `POST /admin/verifications/:id/reject`: Reject verification
- `GET /admin/verifications`: List pending verifications
- `POST /store/verification/submit`: Submit verification documents
- `GET /store/verification/status`: Get own verification status

**Escrow Endpoints**

- `POST /store/orders/:id/escrow/release`: Buyer confirms delivery
- `POST /store/orders/:id/escrow/dispute`: Flag dispute
- `GET /store/orders/:id/escrow`: Get escrow status
- `POST /admin/escrow/:id/refund`: Admin refund action

**Partner Directory Endpoints**

- `GET /store/partners/search`: Search partner directory
- `POST /store/partners/profile`: Create/update partner profile
- `GET /store/partners/:id`: Get partner profile details

**Shipment Tracking Endpoints**

- `POST /store/orders/:id/tracking`: Add tracking information
- `GET /store/orders/:id/tracking`: Get tracking details
- `PUT /store/orders/:id/tracking/refresh`: Manually refresh tracking

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

The platform extends Medusa's core schema with custom tables:

**seller_profiles**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: user_id, verification_status, location.country

**buyer_profiles**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: user_id, verification_status, location.country

**partner_directory**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Indexes: country, industry (GIN), is_verified
- Full-text search: company_name

**escrow_transactions**

- Primary key: id (uuid)
- Foreign key: order_id → orders.id
- Indexes: order_id (unique), buyer_id, seller_id, status

**shipment_tracking**

- Primary key: id (uuid)
- Foreign key: order_id → orders.id
- Indexes: order_id (unique), tracking_number, status

**verification_documents**

- Primary key: id (uuid)
- Foreign key: user_id → users.id
- Stores document URLs and verification metadata

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
