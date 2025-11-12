---
mode: agent
---

# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive **multi-vendor B2B marketplace platform** that connects business vendors (manufacturers, wholesalers, suppliers) with business buyers (distributors, retailers, resellers). The platform facilitates product discovery, vendor management, partner networking, secure transactions, request for quotations (RFQ), bulk ordering, and trust-building through verification and escrow systems. The system will be built using **Medusa v2** for the backend with **marketplace/multi-vendor architecture**, Next.js 15 for the frontend, and Tailwind CSS with shadcn/ui for the user interface.

**Inspiration**: The platform draws from **Alibaba.com's B2B model**, featuring vendor storefronts, bulk pricing, RFQs, trade assurance, and supplier verification.

### Medusa v2 Marketplace Architecture

This platform leverages Medusa v2's marketplace capabilities and key features:

- **Vendor Module**: Core module for multi-vendor marketplace (replaces simple seller concept)
- **Vendor-Product Links**: Products are linked to vendors using Medusa's module linking system
- **Order Splitting**: Orders are automatically split by vendor for fulfillment
- **Commission System**: Platform commission tracking and vendor payout management
- **Modules**: Custom business logic organized into domain-specific modules (Vendor, Buyer, Partner, Escrow, Shipment, RFQ)
- **Data Model Language (DML)**: Database tables defined using Medusa's DML instead of TypeORM entities
- **Workflows**: Business operations use workflows with built-in rollback and retry mechanisms
- **File-Based API Routing**: API endpoints follow Medusa v2's file-based routing system
- **MikroORM**: Database migrations are managed using MikroORM (not TypeORM)

## Glossary

- **Platform**: The multi-vendor B2B marketplace system
- **Vendor**: A business entity that sells products through the marketplace (e.g., manufacturers, wholesalers, suppliers). Replaces the "Seller" concept with enhanced marketplace capabilities.
- **Vendor_Admin**: A user account that manages a vendor's operations, products, and orders
- **Buyer**: A business entity that purchases products from multiple vendors (e.g., distributors, retailers, resellers)
- **Administrator**: The platform owner who manages marketplace operations, vendor onboarding, and dispute resolution
- **Vendor_Dashboard**: A private portal for vendors to manage products, orders, inventory, and analytics
- **Vendor_Storefront**: A public-facing page displaying a vendor's company profile, certifications, and product catalog
- **Buyer_Profile**: A public-facing profile displaying a buyer's company information, business needs, and purchasing history
- **Product_Catalog**: A collection of products offered by a vendor with B2B features (MOQ, bulk pricing, lead times)
- **Partner_Directory**: A searchable directory of verified businesses (buyers and vendors) for partnership opportunities
- **Verification_System**: A process to validate business identity through document submission and admin review
- **Escrow_System**: A secure payment holding mechanism (trade assurance) that releases funds upon delivery confirmation
- **Order**: A transaction record between a buyer and vendor(s) for product purchase
- **Vendor_Order**: A sub-order within a parent order, specific to one vendor for fulfillment
- **RFQ (Request for Quotation)**: A buyer's request for pricing and terms from vendors for specific products/quantities
- **Commission**: Platform fee charged to vendors on completed transactions
- **MOQ (Minimum Order Quantity)**: The minimum quantity a buyer must purchase for a product
- **Bulk_Pricing_Tier**: Quantity-based pricing structure (e.g., 10-99 units: $10, 100+ units: $8)

## Requirements

### Requirement 1: Vendor Registration and Onboarding

**User Story:** As a vendor, I want to create and manage my vendor profile with multi-product capabilities, so that I can establish my marketplace presence and attract buyers.

#### Acceptance Criteria

1. WHEN a vendor completes the registration form with valid business information, THE Platform SHALL create a new vendor account with admin user
2. THE Platform SHALL require vendors to provide company name, business type, location, contact details, business description, and product categories during registration
3. WHEN a vendor updates their profile information, THE Platform SHALL save the changes and reflect them on the Vendor_Storefront within 5 seconds
4. THE Platform SHALL allow vendors to upload company certifications, licenses, and verification documents
5. WHEN a vendor submits verification documents, THE Platform SHALL mark the profile as pending verification and restrict vendor capabilities until administrator approval
6. THE Platform SHALL create a unique vendor identifier and handle for each vendor account
7. THE Platform SHALL link the vendor account to an authentication identity for secure access to Vendor_Dashboard

