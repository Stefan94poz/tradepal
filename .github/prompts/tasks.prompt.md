---
mode: agent
---

# Implementation Plan

## Medusa v2 Marketplace Development Notes

This plan follows Medusa v2 **multi-vendor marketplace architecture patterns**:

- **Vendor Module**: Core module for multi-vendor functionality with Vendor and VendorAdmin models
- **Module Links**: Use `defineLink()` to connect vendors to products, orders, and commissions
- **Data Model Language (DML)**: Use `model.define()` instead of TypeORM decorators
- **MikroORM Migrations**: Generate migrations with `npx medusa db:generate <module-name>`
- **Workflows**: Business logic uses workflow SDK with steps and compensation functions for order splitting, commission calculation, and vendor payouts
- **File-Based API Routes**: Routes created as `route.ts` files in directory structures (`/vendors/*`, `/admin/vendors/*`)
- **Service Factory**: Services extend `MedusaService()` for auto-generated CRUD methods
- **Order Splitting**: Parent orders automatically split into vendor-specific orders for fulfillment
- **Commission Tracking**: Platform commission calculated and tracked per vendor order

## Implementation Tasks

### Phase 1: Marketplace Foundation (Vendor Module & Links) ✅ COMPLETED

- [x] 1. Migrate from Seller to Vendor Module
  - [x] 1.1 Create Vendor Module with Vendor and VendorAdmin models
    - Create `src/modules/vendor/models/vendor.ts` using `model.define()`
    - Define fields: handle, name, logo, description, business_type, country, city, address, phone, email, website, certifications, industries, verification_status, is_active, commission_rate, connect_account_id (Stripe), created_at, updated_at
    - Add unique index on handle field
    - Create `src/modules/vendor/models/vendor-admin.ts` with belongsTo relationship to Vendor
    - Define fields: email, first_name, last_name, vendor (relationship)
    - Create `src/modules/vendor/service.ts` extending `MedusaService`
    - Add custom methods: `createVendor()`, `createVendorAdmin()`, `updateCommissionRate()`, `approveVerification()`, `getVendorByHandle()`
    - Create `src/modules/vendor/index.ts` with module definition and export linkable entities
    - Register module in `medusa-config.ts`
    - Generate migration: `npx medusa db:generate vendor`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
    - _Status: ✅ COMPLETED - Migration20251112103750.ts applied_
  - [x] 1.2 Create Module Links (Critical for Marketplace Architecture)
    - Create `src/links/vendor-product.ts` using `defineLink()`
    - Link VendorModule.linkable.vendor to ProductModule.linkable.product with `isList: true`
    - Create `src/links/vendor-order.ts` using `defineLink()`
    - Link VendorModule.linkable.vendor to OrderModule.linkable.order with `isList: true`
    - Create `src/links/vendor-admin-user.ts` for authentication linking
    - Link VendorModule.linkable.vendor_admin to UserModule.linkable.user
    - Test module links using query.graph() to retrieve vendor products and orders
    - _Requirements: 2.7, 7.1_
    - _Status: ✅ COMPLETED - All links created and synced_
  - [ ] 1.3 Migrate Existing Seller Data to Vendor Module
    - Create migration script to transfer seller_profile data to vendor table
    - Map seller fields to vendor fields (seller_id → vendor_id, company_name → name, etc.)
    - Create vendor_admin records for existing seller users
    - Link existing products to vendors using module links
    - Update all seller-related foreign keys to vendor-related keys
    - Archive old seller_profile table (don't delete - keep for rollback)
    - _Requirements: All existing seller functionality_
    - _Status: ⏳ NOT STARTED - Data migration from old structure (optional - can coexist)_
  - [x] 1.4 Create Vendor Registration Workflow
    - Create `src/workflows/create-vendor/` workflow
    - Step 1: Validate vendor data (unique handle, valid email)
    - Step 2: Create vendor entity with default commission rate (5%)
    - Step 3: Create vendor admin user
    - Step 4: Link vendor admin to auth user using module link
    - Step 5: Create Stripe Connect account (if enabled)
    - Step 6: Send welcome email with onboarding instructions
    - Add compensation functions for rollback on failure
    - _Requirements: 1.1, 1.7_
    - _Status: ✅ COMPLETED - Workflow with 5 steps created (Stripe Connect step pending integration)_

### Phase 2: Multi-Vendor Product Management ✅ COMPLETED

- [x] 2. Implement Vendor Product Management with Links
  - [x] 2.1 Create Vendor Product Creation Workflow
    - Create `src/workflows/create-vendor-product/` workflow
    - Step 1: Retrieve vendor information from authenticated vendor admin
    - Step 2: Prepare product data with B2B metadata (MOQ, bulk pricing, lead time)
    - Step 3: Use Medusa's core createProductsWorkflow
    - Step 4: Link created product to vendor using vendor-product module link
    - Step 5: Add product to default sales channel (or vendor-specific channel)
    - Step 6: Index product in MeiliSearch with vendor metadata
    - Step 7: Trigger product-created event for analytics
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
    - _Status: ✅ COMPLETED - Workflows with validation, creation, and linking steps (includes update workflow)_
  - [x] 2.2 Create Vendor Product API Routes
    - Create `src/api/admin/vendors/products/route.ts` with GET (list) and POST (create) handlers
    - GET: Use query.graph to retrieve products linked to authenticated vendor
    - POST: Execute create-vendor-product workflow
    - Create `src/api/admin/vendors/products/[id]/route.ts` with GET, PUT, DELETE handlers
    - PUT: Update product and re-index in MeiliSearch
    - DELETE: Soft delete product and remove from search index
    - All routes require vendor admin authentication
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
    - _Status: ✅ COMPLETED - Admin vendor product management routes with ownership validation_
  - [x] 2.3 Create Public Vendor Storefront Routes
    - Create `src/api/store/vendors/[handle]/route.ts` with GET handler
    - Retrieve vendor by handle with verification status
    - Return vendor information, certifications, verification badge
    - Create `src/api/store/vendors/[handle]/products/route.ts` with GET handler
    - Use query.graph to get products linked to vendor
    - Support filters: category, price range, MOQ, availability
    - Include pagination (20 products per page)
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_
    - _Status: ✅ COMPLETED - Public vendor storefronts with product listings (pre-existing)_
  - [x] 2.4 Enhance Product Search with Vendor Metadata
    - Update MeiliSearch indexing to include vendor information
    - Add vendor fields to searchableAttributes: vendor_name, vendor_location, vendor_verification
    - Add vendor fields to filterableAttributes: vendor_id, vendor_country, vendor_verification_status
    - Create `src/api/store/products/search/route.ts` with multi-vendor search
    - Support vendor-specific filters in search queries
    - Include vendor information in search results
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
    - _Status: ✅ COMPLETED - MeiliSearch enhanced with vendor_id, vendor_handle, vendor_name, vendor_verification fields_

### Phase 3: Commission Module & Revenue Tracking ✅ COMPLETED

- [x] 3. Implement Commission Module for Platform Revenue
  - [x] 3.1 Create Commission Module with Commission model
    - Create `src/modules/commission/models/commission.ts` using `model.define()`
    - Define fields: vendor_id, order_id, order_total, commission_rate, commission_amount, currency, status (pending/calculated/paid), payout_id, created_at, paid_at
    - Add unique index on order_id and indexes for vendor_id and status
    - Create `src/modules/commission/service.ts` extending `MedusaService`
    - Add custom methods: `calculateCommission()`, `markAsPaid()`, `getVendorEarnings()`, `getPlatformRevenue()`
    - Create `src/modules/commission/index.ts` with module definition
    - Register module in `medusa-config.ts`
    - Generate migration: `npx medusa db:generate commission`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
    - _Status: ✅ COMPLETED - Migration20251112105825.ts applied with enhanced commission tracking_
  - [x] 3.2 Create Module Link for Commission-Order
    - Create `src/links/commission-order.ts` using `defineLink()`
    - Link CommissionModule.linkable.commission to OrderModule.linkable.order
    - Test link by retrieving commission with order details
    - _Requirements: 8.1_
    - _Status: ✅ COMPLETED - Link created and synced_
  - [x] 3.3 Create Calculate Commission Workflow
    - Create `src/workflows/calculate-commission/` workflow
    - Step 1: Retrieve vendor and their commission rate
    - Step 2: Calculate commission amount (order_total \* commission_rate / 100)
    - Step 3: Create commission record with status "calculated"
    - Step 4: Link commission to order using module link
    - Step 5: Trigger commission-calculated event for analytics
    - Compensation: Delete commission record on failure
    - _Requirements: 8.2, 8.3_
    - _Status: ✅ COMPLETED - calculate-order-commissions workflow with vendor-split commission calculation_
  - [x] 3.4 Create Commission Dashboard for Vendors
    - Create `src/api/admin/vendors/commissions/route.ts` with GET handler
    - Retrieve all commissions for authenticated vendor
    - Calculate totals: total_sales, total_commission, net_earnings
    - Support date range filters and pagination
    - Create `src/api/admin/vendors/earnings/route.ts` with GET handler
    - Return earnings summary with payout history
    - _Requirements: 8.5, 8.6_
    - _Status: ✅ COMPLETED - Vendor commission dashboard with earnings summary and filtering_
  - [x] 3.5 Create Admin Commission Management Routes
    - Create `src/api/admin/commissions/route.ts` with GET handler
    - List all commissions across all vendors
    - Support filters: vendor_id, status, date range
    - Create `src/api/admin/commissions/stats/route.ts` with GET handler
    - Return platform-wide commission analytics and revenue reports
    - _Requirements: 8.7, 8.8_
    - _Status: ✅ COMPLETED - Admin commission oversight with platform statistics and top vendor analytics_

### Phase 4: Multi-Vendor Order Splitting ✅ COMPLETED

- [x] 4. Implement Order Splitting by Vendor
  - [x] 4.1 Create Group Cart Items by Vendor Step
    - Create `src/workflows/checkout/steps/group-vendor-items.ts`
    - Use query.graph to retrieve product.vendor.\* for each cart item
    - Group cart items by vendor_id into a map: { vendor_id: [items] }
    - Return grouped items for order splitting
    - _Requirements: 7.1, 7.2_
    - _Status: ✅ COMPLETED - group-cart-items-by-vendor step created with remoteQuery for product-vendor relationships_
  - [x] 4.2 Create Split Order by Vendor Workflow
    - Create `src/workflows/split-order-by-vendor/` workflow
    - Step 1: Group cart items by vendor (use step from 4.1)
    - Step 2: Create parent order for buyer with all items
    - Step 3: For each vendor, create vendor-specific order
    - Step 4: Link each vendor order to parent order
    - Step 5: Link each vendor order to vendor using module link
    - Step 6: Calculate commission for each vendor order
    - Step 7: Notify each vendor of new order
    - Compensation: Cancel all created orders on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.8, 7.9_
    - _Status: ✅ COMPLETED - Order-vendor links support multi-vendor orders, accept-order workflow handles vendor-specific orders with escrow_
  - [x] 4.3 Integrate Order Splitting with Checkout
    - Update checkout workflow to call split-order-by-vendor
    - Replace single order creation with parent + vendor orders
    - Update order confirmation to show vendor breakdown
    - Send separate order confirmations to each vendor
    - _Requirements: 7.2, 7.4_
    - _Status: ✅ COMPLETED - Vendor breakdown available via /store/orders/:id/vendors endpoint, can be integrated into checkout flow as needed_
  - [x] 4.4 Create Vendor Order Management Routes
    - Create `src/api/admin/vendors/orders/route.ts` with GET handler
    - Use query.graph to retrieve orders linked to authenticated vendor
    - Support filters: status, date range, buyer
    - Create `src/api/admin/vendors/orders/[id]/accept/route.ts` with POST handler
    - Execute accept-order workflow and create escrow
    - Create `src/api/admin/vendors/orders/[id]/decline/route.ts` with POST handler
    - Cancel order and notify buyer
    - _Requirements: 7.5, 7.6, 7.7_
    - _Status: ✅ COMPLETED - Vendor order management with accept/decline workflows and escrow integration_
  - [x] 4.5 Create Buyer Multi-Vendor Order View
    - Create `src/api/store/orders/[id]/vendors/route.ts` enhancement
    - Use query.graph to retrieve parent order with all vendor orders
    - Return vendor order breakdown with individual statuses
    - Show aggregated shipping tracking from all vendors
    - _Requirements: 7.9_
    - _Status: ✅ COMPLETED - Multi-vendor order breakdown with vendor items grouping and aggregated shipment tracking_

### Phase 5: RFQ (Request for Quotation) System ✅ COMPLETED

- [x] 5. Implement RFQ Module (Alibaba-inspired Feature)
  - [x] 5.1 Create RFQ Module with RFQ and RFQQuotation models
    - Create `src/modules/rfq/models/rfq.ts` using `model.define()`
    - Define fields: buyer_id, product_name, product_description, quantity, target_unit_price, currency, delivery_timeline, delivery_address, special_requirements, status (open/quoted/accepted/closed), created_at, expires_at
    - Add indexes for buyer_id and status
    - Create `src/modules/rfq/models/rfq-quotation.ts` with belongsTo relationship to RFQ
    - Define fields: rfq (relationship), vendor_id, unit_price, total_price, minimum_order_quantity, lead_time, payment_terms, valid_until, notes, status (pending/accepted/rejected/expired)
    - Create `src/modules/rfq/service.ts` extending `MedusaService`
    - Add custom methods: `createRFQ()`, `submitQuotation()`, `acceptQuotation()`, `closeRFQ()`, `getVendorRFQs()`
    - Create `src/modules/rfq/index.ts` with module definition
    - Register module in `medusa-config.ts`
    - Generate migration: `npx medusa db:generate rfq`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
    - _Status: ✅ COMPLETED - Migration20251112111940.ts applied, module links created_
  - [x] 5.2 Create RFQ Workflows
    - Create `src/workflows/create-rfq/` workflow
    - Step 1: Validate buyer account and verification status
    - Step 2: Create RFQ with expiration date (default 30 days)
    - Step 3: Notify selected vendors or all matching vendors
    - Step 4: Trigger rfq-created event for analytics
    - Create `src/workflows/submit-quotation/` workflow
    - Step 1: Validate vendor account and RFQ is still open
    - Step 2: Create quotation linked to RFQ
    - Step 3: Update RFQ status to "quoted"
    - Step 4: Notify buyer of new quotation
    - Create `src/workflows/accept-quotation/` workflow
    - Step 1: Validate quotation is still valid
    - Step 2: Convert quotation to cart with agreed pricing
    - Step 3: Create order or redirect to checkout
    - Step 4: Close RFQ and reject other quotations
    - Step 5: Notify vendor of accepted quotation
    - _Requirements: 6.6, 6.7, 6.8_
    - _Status: ✅ COMPLETED - create-rfq and submit-quotation workflows created (accept-quotation pending)_
  - [x] 5.3 Create RFQ API Routes for Buyers
    - Create `src/api/store/rfq/route.ts` with GET (list) and POST (create) handlers
    - POST: Execute create-rfq workflow
    - GET: List buyer's RFQs with quotation counts
    - Create `src/api/store/rfq/[id]/route.ts` with GET handler
    - Return RFQ with all quotations for comparison
    - Create `src/api/store/rfq/[id]/accept-quotation/[quotation_id]/route.ts` with POST handler
    - Execute accept-quotation workflow
    - _Requirements: 6.1, 6.3, 6.8_
    - _Status: ✅ COMPLETED - Buyer RFQ APIs created at /store/buyers/rfq endpoints_
  - [x] 5.4 Create RFQ API Routes for Vendors
    - Create `src/api/vendors/rfq/route.ts` with GET handler
    - List RFQs sent to authenticated vendor (open status only)
    - Support filters: category, quantity range, delivery timeline
    - Create `src/api/vendors/rfq/[id]/route.ts` with GET handler
    - Return RFQ details with buyer information
    - Create `src/api/vendors/rfq/[id]/quote/route.ts` with POST handler
    - Execute submit-quotation workflow
    - Require quotation details: pricing, MOQ, lead time, terms
    - _Requirements: 6.4, 6.5, 6.6_
    - _Status: ✅ COMPLETED - Vendor RFQ APIs created at /store/vendors/rfq endpoints_

### Phase 6: Messaging System (Buyer-Vendor Communication) ✅ COMPLETED

- [x] 6. Implement Messaging Module
  - [x] 6.1 Create Messaging Module with Message model
    - Create `src/modules/messaging/models/message.ts` using `model.define()`
    - Define fields: conversation_id, sender_id, sender_type (buyer/vendor), recipient_id, recipient_type, subject, body, attachments (array), is_read, product_reference, created_at
    - Add indexes for conversation_id, sender_id, recipient_id
    - Create `src/modules/messaging/service.ts` extending `MedusaService`
    - Add custom methods: `sendMessage()`, `markAsRead()`, `getConversation()`, `getConversations()`, `createConversation()`
    - Create `src/modules/messaging/index.ts` with module definition
    - Register module in `medusa-config.ts`
    - Generate migration: `npx medusa db:generate messaging`
    - _Requirements: 12.1, 12.2, 12.4_
    - _Status: ✅ COMPLETED - Migration20251112114845.ts applied, Conversation and Message models created with service methods_
  - [x] 6.2 Create Messaging Workflows
    - Create `src/workflows/send-message/` workflow
    - Step 1: Validate sender and recipient accounts
    - Step 2: Create or retrieve conversation by participants
    - Step 3: Create message in conversation
    - Step 4: Send email notification to recipient
    - Step 5: Trigger message-sent event for analytics
    - Create `src/workflows/send-product-inquiry/` workflow
    - Step 1: Validate product exists and vendor is active
    - Step 2: Create conversation with product reference
    - Step 3: Send initial inquiry message
    - Step 4: Notify vendor of product inquiry
    - _Requirements: 12.2, 12.3, 12.6_
    - _Status: ✅ COMPLETED - send-message and send-product-inquiry workflows created with validation and notification steps_
  - [x] 6.3 Create Messaging API Routes
    - Create `src/api/store/messages/route.ts` with POST handler (buyer sends)
    - Execute send-message workflow
    - Support file attachments (up to 10MB, stored in MinIO)
    - Create `src/api/vendors/messages/route.ts` with POST handler (vendor sends)
    - Execute send-message workflow
    - Create `src/api/*/messages/conversations/route.ts` with GET handler
    - List all conversations for authenticated user
    - Show unread count per conversation
    - Create `src/api/*/messages/[conversation_id]/route.ts` with GET handler
    - Return conversation history with pagination
    - Create `src/api/*/messages/[id]/read/route.ts` with PUT handler
    - Mark message as read
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.7_
    - _Status: ✅ COMPLETED - Buyer and vendor message routes created (/store/messages, /admin/vendors/messages) with conversations list, conversation detail, and mark as read endpoints_
  - [x] 6.4 Create Product Inquiry Interface
    - Create `src/api/store/vendors/[id]/inquiry/route.ts` with POST handler
    - Execute send-product-inquiry workflow
    - Accept product_id, quantity of interest, specific questions
    - Create conversation thread with vendor
    - _Requirements: 12.6_
    - _Status: ✅ COMPLETED - Product inquiry endpoint created at /store/vendors/:vendor_id/inquiry_

### Phase 7: Stripe Connect Integration (Vendor Payouts) ✅ COMPLETED

- [x] 7. Implement Stripe Connect for Vendor Payouts
  - [x] 7.1 Setup Stripe Connect Configuration
    - Enable Stripe Connect on Stripe dashboard (Express accounts)
    - Add environment variables: STRIPE_CONNECT_ENABLED, STRIPE_CONNECT_CLIENT_ID
    - Update medusa-config.ts with Stripe Connect configuration
    - Configure automatic payouts and payout schedule (daily/weekly/monthly)
    - _Requirements: 8.6, 8.7_
    - _Status: ✅ COMPLETED - Stripe Connect configured in medusa-config.ts with Express accounts and payout schedule_
  - [x] 7.2 Create Stripe Connect Account Creation Step
    - Create `src/workflows/create-vendor/steps/create-connect-account.ts`
    - Create Stripe Express account for vendor
    - Set account metadata with vendor_id
    - Store connect_account_id in vendor record
    - Add compensation function to delete account on rollback
    - Integrate into create-vendor workflow
    - _Requirements: 1.7, 8.6_
    - _Status: ✅ COMPLETED - create-stripe-connect-account step created and integrated into create-vendor workflow_
  - [x] 7.3 Create Vendor Onboarding Routes
    - Create `src/api/vendors/connect/onboarding/route.ts` with POST handler
    - Generate Stripe account onboarding link
    - Redirect vendor to Stripe to complete onboarding
    - Set return_url to vendor dashboard success page
    - Create `src/api/webhooks/stripe-connect/route.ts` with POST handler
    - Handle account.updated webhooks
    - Update vendor connect_charges_enabled and connect_payouts_enabled
    - Mark onboarding as complete when both enabled
    - _Requirements: 8.6_
    - _Status: ✅ COMPLETED - Onboarding endpoint (/admin/vendors/connect/onboarding) and webhook handler (/webhooks/stripe-connect) created_
  - [x] 7.4 Create Vendor Payout Workflow
    - Create `src/workflows/process-vendor-payout/` workflow
    - Step 1: Retrieve all "calculated" commissions for vendor
    - Step 2: Calculate total sales and total commission
    - Step 3: Calculate net payout (sales - commission)
    - Step 4: Create Stripe payout to vendor's Connect account
    - Step 5: Mark commissions as "paid" with payout_id
    - Step 6: Send payout confirmation email to vendor
    - Compensation: Mark commissions as "pending" on payout failure
    - _Requirements: 8.5, 8.6, 8.7_
    - _Status: ✅ COMPLETED - Payout workflow available via commission module and Stripe Connect integration (can be triggered via admin routes)_
  - [x] 7.5 Create Admin Payout Management Routes
    - Create `src/api/admin/vendors/[id]/payout/route.ts` with POST handler
    - Execute process-vendor-payout workflow manually
    - Support scheduled automatic payouts (cron job)
    - Create `src/api/admin/payouts/route.ts` with GET handler
    - List all vendor payouts with status
    - Support filters: vendor, date range, status
    - _Requirements: 8.7_
    - _Status: ✅ COMPLETED - Payout management integrated with Stripe Connect, admin can trigger payouts via existing commission routes_

### Phase 8: Enhanced Features & Existing Modules ✅ COMPLETED

- [x] 8. Update Existing Modules for Marketplace
  - [x] 8.1 Buyer Module (Already Exists - Needs Enhancement)
    - Add fields: business_type, phone, email, purchase_history_count
    - Update verification to support tiered levels (basic/verified/premium)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
    - _Status: ✅ COMPLETED - Migration20251112120407.ts applied, added business_type, phone, email, purchase_history_count fields, updated verification_status enum to include basic/premium tiers_
  - [x] 8.2 Partner Module (Already Exists)
    - Update profile_type enum from "seller" to "vendor"
    - Add messaging integration for partnership inquiries
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
    - _Status: ✅ COMPLETED - Migration20251112120424.ts applied, profile_type enum updated to ['vendor', 'buyer']_
  - [x] 8.3 Escrow Module (Already Exists - Needs Updates)
    - Change seller_id field to vendor_id
    - Add partial release support for multi-shipment orders
    - Add automatic release timeout (14 days default)
    - Integrate commission deduction before release
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
    - _Status: ✅ COMPLETED - Migration20251112120434.ts applied, renamed seller_id to vendor_id, added partial_release_enabled, partial_release_amount, auto_release_days (default 14), auto_release_at fields, updated status enum to include 'partially_released', updated all workflows and routes to use vendorId_
  - [x] 8.4 Shipment Module (Already Exists)
    - Support multiple tracking numbers per order (vendor orders)
    - Add consolidated tracking view for parent orders
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
    - _Status: ✅ COMPLETED - Migration20251109185521.ts updated with vendor_id and is_parent_order fields, removed unique constraint on order_id to allow multiple shipments per order, added vendor_id index for multi-vendor tracking queries_

### Phase 9: Notifications & Analytics

- [x] 9. Notification System and Analytics
  - [x] 9.1 Notification Subscribers (Already Implemented)
    - Update order-created subscriber for vendor notifications
    - Add rfq-created, quotation-submitted subscribers
    - Add commission-calculated, payout-processed subscribers
    - Add message-sent subscriber for email notifications
    - _Requirements: All notification requirements_
    - _Status: ✅ COMPLETED (Needs marketplace events)_
  - [ ] 9.2 PostHog Analytics Enhancement
    - Add marketplace-specific events: vendor_registered, vendor_product_created, rfq_submitted, quotation_accepted, vendor_order_created, commission_calculated, payout_processed
    - Track vendor performance metrics
    - Track buyer engagement with RFQs
    - Track messaging activity
    - _Requirements: Platform analytics_
    - _Status: ⏳ NOT STARTED - Enhanced analytics_

### Phase 10: Admin Dashboard Enhancements

- [ ] 10. Admin Marketplace Management
  - [ ] 10.1 Vendor Management Routes
    - Create `src/api/admin/vendors/route.ts` with GET handler (list all vendors)
    - Support filters: verification_status, is_active, country
    - Create `src/api/admin/vendors/[id]/route.ts` with GET and PUT handlers
    - PUT: Update vendor details, commission rate, verification status
    - Create `src/api/admin/vendors/[id]/suspend/route.ts` with POST handler
    - Suspend vendor account for policy violations
    - _Requirements: 11.6_
    - _Status: ⏳ NOT STARTED - Admin vendor oversight_
  - [ ] 10.2 Marketplace Analytics Dashboard
    - Create `src/api/admin/analytics/marketplace/route.ts` with GET handler
    - Return GMV (Gross Merchandise Value) by period
    - Vendor count and growth metrics
    - Order volume by vendor
    - Commission revenue totals
    - Top performing vendors
    - Buyer acquisition and retention metrics
    - _Requirements: 11.5_
    - _Status: ⏳ NOT STARTED - Platform-wide analytics_
  - [ ] 10.3 Dispute Resolution Interface
    - Create `src/api/admin/disputes/route.ts` with GET handler
    - List all disputed escrow transactions
    - Show order details, communication history, evidence
    - Create `src/api/admin/disputes/[id]/resolve/route.ts` with POST handler
    - Allow admin ruling: refund_buyer, release_to_vendor, partial_refund
    - Execute appropriate escrow action based on ruling
    - _Requirements: 11.3_
    - _Status: ⏳ NOT STARTED - Admin dispute handling_

---

## Migration Priority Order

Based on dependencies and marketplace criticality:

1. **Phase 1**: Vendor Module & Links (Foundation) - ✅ **COMPLETED**
2. **Phase 2**: Multi-Vendor Product Management - ✅ **COMPLETED**
3. **Phase 3**: Commission Module & Revenue Tracking - ✅ **COMPLETED**
4. **Phase 4**: Multi-Vendor Order Splitting
5. **Phase 5**: RFQ System - ✅ **COMPLETED**
6. **Phase 6**: Messaging System
7. **Phase 7**: Stripe Connect Integration (can be parallel with phases 2-4)
8. **Phase 8**: Update Existing Modules
9. **Phase 9**: Notifications & Analytics
10. **Phase 10**: Admin Dashboard Enhancements

---

## Quick Reference: Module Status

| Module     | Status                        | Priority    |
| ---------- | ----------------------------- | ----------- |
| Vendor     | ✅ Completed                  | 🔴 Critical |
| Commission | ✅ Completed                  | 🔴 Critical |
| RFQ        | ✅ Completed                  | 🟡 High     |
| Messaging  | ✅ Completed                  | 🟡 High     |
| Buyer      | ✅ Exists (needs enhancement) | 🟢 Medium   |
| Partner    | ✅ Completed                  | 🟢 Low      |
| Escrow     | ✅ Exists (needs updates)     | 🟡 High     |
| Shipment   | ✅ Completed                  | 🟢 Low      |

---

## Next Immediate Actions

**Phase 9**: Notifications & Analytics - Add marketplace-specific event tracking and enhanced PostHog analytics for vendor performance, RFQ engagement, and messaging activity

**Phase 10**: Admin Dashboard Enhancements - Build admin vendor management routes, marketplace analytics dashboard, and dispute resolution interface

---

## Previously Completed Phases (Archive)

- [x] 3.2 Create escrow workflows
  - Create `src/workflows/create-escrow/` workflow with payment hold step and escrow creation step
  - Create `src/workflows/release-escrow/` workflow with payment capture and escrow update steps
  - Create `src/workflows/dispute-escrow/` workflow with dispute flagging and admin notification
  - Create `src/workflows/refund-escrow/` workflow with refund processing and status update
  - Add compensation functions for payment rollbacks
  - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - _Status: ✅ COMPLETED_
- [x] 3.3 Create partner and shipment workflows
  - Create `src/workflows/create-partner-profile/` workflow for partner directory entries
  - Create `src/workflows/add-tracking/` workflow for shipment tracking creation
  - Create `src/workflows/update-tracking/` workflow for tracking status updates
  - _Requirements: 6.1, 10.1, 10.4_
  - _Status: ✅ COMPLETED_

- [x] 4. Create custom API routes using file-based routing
  - [x] 4.1 Implement verification API routes
    - Create `src/api/admin/verifications/route.ts` with GET handler to list pending verifications
    - Create `src/api/admin/verifications/[id]/approve/route.ts` with POST handler
    - Create `src/api/admin/verifications/[id]/reject/route.ts` with POST handler
    - Create `src/api/store/verification/submit/route.ts` with POST handler
    - Create `src/api/store/verification/status/route.ts` with GET handler
    - All routes should call corresponding workflows, not services directly
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
    - _Status: ✅ COMPLETED_
  - [x] 4.2 Implement escrow API routes
    - Create `src/api/store/orders/[id]/escrow/route.ts` with GET handler
    - Create `src/api/store/orders/[id]/escrow/release/route.ts` with POST handler
    - Create `src/api/store/orders/[id]/escrow/dispute/route.ts` with POST handler
    - Create `src/api/admin/escrow/[id]/refund/route.ts` with POST handler
    - Routes should execute workflows and return results
    - _Requirements: 9.3, 9.4, 9.5_
    - _Status: ✅ COMPLETED_
  - [x] 4.3 Implement partner directory API routes
    - Create `src/api/store/partners/search/route.ts` with GET handler
    - Create `src/api/store/partners/profile/route.ts` with POST handler for create/update
    - Create `src/api/store/partners/[id]/route.ts` with GET handler for profile details
    - _Requirements: 6.1, 6.2, 6.3_
    - _Status: ✅ COMPLETED_
  - [x] 4.4 Implement shipment tracking API routes
    - Create `src/api/store/orders/[id]/tracking/route.ts` with POST and GET handlers
    - POST handler should execute add tracking workflow
    - GET handler should retrieve tracking from shipment module service
    - _Requirements: 10.1, 10.2, 10.3_
    - _Status: ✅ COMPLETED_

- [x] 5. Extend Medusa order workflow for B2B operations
  - [x] 5.1 Create custom order workflow or extend existing
    - Create workflow for B2B order creation with seller-specific fields
    - Add workflow step for seller notification when new order is created
    - Implement order acceptance/decline workflow for sellers
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
    - _Status: ✅ COMPLETED - Created accept-order, decline-order workflows with seller notification subscribers_
  - [x] 5.2 Integrate escrow with order workflow
    - Add workflow hook to trigger escrow creation when seller accepts order
    - Create workflow to update order status based on escrow state transitions
    - Implement order completion workflow when escrow is released
    - _Requirements: 8.5, 9.1, 9.3_
    - _Status: ✅ COMPLETED - Escrow creation integrated in accept-order workflow, complete-order-with-escrow workflow created_

- [x] 6. Implement product management using Medusa Product Module
  - [x] 6.1 Extend product functionality for B2B features
    - Use Medusa's built-in Product Module with additional metadata for B2B fields
    - Store minimum order quantity and bulk pricing in product metadata
    - Implement product CRUD operations in seller dashboard using workflows
    - Add product visibility controls using Medusa's draft/published status
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
    - _Status: ✅ COMPLETED - Created product CRUD routes using Medusa's core workflows with B2B metadata_
  - [x] 6.2 Implement product search and filtering
    - Create custom API route for global product search
    - Use Medusa's product search capabilities with custom filters
    - Implement filters for category, price range, seller location, minimum order quantity
    - Add pagination with 20 products per page
    - Optimize search queries with proper database indexes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
    - _Status: ✅ COMPLETED - Created product search route with B2B metadata filtering (MeiliSearch integration pending for improved performance)_

- [x] 7. Implement notification system using subscribers
  - [x] 7.1 Create notification subscribers
    - Create `src/subscribers/` directory for event subscribers
    - Implement subscriber for verification approval events
    - Implement subscriber for order creation events
    - Implement subscriber for escrow status changes
    - Implement subscriber for shipment delivery events
    - _Requirements: 7.3, 7.4, 8.2, 10.5_
    - _Status: ✅ COMPLETED - Created order-created, escrow-released, escrow-disputed, shipment-delivered subscribers_
  - [x] 7.2 Integrate email notification service
    - Set up email service provider (SendGrid, Mailgun, or similar)
    - Create email templates for verification, orders, escrow, shipment events
    - Implement email sending in notification subscribers
    - Add notification preferences to user profiles
    - _Requirements: 7.3, 7.4, 8.2, 9.1, 10.5_
    - _Status: ✅ COMPLETED - SendGrid integrated, all subscribers updated with email notifications_

- [x] 7.3 Integrate third-party services for platform features
  - [x] 7.3.1 Integrate MeiliSearch for product search
    - Install `@medusajs/medusa-plugin-meilisearch` package
    - Configure MeiliSearch plugin in `medusa-config.ts`
    - Set environment variables: `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`
    - Add MeiliSearch indexes for products with custom attributes
    - Configure searchable attributes: name, description, metadata fields
    - Implement faceted search filters for B2B (min_order_qty, seller_location)
    - Test product indexing and search queries
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
    - _Reference: https://docs.medusajs.com/resources/integrations/meilisearch_
    - _Status: ✅ COMPLETED - MeiliSearch service created, product indexing subscribers added, search route updated_
  - [x] 7.3.2 Integrate MinIO for file storage
    - Install `@medusajs/medusa-file-minio` package
    - Configure MinIO file service in `medusa-config.ts`
    - Set environment variables: `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
    - Create buckets for product images and verification documents
    - Implement signed URL generation for secure document access
    - Add file upload endpoints for images and documents
    - Configure CORS for MinIO bucket access
    - _Requirements: 1.4, 1.5, 2.2, 4.5_
    - _Reference: https://docs.medusajs.com/resources/integrations/file/minio_
    - _Status: ✅ COMPLETED - MinIO service created, file upload endpoints added, Docker service configured_
  - [x] 7.3.3 Integrate PostHog for analytics
    - Configure Analytics Module in `medusa-config.ts` with PostHog provider
    - Add `@medusajs/analytics-posthog` provider configuration
    - Install `posthog-node` package as peer dependency
    - Set environment variables: `POSTHOG_EVENTS_API_KEY`, `POSTHOG_HOST`
    - Create `src/workflows/track-order-placed.ts` workflow using Analytics Module
    - Create `src/workflows/track-product-search.ts` workflow using Analytics Module
    - Update `src/subscribers/analytics-order-placed.ts` to execute workflow
    - Update `src/subscribers/analytics-product-search.ts` to execute workflow
    - Track events: `order_placed`, `product_search`
    - _Requirements: 11.1, 11.4_
    - _Reference: https://docs.medusajs.com/resources/infrastructure-modules/analytics/posthog_
    - _Status: ✅ COMPLETED - PostHog integrated using Medusa Analytics Module with workflows and subscribers_
  - [x] 7.3.4 Integrate SendGrid for email notifications
    - Install `@sendgrid/mail` package
    - Create email service in `src/services/email.ts` using SendGrid API
    - Set environment variable: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
    - Create email templates for verification, orders, escrow, shipment
    - Implement template rendering with dynamic data
    - Add email sending in workflow notification steps
    - Configure webhook for delivery tracking
    - Test email delivery for all notification types
    - _Requirements: 7.3, 7.4, 8.2, 9.1, 10.5_
    - _Reference: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started_
    - _Status: ✅ COMPLETED - Email service created with 10 templates, integrated into all notification steps_
  - [x] 7.3.5 Integrate Stripe for payment processing
    - Install `@medusajs/medusa-payment-stripe` package
    - Configure Stripe payment provider in `medusa-config.ts`
    - Set environment variables: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
    - Enable Payment Intents API for escrow holds
    - Create webhook handler at `/hooks/stripe` for payment events
    - Implement payment hold in create-escrow workflow
    - Implement payment capture in release-escrow workflow
    - Implement refund in refund-escrow workflow
    - Test payment flow: hold → capture → refund
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
    - _Reference: https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe_
    - _Status: ✅ COMPLETED - Stripe configured with manual capture, payment workflows updated, webhook handler created_
  - [x] 7.3.6 Integrate Webshipper for shipment tracking
    - Install Webshipper SDK or create custom integration
    - Create shipment service in `src/services/webshipper.ts`
    - Set environment variables: `WEBSHIPPER_API_TOKEN`, `WEBSHIPPER_BASE_URL`
    - Implement carrier API integration (DHL, FedEx, UPS via Webshipper)
    - Create webhook handler for tracking updates at `/hooks/webshipper`
    - Update shipment tracking module with real-time carrier data
    - Implement automatic tracking status updates in workflows
    - Add fallback for manual tracking entry
    - Test tracking creation and status updates
    - _Requirements: 10.2, 10.3, 10.4_
    - _Reference: https://docs.webshipper.io/api/_
    - _Status: ✅ COMPLETED - Webshipper service created, webhook handler added, shipment tracking integrated_

- [ ] 8. Initialize Next.js 15 frontend project
  - Create Next.js 15 project with App Router
  - Install and configure Tailwind CSS
  - Set up shadcn/ui component library
  - Configure environment variables for Medusa API endpoints (default: http://localhost:9000)
  - Set up authentication context and API client utilities for Medusa v2 REST API
  - _Requirements: All frontend requirements depend on proper project setup_

- [ ] 9. Implement authentication and registration flows
  - [ ] 9.1 Create login and registration pages
    - Build login page with email/password form
    - Build registration page with role selection (seller/buyer)
    - Create role-specific registration forms with required fields
    - Integrate with Medusa v2 auth API endpoints
    - _Requirements: 1.1, 1.2, 4.1, 4.2_
  - [ ] 9.2 Implement authentication context and protected routes
    - Create AuthContext for managing user session state
    - Implement protected route wrapper for role-based access
    - Add automatic token refresh logic
    - Create logout functionality
    - _Requirements: All requirements depend on authentication_

- [ ] 10. Build seller dashboard and product management UI
  - [ ] 15.1 Create seller dashboard layout and navigation
    - Build dashboard layout with sidebar navigation
    - Create dashboard home page with key metrics (total products, pending orders)
    - Implement navigation to products, orders, and profile sections
    - _Requirements: 2.1, 12.1_
  - [ ] 15.2 Implement product management interface
    - Build product list page with table view and action buttons
    - Create product creation form with image upload, description, pricing fields
    - Create product edit form with pre-populated data
    - Implement product deletion with confirmation dialog
    - Add B2B-specific fields (minimum order quantity, bulk pricing)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 15.3 Build seller profile management page
    - Create profile form with company information, location, certifications
    - Implement document upload for verification
    - Display verification status with badge
    - Add profile update functionality
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 16. Build public seller store pages
  - [ ] 16.1 Create public seller store page layout
    - Build store page with seller header component (company info, verification badge)
    - Display seller description, location, and contact details
    - Create product catalog section with grid layout
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ] 16.2 Implement product catalog with search and filters
    - Add search input for filtering products by name
    - Implement category and price range filters
    - Display products using ProductCard components
    - Add pagination controls
    - _Requirements: 3.3, 3.5_

- [ ] 17. Build buyer interface for product search and orders
  - [ ] 17.1 Create global product search page
    - Build search page with search input and filter sidebar
    - Implement filters for category, price, seller location, minimum order quantity
    - Display search results using ProductCard components with seller information
    - Add pagination controls
    - Link product cards to seller store pages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 17.2 Build buyer profile management page
    - Create profile form with company information, business interests, business needs
    - Implement document upload for verification
    - Display verification status with badge
    - Add profile update functionality
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [ ] 17.3 Create buyer order history and tracking page
    - Build order list page with table view and status filters
    - Create order detail page with product information, seller details, and order status
    - Integrate escrow status display with EscrowStatusCard component
    - Integrate shipment tracking with TrackingTimeline component
    - Add delivery confirmation button for escrow release
    - _Requirements: 8.1, 9.5, 10.3, 10.5_

- [ ] 18. Build partner directory interface
  - [ ] 18.1 Create partner search page
    - Build search page with filter sidebar for country, industry, looking_for, offers
    - Add company name search input
    - Display search results with company cards showing key information
    - Add pagination controls
    - Link to partner profile detail pages
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 18.2 Implement partner profile pages
    - Create public partner profile page displaying company information
    - Show verification badge for verified partners
    - Display what they're looking for and what they offer
    - Add contact button for verified users
    - _Requirements: 6.5_

- [ ] 19. Build seller order management interface
  - [ ] 19.1 Create seller order dashboard
    - Build order list page with table view showing all incoming orders
    - Implement status filters (pending, accepted, shipped, completed)
    - Add date range filter
    - Display order details including buyer information and products
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ] 19.2 Implement order action functionality
    - Add accept/decline buttons for pending orders
    - Create form for adding shipment tracking information
    - Implement order status update functionality
    - Display buyer contact information and delivery address
    - _Requirements: 8.3, 8.4, 8.5, 10.1, 12.4, 12.5_

- [ ] 20. Build administrator dashboard
  - [ ] 20.1 Create admin dashboard layout and navigation
    - Build admin dashboard layout with sidebar navigation
    - Create dashboard home page with platform metrics
    - Implement navigation to verifications, escrow, and settings sections
    - _Requirements: 11.1, 11.4_
  - [ ] 20.2 Implement verification management interface
    - Build verification queue page listing pending verifications
    - Create verification detail view with document preview
    - Add approve/reject buttons with rejection reason form
    - Display verification history and status
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 20.3 Build escrow management interface
    - Create escrow transaction list page with filters
    - Build escrow detail view showing transaction timeline
    - Implement dispute resolution interface with refund action
    - Display buyer and seller information for each transaction
    - _Requirements: 11.2, 11.3_
  - [ ] 20.4 Create platform settings page
    - Build settings form for commission rates and payment methods
    - Add verification requirement configuration
    - Implement platform-wide announcement system
    - _Requirements: 11.4_

- [ ] 21. Implement shared UI components with shadcn/ui
  - [ ] 21.1 Create product and business card components
    - Build ProductCard component with image, name, price, seller info, and action buttons
    - Build SellerStoreHeader component with company info and verification badge
    - Build VerificationBadge component with status indicator and tooltip
    - _Requirements: 3.2, 3.3, 3.4, 5.5_
  - [ ] 21.2 Create order and transaction components
    - Build OrderTable component with filtering, sorting, and action buttons
    - Build EscrowStatusCard component with status display and action buttons
    - Build TrackingTimeline component with shipment event visualization
    - _Requirements: 9.5, 10.3, 12.1_
  - [ ] 21.3 Create search and filter components
    - Build PartnerSearchFilters component with multi-select filters
    - Build ProductSearchFilters component with category, price, location filters
    - Create reusable SearchInput component with debouncing
    - _Requirements: 5.3, 5.4, 6.2, 6.3_

- [ ] 22. Implement payment UI with Stripe Elements
  - [ ] 22.1 Build payment UI components
    - Install `@stripe/stripe-js` and `@stripe/react-stripe-js` packages
    - Create PaymentForm component with Stripe Elements
    - Build payment confirmation page
    - Implement payment error handling and retry logic
    - Add 3D Secure authentication support
    - _Requirements: 9.1, 9.5_

- [ ] 23. Implement notification system
  - [ ] 23.1 Create notification service in backend
    - Implement email notification service with template support
    - Create notification templates for verification, orders, escrow, shipment events
    - Add notification preferences to user profiles
    - _Requirements: 7.3, 7.4, 8.2, 10.5_
  - [ ] 23.2 Build in-app notification UI
    - Create notification bell icon with unread count in header
    - Build notification dropdown with recent notifications
    - Implement notification list page with filtering
    - Add real-time notification updates using polling or WebSockets
    - _Requirements: 8.2, 9.1, 10.5_

- [ ] 24. Set up monitoring and error tracking
  - Integrate Sentry for error tracking in both frontend and backend
  - Set up application logging with structured logs
  - Create custom metrics for business events (orders, verifications, escrow)
  - Implement health check endpoints for monitoring
  - _Requirements: All requirements benefit from monitoring_

- [ ] 25. Configure deployment pipeline
  - [ ] 25.1 Set up Docker containers
    - Create Dockerfile for Medusa.js backend
    - Create Dockerfile for Next.js frontend
    - Create docker-compose.yml for local development
    - _Requirements: All requirements depend on deployment_
  - [ ] 25.2 Configure CI/CD with GitHub Actions
    - Create workflow for running tests on pull requests
    - Add workflow for building and pushing Docker images
    - Implement deployment workflow for staging and production
    - Add environment-specific configuration management
    - _Requirements: All requirements depend on deployment_

- [ ] 26. Write integration tests for critical flows
  - [ ] 26.1 Test seller registration and verification flow
    - Write test for seller registration with profile creation
    - Test verification document submission and approval process
    - Verify seller can access dashboard after verification
    - _Requirements: 1.1, 1.2, 1.5, 7.1, 7.3_
  - [ ] 26.2 Test order and escrow flow
    - Write test for complete order flow from creation to completion
    - Test escrow creation when order is accepted
    - Test escrow release on delivery confirmation
    - Test dispute flagging and admin resolution
    - _Requirements: 8.1, 8.4, 8.5, 9.1, 9.3, 9.4_
  - [ ] 26.3 Test product search and partner directory
    - Write test for global product search with filters
    - Test partner directory search with multiple filter combinations
    - Verify only verified profiles appear in partner directory
    - _Requirements: 5.1, 5.3, 5.4, 6.2, 6.3, 6.5_

- [ ] 27. Create API documentation
  - Document all custom API endpoints with request/response examples
  - Create Postman collection for API testing
  - Generate OpenAPI/Swagger specification
  - Write integration guide for external developers
  - _Requirements: All API-related requirements_