### Requirement 2: Vendor Product Management with B2B Features

**User Story:** As a vendor, I want to add, edit, and manage products with B2B pricing features, so that I can offer competitive bulk pricing to buyers.

#### Acceptance Criteria

1. WHEN a vendor accesses the Vendor_Dashboard, THE Platform SHALL display all vendor products with options to create, edit, delete, and manage inventory
2. THE Platform SHALL require product name, description, base price, MOQ (Minimum Order Quantity), and at least one image when creating a new product
3. WHEN a vendor creates a new product, THE Platform SHALL link the product to the vendor and make it searchable within 10 seconds
4. WHEN a vendor deletes a product, THE Platform SHALL remove it from the Product_Catalog and all search results immediately
5. THE Platform SHALL allow vendors to specify:
   - Product specifications and technical details
   - Minimum Order Quantity (MOQ)
   - Bulk pricing tiers with quantity ranges (e.g., 10-99: $10, 100-499: $8, 500+: $6)
   - Lead time for production/delivery
   - Available inventory quantity
   - Product variants (size, color, specifications)
6. THE Platform SHALL allow vendors to set different prices per currency for international buyers
7. THE Platform SHALL link products to the default sales channel automatically or allow vendor-specific sales channel management

### Requirement 3: Vendor Storefront and Public Profile

**User Story:** As a vendor, I want a professional public-facing storefront, so that buyers can discover my company and browse my product catalog.

#### Acceptance Criteria

1. THE Platform SHALL generate a unique Vendor_Storefront URL with custom handle for each verified vendor
2. THE Vendor_Storefront SHALL display:
   - Company information and business description
   - Contact details and business hours
   - Certifications, licenses, and verification badges
   - Complete Product_Catalog with search and filter capabilities
   - Vendor ratings and reviews (if available)
   - Years in business and transaction statistics
3. WHEN a buyer visits a Vendor_Storefront, THE Platform SHALL display all active products with advanced filtering (category, price range, MOQ, lead time)
4. THE Platform SHALL display a verification badge on the Vendor_Storefront for verified vendors
5. WHEN a product is updated in the Vendor_Dashboard, THE Platform SHALL reflect the changes on the Vendor_Storefront within 5 seconds
6. THE Platform SHALL allow buyers to contact vendors directly through the storefront for inquiries

### Requirement 4: Buyer Registration and Profile Management

**User Story:** As a buyer, I want to create and manage my business profile, so that sellers can evaluate my credibility before engaging in transactions.

#### Acceptance Criteria

1. WHEN a buyer completes the registration form with valid business information, THE Platform SHALL create a new buyer account
2. THE Platform SHALL require buyers to provide company name, location, contact details, and business interests during registration
3. THE Platform SHALL allow buyers to specify their business needs and product interests on the Buyer_Profile
4. WHEN a buyer updates their profile information, THE Platform SHALL save the changes and reflect them on the Buyer_Profile within 5 seconds
5. WHEN a buyer submits verification documents, THE Platform SHALL mark the profile as pending verification until administrator approval

### Requirement 5: Global Product Search with Multi-Vendor Support

**User Story:** As a buyer, I want to search for products across all vendors, so that I can compare offerings and find the best suppliers for my business needs.

#### Acceptance Criteria

1. THE Platform SHALL provide a global search interface that queries products from all verified vendors
2. WHEN a buyer enters a search query, THE Platform SHALL return relevant products from multiple vendors within 2 seconds
3. THE Platform SHALL provide filters for:
   - Category and sub-category
   - Price range and bulk pricing tiers
   - Vendor location and shipping capabilities
   - Minimum Order Quantity (MOQ)
   - Lead time for delivery
   - Product specifications and attributes
   - Vendor verification status and ratings
4. WHEN a buyer applies filters, THE Platform SHALL update search results to match the selected criteria within 1 second
5. THE Platform SHALL display product information including:
   - Vendor name and verification badge
   - Base price and bulk pricing preview
   - MOQ and available quantity
   - Lead time
   - Vendor location
   - Link to Vendor_Storefront
6. THE Platform SHALL support sorting by price, MOQ, lead time, vendor rating, and relevance
7. THE Platform SHALL integrate with MeiliSearch for fast, typo-tolerant search with faceted filtering

### Requirement 6: Request for Quotation (RFQ) System

**User Story:** As a buyer, I want to submit RFQs to multiple vendors, so that I can negotiate pricing for large or custom orders.

#### Acceptance Criteria

1. THE Platform SHALL provide an RFQ creation interface where buyers can specify product requirements, quantities, and delivery timelines
2. WHEN a buyer submits an RFQ, THE Platform SHALL allow them to send it to multiple selected vendors simultaneously
3. THE Platform SHALL notify vendors via email and dashboard notification when they receive an RFQ
4. WHEN a vendor views an RFQ, THE Platform SHALL display:
   - Product requirements and specifications
   - Requested quantity
   - Delivery timeline
   - Buyer company information
   - Buyer's purchasing history (if available)
5. THE Platform SHALL allow vendors to submit quotations with:
   - Unit price and total price
   - Minimum order quantity
   - Lead time for delivery
   - Payment terms
   - Validity period of the quotation
6. WHEN a vendor submits a quotation, THE Platform SHALL notify the buyer and add it to their RFQ dashboard
7. THE Platform SHALL allow buyers to compare quotations side-by-side and accept the best offer
8. WHEN a buyer accepts a quotation, THE Platform SHALL convert it into a regular order and initiate the escrow process

### Requirement 7: Multi-Vendor Order Management and Order Splitting

**User Story:** As a buyer, I want to place orders with multiple vendors in a single cart, so that I can efficiently purchase from different suppliers.

#### Acceptance Criteria

1. WHEN a buyer adds products from multiple vendors to their cart, THE Platform SHALL group items by vendor
2. WHEN a buyer checks out, THE Platform SHALL create a parent order and split it into multiple Vendor_Orders
3. THE Platform SHALL create one Vendor_Order for each vendor with their respective products
4. THE Platform SHALL notify each vendor when they receive a Vendor_Order
5. WHEN a vendor views a Vendor_Order in the Vendor_Dashboard, THE Platform SHALL display:
   - Buyer information and delivery address
   - Ordered products with quantities and agreed pricing
   - Total order value for the vendor
   - Delivery timeline
6. THE Platform SHALL allow vendors to accept or decline Vendor_Orders within the Vendor_Dashboard
7. WHEN a vendor accepts a Vendor_Order, THE Platform SHALL notify the buyer and initiate the Escrow_System for that vendor's portion
8. THE Platform SHALL track each Vendor_Order's status independently (pending, accepted, shipped, delivered, completed)
9. THE Platform SHALL allow buyers to view the parent order with all Vendor_Orders and their statuses in one dashboard

### Requirement 8: Vendor Commission and Payout System

**User Story:** As an administrator, I want to track vendor commissions and manage payouts, so that the platform can generate revenue and vendors receive payments.

#### Acceptance Criteria

1. THE Platform SHALL calculate commission on each completed Vendor_Order based on configurable commission rates
2. THE Platform SHALL support percentage-based commission rates (e.g., 5% of order value)
3. THE Platform SHALL allow administrators to set different commission rates per vendor or vendor tier
4. WHEN a Vendor_Order is completed (buyer confirms delivery), THE Platform SHALL:
   - Calculate the platform commission
   - Deduct commission from the vendor's payment
   - Record the transaction in the commission tracking system
5. THE Platform SHALL provide vendors with a dashboard showing:
   - Total sales
   - Platform commission deducted
   - Net earnings
   - Payout history
6. THE Platform SHALL integrate with Stripe Connect for vendor payouts
7. THE Platform SHALL allow administrators to configure payout schedules (daily, weekly, monthly)
8. THE Platform SHALL provide administrators with commission analytics and revenue reports

### Requirement 6: B2B Partner Directory

**User Story:** As a business user (buyer or vendor), I want to search for potential partners, so that I can establish new business relationships and expand my network.

#### Acceptance Criteria

1. THE Platform SHALL provide a Partner_Directory interface separate from product search
2. THE Platform SHALL allow users to search for businesses by country, industry, business type, and partnership interests
3. WHEN a user searches the Partner_Directory, THE Platform SHALL return matching business profiles within 2 seconds
4. THE Platform SHALL allow users to specify what they are "Looking for" (Suppliers, Buyers, Distributors, Manufacturers) and what they "Offer" (Manufacturing, Wholesale, Distribution, Retail)
5. THE Platform SHALL display only verified business profiles in the Partner_Directory search results
6. THE Platform SHALL allow users to message businesses directly through the Partner_Directory for partnership inquiries

### Requirement 7: Profile Verification System

**User Story:** As an administrator, I want to verify business profiles, so that the platform maintains trust and credibility among users.

#### Acceptance Criteria

1. WHEN a user (vendor or buyer) submits verification documents, THE Platform SHALL notify the administrator and add the request to a verification queue
2. THE Platform SHALL allow administrators to review submitted documents including:
   - Business registration certificates
   - Tax identification numbers
   - Trade licenses
   - Company certificates and permits
   - Bank account verification
3. WHEN an administrator approves a verification request, THE Platform SHALL mark the profile as verified and display a verification badge on all public pages
4. WHEN an administrator rejects a verification request, THE Platform SHALL notify the user with rejection reasons and allow resubmission
5. THE Platform SHALL restrict unverified vendors from:
   - Appearing in product search results
   - Receiving RFQs
   - Processing orders
6. THE Platform SHALL restrict unverified buyers from:
   - Appearing in the Partner_Directory
   - Placing orders above a certain threshold
7. THE Platform SHALL support tiered verification levels (Basic, Advanced, Premium) with different capabilities

### Requirement 8: Order Creation and Management

**User Story:** As a buyer, I want to place orders with sellers, so that I can purchase products for my business.

#### Acceptance Criteria

1. WHEN a buyer selects products and submits an order, THE Platform SHALL create an Order record with buyer information, seller information, product details, and total amount
2. THE Platform SHALL notify the seller when a new Order is created
3. WHEN a seller views an Order in the Seller_Dashboard, THE Platform SHALL display buyer information, ordered products, quantities, and delivery details
4. THE Platform SHALL allow sellers to accept or decline orders within the Seller_Dashboard
5. WHEN a seller accepts an Order, THE Platform SHALL notify the buyer and initiate the Escrow_System process

### Requirement 9: Secure Escrow System (Trade Assurance)

**User Story:** As a buyer, I want my payment to be held securely until delivery is confirmed, so that I am protected from fraudulent transactions.

#### Acceptance Criteria

1. WHEN a buyer confirms an accepted Vendor_Order, THE Platform SHALL hold the payment amount in the Escrow_System
2. THE Platform SHALL prevent the vendor from accessing escrowed funds until delivery confirmation or mutual agreement
3. WHEN a buyer confirms successful delivery for a Vendor_Order, THE Platform SHALL:
   - Calculate and deduct platform commission
   - Release the net amount to the vendor within 24 hours
   - Update the order status to completed
4. IF a dispute arises, THEN THE Platform SHALL:
   - Hold the escrowed funds
   - Notify the administrator for resolution
   - Provide both parties with dispute submission interface
5. THE Platform SHALL provide transaction status visibility to both buyer and vendor throughout the escrow process
6. THE Platform SHALL support partial releases when orders are delivered in multiple shipments
7. THE Platform SHALL integrate with Stripe payment intents for secure payment holding
8. THE Platform SHALL automatically release funds after a configurable timeout period (e.g., 14 days) if buyer doesn't dispute

### Requirement 10: Vendor Dashboard with Analytics

**User Story:** As a vendor, I want to view and manage my marketplace operations, so that I can fulfill orders efficiently and track business performance.

#### Acceptance Criteria

1. WHEN a vendor accesses the Vendor_Dashboard, THE Platform SHALL display:
   - Order management interface with filters (pending, accepted, shipped, completed)
   - Product catalog management
   - Inventory levels and low stock alerts
   - RFQ inbox with pending quotation requests
   - Analytics and sales reports
   - Commission and payout information
2. THE Platform SHALL allow vendors to filter Vendor_Orders by status, date range, and buyer
3. WHEN a vendor updates a Vendor_Order status, THE Platform SHALL save the change and notify the buyer within 30 seconds
4. THE Platform SHALL allow vendors to add shipment tracking information to accepted orders
5. THE Platform SHALL display order details including:
   - Buyer contact information
   - Delivery address
   - Special instructions
   - Payment status (pending, escrowed, released)
6. THE Platform SHALL provide analytics showing:
   - Total sales and revenue trends
   - Top-selling products
   - Order fulfillment metrics
   - Customer demographics
   - Commission deductions
7. THE Platform SHALL allow vendors to export order data and reports

### Requirement 10: Shipment Tracking Integration

**User Story:** As a buyer, I want to track my order shipment from multiple vendors, so that I can monitor delivery progress and plan accordingly.

#### Acceptance Criteria

1. WHEN a vendor provides shipment tracking information for a Vendor_Order, THE Platform SHALL store the tracking number and carrier details with the order
2. THE Platform SHALL integrate with Webshipper or similar multi-carrier shipping APIs to retrieve real-time tracking status
3. WHEN a user views a Vendor_Order with tracking information, THE Platform SHALL display:
   - Current shipment status and location
   - Estimated delivery date
   - Tracking history with timestamps
   - Carrier name and tracking URL
4. THE Platform SHALL update tracking information automatically at intervals not exceeding 4 hours
5. WHEN a shipment status changes to delivered, THE Platform SHALL:
   - Notify both buyer and vendor
   - Prompt buyer to confirm delivery and release escrow
   - Update Vendor_Order status
6. THE Platform SHALL support multiple tracking numbers per Vendor_Order for partial shipments
7. THE Platform SHALL allow buyers to view consolidated tracking for all Vendor_Orders in a parent order

### Requirement 11: Administrator Marketplace Management

**User Story:** As an administrator, I want to manage marketplace operations, so that I can ensure smooth functioning, resolve disputes, and grow the platform.

#### Acceptance Criteria

1. THE Platform SHALL provide an administrator dashboard with access to:
   - All vendor and buyer profiles
   - All orders and Vendor_Orders
   - Verification requests queue
   - Dispute resolution center
   - Commission tracking and financial reports
2. THE Platform SHALL allow administrators to view and manage all Escrow_System transactions
3. WHEN a dispute is flagged, THE Platform SHALL:
   - Notify the administrator
   - Provide access to order details, communication history, and evidence
   - Allow administrator to make a ruling (refund buyer, release to vendor, partial refund)
4. THE Platform SHALL allow administrators to configure:
   - Platform-wide commission rates
   - Vendor-specific commission rates
   - Verification requirements and document types
   - Payment methods and escrow timeout periods
   - Product categories and attributes
5. THE Platform SHALL provide analytics and reporting capabilities for:
   - Vendor activity and performance
   - Buyer purchasing patterns
   - Transaction volume and GMV (Gross Merchandise Value)
   - Platform revenue from commissions
   - Geographical distribution of vendors and buyers
6. THE Platform SHALL allow administrators to:
   - Suspend or ban vendors/buyers for policy violations
   - Feature top-performing vendors on homepage
   - Send platform-wide announcements
   - Manage product categories and marketplace settings

### Requirement 12: Buyer Messaging and Inquiry System

**User Story:** As a buyer, I want to message vendors directly, so that I can ask questions about products, negotiate terms, and build relationships.

#### Acceptance Criteria

1. THE Platform SHALL provide a messaging interface for buyers to contact vendors
2. WHEN a buyer sends a message to a vendor, THE Platform SHALL:
   - Store the message in the messaging system
   - Notify the vendor via email and dashboard notification
   - Create a conversation thread
3. THE Platform SHALL allow vendors to respond to messages within the Vendor_Dashboard
4. THE Platform SHALL display conversation history with timestamps
5. THE Platform SHALL allow users to attach images and files to messages (up to 10MB)
6. THE Platform SHALL allow buyers to send product inquiries with:
   - Product reference
   - Quantity of interest
   - Specific questions
   - Requested delivery timeline
7. THE Platform SHALL track message read status
8. THE Platform SHALL allow administrators to view message histories for dispute resolution
