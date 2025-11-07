# Implementation Plan

- [ ] 1. Set up project structure and development environment

  - Initialize monorepo structure with separate storefront (Next.js) and backend (MedusaJS) directories
  - Create MedusaJS backend using `npx create-medusa-app@latest` with PostgreSQL and Redis
  - Create Next.js frontend using `npx create-next-app@latest` with TypeScript and App Router
  - Configure Tailwind CSS in Next.js project
  - Install and configure shadcn/ui components using `npx shadcn-ui@latest init`
  - Set up ESLint and Prettier for code quality and formatting
  - Create Docker Compose configuration for PostgreSQL, Redis, MedusaJS, and Next.js
  - Configure environment variables for both MedusaJS (.env) and Next.js (.env.local)
  - _Requirements: All requirements depend on proper project setup_

- [ ] 2. Extend MedusaJS database schema with custom entities

  - Create MedusaJS migration to extend Customer entity with account_type and company_name fields
  - Create custom UserProfile entity migration with business info and ranking score
  - Create custom Pitch entity migration with buyer, seller, product relationships
  - Create custom PitchMessage and Proposal entity migrations
  - Create custom SupplierRelationship entity migration
  - Create custom SubscriptionPlan and Subscription entity migrations
  - Create custom Transaction entity migration for fee tracking
  - Add proper indexes for performance optimization on custom tables
  - Create database seeding script for subscription plans using MedusaJS seed command
  - _Requirements: 1.2, 2.4, 3.4, 6.5, 7.5, 9.5, 10.4_

- [ ] 3. Extend MedusaJS authentication for B2B marketplace

  - [ ] 3.1 Create custom registration endpoint extending MedusaJS customer creation

    - Create POST /store/auth/register API route in MedusaJS
    - Extend CustomerService to accept account_type and company_name fields
    - Validate email format and password strength using Zod schemas
    - Store extended customer data with account type (BUYER or SELLER)
    - Return customer object with authentication cookie (MedusaJS handles JWT)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 3.2 Extend MedusaJS login endpoint

    - Use MedusaJS built-in POST /store/auth endpoint for authentication
    - Verify credentials using MedusaJS AuthService (handles bcrypt and JWT)
    - Ensure authentication cookie is set with proper expiry
    - Return customer object with account_type information
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 3.3 Create authentication middleware for custom routes

    - Implement middleware using MedusaJS authenticate() helper
    - Extract customer information from JWT token (MedusaJS managed)
    - Add account type validation for Buyer/Seller-specific routes
    - Handle authentication errors with proper error responses
    - _Requirements: 4.2, 4.5_

  - [ ] 3.4 Configure session management

    - Configure MedusaJS session settings in medusa-config.js
    - Set JWT expiry and refresh token settings
    - Configure Redis for session storage
    - _Requirements: 4.2, 4.5_

  - [ ]\* 3.5 Write unit tests for authentication extensions
    - Test custom registration with account_type validation
    - Test authentication middleware with Buyer/Seller permissions
    - Test session management and token validation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Create custom UserProfile module in MedusaJS

  - [ ] 4.1 Create UserProfileService for profile management

    - Create custom MedusaJS service extending TransactionBaseService
    - Implement createProfile method for both Buyers and Sellers
    - Validate required fields using Zod schemas
    - Initialize ranking_score to 0.00 for Seller profiles
    - Link profile to customer_id from authenticated customer
    - _Requirements: 2.1, 2.4, 3.1, 3.4_

  - [ ] 4.2 Create profile API endpoints

    - Create POST /store/profiles API route for profile creation
    - Create PATCH /store/profiles/:id API route for profile updates
    - Create GET /store/profiles/me API route for authenticated user's profile
    - Create GET /store/profiles/:customerId API route for public profile viewing
    - Add authentication middleware to protect profile routes
    - _Requirements: 2.2, 2.3, 3.3_

  - [ ] 4.3 Implement profile authorization logic

    - Validate that authenticated customer can only update their own profile
    - Filter sensitive information for public profile views
    - Return appropriate error responses for unauthorized access
    - _Requirements: 2.2, 2.3_

  - [ ] 4.4 Implement data pseudonymization utility

    - Create utility function to generate pseudonymous identifiers
    - Create custom entity for pseudonym mappings
    - Implement function to replace customer IDs with pseudonyms in logs
    - Create admin-only API route to access pseudonymization mappings
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]\* 4.5 Write unit tests for UserProfile module
    - Test profile creation for both Buyer and Seller account types
    - Test profile update validation and authorization
    - Test pseudonymization utility functions
    - _Requirements: 2.1, 2.2, 3.1, 5.1, 5.2_

- [ ] 5. Extend MedusaJS Product module for B2B marketplace

  - [ ] 5.1 Create ExtendedProductService

    - Extend MedusaJS ProductService to add seller_id and specifications fields
    - Override create method to validate Seller account type
    - Store seller_id with product for ownership tracking
    - Add specifications as metadata or custom field
    - Use MedusaJS variants for pricing (amount, currency_code)
    - _Requirements: 3.2_

  - [ ] 5.2 Create custom product API endpoints

    - Create POST /store/products API route for Sellers to create products
    - Create PATCH /store/products/:id API route for product updates
    - Create DELETE /store/products/:id API route for product deletion
    - Add middleware to validate only product owner (Seller) can modify products
    - _Requirements: 3.2_

  - [ ] 5.3 Implement product retrieval endpoints

    - Use MedusaJS built-in GET /store/products/:id for product details
    - Create GET /store/sellers/:sellerId/products API route for Seller's product list
    - Implement pagination using MedusaJS pagination utilities
    - Include product images and variants in responses
    - _Requirements: 3.3_

  - [ ] 5.4 Configure product image uploads

    - Use MedusaJS file service for image uploads (supports S3, MinIO, local)
    - Configure file upload plugin in medusa-config.js
    - Create POST /store/products/:id/images API route
    - Validate file type (JPEG, PNG) and size limits (max 5MB)
    - Store image URLs using MedusaJS Image entity
    - _Requirements: 3.2_

  - [ ]\* 5.5 Write unit tests for extended product module
    - Test product CRUD operations with Seller authorization
    - Test image upload validation and storage
    - Test pagination for product listings
    - _Requirements: 3.2, 3.3_

- [ ] 6. Create custom Pitch module in MedusaJS

  - [ ] 6.1 Create PitchService and related entities

    - Create custom Pitch entity with buyer_id, seller_id, product_id, and status
    - Create PitchMessage entity for negotiation messages
    - Create Proposal entity for price proposals
    - Create PitchService extending TransactionBaseService
    - Implement createPitch method with Buyer validation
    - _Requirements: 6.1_

  - [ ] 6.2 Create pitch creation API endpoint

    - Create POST /store/pitches API route for Buyers
    - Accept seller_id, product_id, initial_message, requested_quantity, target_price
    - Validate authenticated customer is a Buyer
    - Validate product exists using ProductService
    - Create pitch with status 'OPEN' and initial message
    - _Requirements: 6.1_

  - [ ] 6.3 Implement pitch messaging functionality

    - Create POST /store/pitches/:id/messages API route
    - Validate sender is either Buyer or Seller in the pitch
    - Store message with sender customer_id and timestamp
    - Update pitch status to 'IN_NEGOTIATION' if currently 'OPEN'
    - Return updated pitch with messages
    - _Requirements: 6.2, 6.3_

  - [ ] 6.4 Implement proposal submission

    - Create POST /store/pitches/:id/proposals API route
    - Accept proposed_by, price_amount, price_currency, quantity, terms
    - Validate proposer is involved in the pitch
    - Mark previous proposals as 'SUPERSEDED' using transaction
    - Store new proposal with status 'PENDING'
    - _Requirements: 6.2, 6.3_

  - [ ] 6.5 Implement pitch closure workflow

    - Create POST /store/pitches/:id/close API route
    - Accept agreed_terms with price, quantity, delivery_terms, payment_terms
    - Update pitch status to 'CLOSED' and set closed_at timestamp
    - Create SupplierRelationship entity linking Buyer and Seller
    - Use MedusaJS workflow for multi-step transaction
    - _Requirements: 6.4, 6.5, 7.1, 7.5_

  - [ ] 6.6 Create pitch retrieval endpoints

    - Create GET /store/pitches/:id API route with full details
    - Create GET /store/pitches/buyer API route for authenticated Buyer's pitches
    - Create GET /store/pitches/seller API route for authenticated Seller's pitches
    - Include relations: product, buyer profile, seller profile, messages, proposals
    - _Requirements: 6.5_

  - [ ]\* 6.7 Write unit tests for Pitch module
    - Test pitch creation with Buyer/Seller validation
    - Test messaging and proposal authorization
    - Test pitch closure workflow and supplier relationship creation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Create SupplierRelationship module in MedusaJS

  - [ ] 7.1 Create SupplierRelationship entity and service

    - Create SupplierRelationship entity (created in pitch closure)
    - Create SupplierRelationshipService extending TransactionBaseService
    - Implement methods to retrieve relationships for Buyers
    - _Requirements: 7.1, 7.5_

  - [ ] 7.2 Create supplier relationship API endpoints

    - Create GET /store/supplier-relationships/buyer API route for Buyer's suppliers
    - Create GET /store/supplier-relationships/:id API route for detailed view
    - Include seller profile, agreed terms, and transaction history
    - Validate that requester is the Buyer in the relationship
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ]\* 7.3 Write unit tests for SupplierRelationship module
    - Test supplier list retrieval with proper filtering
    - Test relationship detail access with authorization
    - Test relationship creation in pitch closure
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 8. Implement search functionality using MedusaJS

  - [ ] 8.1 Configure MedusaJS search plugin

    - Install and configure search plugin (Algolia, Meilisearch, or PostgreSQL full-text)
    - Configure search indexing for products and user profiles
    - Set up search index mappings for custom fields
    - _Requirements: 8.1, 8.2_

  - [ ] 8.2 Create product search endpoint

    - Create GET /store/search/products API route
    - Accept query text, filters (category, price_range, location), and pagination
    - Use MedusaJS SearchService for full-text search on title and description
    - Apply filters and return paginated results with relevance ranking
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ] 8.3 Create supplier search endpoint

    - Create GET /store/search/suppliers API route
    - Search across UserProfile fields (company_name, description, industry_sector)
    - Apply filters for location and minimum ranking_score
    - Sort by ranking_score when requested
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 8.4 Implement search result caching

    - Use MedusaJS CacheService with Redis backend
    - Cache search results with 5-minute TTL
    - Generate cache keys from query parameters
    - Invalidate cache on product or profile updates using MedusaJS subscribers
    - _Requirements: 8.2_

  - [ ] 8.5 Implement search facets and aggregations

    - Calculate facet counts for categories, locations, and price ranges
    - Use database aggregation queries or search plugin faceting
    - Return facets alongside search results for filter refinement
    - _Requirements: 8.3, 8.4_

  - [ ]\* 8.6 Write unit tests for search functionality
    - Test product and supplier search with various queries
    - Test filter application and result ranking
    - Test caching behavior and invalidation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Create custom Subscription module in MedusaJS

  - [ ] 9.1 Create SubscriptionPlan and Subscription entities

    - Create SubscriptionPlan entity with name, price, currency, billing_period, features, trade_limit
    - Create Subscription entity with customer_id, plan_id, status, dates, trade_count
    - Create SubscriptionService extending TransactionBaseService
    - _Requirements: 9.3_

  - [ ] 9.2 Seed subscription plans

    - Create database seed script for subscription plans
    - Insert Basic plan ($150/month) and Standard plan ($300/month)
    - Define features and trade limits for each plan
    - Run seed using MedusaJS seed command
    - _Requirements: 9.3_

  - [ ] 9.3 Create subscription API endpoints

    - Create GET /store/subscription-plans API route to list available plans
    - Create POST /store/subscriptions API route for plan activation
    - Create GET /store/subscriptions/me API route for active subscription
    - Validate no duplicate active subscriptions on creation
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 9.4 Implement subscription access middleware

    - Create middleware to check active subscription before pitch creation
    - Query Subscription entity for authenticated customer
    - Validate subscription status is 'ACTIVE' and not expired
    - Return 403 error if subscription required but not active
    - _Requirements: 9.2_

  - [ ] 9.5 Implement trade count tracking

    - Add method to SubscriptionService to increment trade_count
    - Call increment method in pitch closure workflow
    - Check trade_count against plan limits for tier upgrade eligibility
    - Create subscriber to listen for pitch closure events
    - _Requirements: 9.5_

  - [ ]\* 9.6 Write unit tests for Subscription module
    - Test subscription activation and duplicate prevention
    - Test access middleware with various subscription states
    - Test trade count increment and tier eligibility logic
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Create Transaction module for fee tracking

  - [ ] 10.1 Create Transaction entity and service

    - Create Transaction entity with buyer_id, seller_id, pitch_id, amount, currency, transaction_fee, status
    - Create TransactionService extending TransactionBaseService
    - Implement calculateTransactionFee utility (3.5% of amount, rounded to 2 decimals)
    - _Requirements: 10.1, 10.2_

  - [ ] 10.2 Integrate transaction recording in pitch closure

    - Add transaction creation to pitch closure workflow
    - Calculate transaction fee using utility function
    - Create Transaction record with status 'COMPLETED'
    - Link transaction to closed pitch
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ] 10.3 Create transaction history endpoints

    - Create GET /store/transactions/buyer API route for Buyer's transactions
    - Create GET /store/transactions/seller API route for Seller's transactions
    - Include transaction fee, pitch details, and other party information
    - Implement pagination for transaction lists
    - _Requirements: 10.3, 10.5_

  - [ ]\* 10.4 Write unit tests for Transaction module
    - Test transaction fee calculation with various amounts
    - Test transaction creation in pitch closure workflow
    - Test transaction history retrieval with proper filtering
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 11. Set up Next.js frontend foundation with Tailwind and shadcn/ui

  - [ ] 11.1 Configure Next.js App Router structure

    - Set up app directory with layout.tsx and page.tsx
    - Configure Next.js middleware for authentication checks
    - Set up route groups for authenticated and public routes
    - Configure next.config.js for MedusaJS API integration
    - _Requirements: All UI-related requirements_

  - [ ] 11.2 Create API client for MedusaJS integration

    - Create lib/medusa-client.ts using @medusajs/medusa-js SDK
    - Configure base URL and credentials handling
    - Create API wrapper functions for custom endpoints
    - Implement error handling and response transformation
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 11.3 Set up authentication context with Next.js

    - Create AuthContext using React Context API
    - Implement useAuth hook for accessing customer state
    - Store authentication state in cookies (httpOnly for security)
    - Create auth actions: login, register, logout, getCustomer
    - Handle token refresh and session management
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 11.4 Install and configure shadcn/ui components

    - Run `npx shadcn-ui@latest init` with Tailwind configuration
    - Install core shadcn/ui components: Button, Input, Card, Form, Dialog, Select, Tabs
    - Install additional components: Badge, Avatar, Dropdown Menu, Pagination, Toast
    - Configure theme colors and typography in tailwind.config.ts
    - Create components/ui directory with shadcn components
    - _Requirements: All UI-related requirements_

  - [ ] 11.5 Create shared layout components
    - Build Header component with navigation and user menu
    - Build Footer component with links and branding
    - Create Sidebar component for dashboard navigation
    - Build Container component for consistent page width
    - Style components using Tailwind utility classes
    - _Requirements: All UI-related requirements_

- [ ] 12. Build authentication pages with Next.js and shadcn/ui

  - [ ] 12.1 Create registration page

    - Create app/(auth)/register/page.tsx with Next.js App Router
    - Build registration form using shadcn/ui Form and Input components
    - Add account type selection (Buyer/Seller) using shadcn/ui Select
    - Implement form validation using React Hook Form and Zod
    - Connect to MedusaJS POST /store/auth/register endpoint
    - Handle success with redirect to dashboard
    - Display errors using shadcn/ui Toast component
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 12.2 Create login page

    - Create app/(auth)/login/page.tsx with form layout
    - Build login form using shadcn/ui Form components
    - Validate email and password fields with Zod
    - Connect to MedusaJS POST /store/auth endpoint
    - Store authentication cookie and update AuthContext
    - Redirect to dashboard on successful login
    - Show error messages using shadcn/ui Toast
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 12.3 Create protected route middleware
    - Implement Next.js middleware.ts for route protection
    - Check authentication cookie on protected routes
    - Redirect unauthenticated users to login page
    - Allow access to public routes without authentication
    - _Requirements: 4.2, 4.5_

- [ ] 13. Create user profile pages with Next.js

  - [ ] 13.1 Build Buyer profile page

    - Create app/(dashboard)/profile/page.tsx for Buyers
    - Build profile form using shadcn/ui Form, Input, and Textarea components
    - Add fields for company info, business type, location, contact details
    - Implement form submission to POST /store/profiles endpoint
    - Add edit mode toggle for updating existing profiles
    - Connect to PATCH /store/profiles/:id for updates
    - Style with Tailwind CSS for responsive layout
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ] 13.2 Build Seller profile page

    - Create Seller-specific profile page with ranking score display
    - Add shadcn/ui Badge component to show ranking prominently
    - Include product catalog section with link to products page
    - Use shadcn/ui Card components for organized layout
    - Connect to profile endpoints for data persistence
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 13.3 Create public profile view page
    - Create app/profiles/[customerId]/page.tsx for public viewing
    - Fetch profile data using Next.js Server Components
    - Display read-only profile information with shadcn/ui Card
    - Show product catalog for Sellers using shadcn/ui components
    - Display ranking score with visual indicator
    - Style with Tailwind for professional appearance
    - _Requirements: 2.3, 3.3_

- [ ] 14. Build product management UI with Next.js

  - [ ] 14.1 Create product listing page for Sellers

    - Create app/(dashboard)/products/page.tsx for Sellers
    - Fetch products using Next.js Server Components or TanStack Query
    - Display product grid using shadcn/ui Card components
    - Add "Create Product" button with shadcn/ui Button
    - Implement pagination using shadcn/ui Pagination component
    - Connect to GET /store/sellers/:sellerId/products endpoint
    - _Requirements: 3.2, 3.3_

  - [ ] 14.2 Create product creation and edit form

    - Create app/(dashboard)/products/new/page.tsx and edit/[id]/page.tsx
    - Build comprehensive form with shadcn/ui Form components
    - Add fields for title, description, specifications (JSON), price, category
    - Implement image upload with preview using shadcn/ui Input (file type)
    - Use React Hook Form with Zod validation
    - Connect to POST /store/products and PATCH /store/products/:id
    - Handle image upload to POST /store/products/:id/images
    - Style form with Tailwind grid layout
    - _Requirements: 3.2_

  - [ ] 14.3 Create product detail page
    - Create app/products/[id]/page.tsx for product viewing
    - Use Next.js Server Components for SEO-friendly rendering
    - Display product images in gallery using shadcn/ui Carousel or custom component
    - Show specifications in organized layout with shadcn/ui Tabs
    - Add "Create Pitch" button for Buyers using shadcn/ui Button
    - Fetch product from GET /store/products/:id endpoint
    - Style with Tailwind for responsive design
    - _Requirements: 3.3, 6.1_

- [ ] 15. Implement search and discovery UI with Next.js

  - [ ] 15.1 Create search page with filters

    - Create app/search/page.tsx with search interface
    - Build search input using shadcn/ui Input with search icon
    - Create filter sidebar with shadcn/ui Select, Slider, and Checkbox components
    - Add category, location, price range, and ranking score filters
    - Implement sorting dropdown using shadcn/ui Select
    - Use Next.js searchParams for URL-based filter state
    - Style with Tailwind responsive grid layout
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

  - [ ] 15.2 Build search results display

    - Create result cards using shadcn/ui Card components
    - Display product/supplier info with images, price, location, ranking
    - Implement grid/list view toggle using shadcn/ui Tabs
    - Add pagination using shadcn/ui Pagination component
    - Connect to GET /store/search/products and /store/search/suppliers
    - Use TanStack Query for client-side data fetching and caching
    - Update results dynamically when filters change
    - _Requirements: 8.2, 8.5_

  - [ ] 15.3 Add search facets display
    - Create facets sidebar showing category, location, price range counts
    - Use shadcn/ui Badge components to display facet counts
    - Make facets clickable to apply filters
    - Update facets based on current search results
    - Style with Tailwind for clean, organized appearance
    - _Requirements: 8.3, 8.4_

- [ ] 16. Create pitch management UI with Next.js

  - [ ] 16.1 Build pitch creation dialog

    - Create pitch creation modal using shadcn/ui Dialog component
    - Trigger dialog from product detail page
    - Build form with fields for quantity, target price, initial message
    - Use shadcn/ui Form, Input, and Textarea components
    - Validate with React Hook Form and Zod
    - Connect to POST /store/pitches endpoint
    - Show success toast and navigate to pitch detail page
    - _Requirements: 6.1_

  - [ ] 16.2 Create pitch detail page with messaging

    - Create app/(dashboard)/pitches/[id]/page.tsx
    - Display pitch header with product, parties, status using shadcn/ui Card
    - Build message thread with scrollable container
    - Style messages with Tailwind (different styles for buyer/seller)
    - Add message input using shadcn/ui Textarea and Button
    - Connect to GET /store/pitches/:id and POST /store/pitches/:id/messages
    - Use TanStack Query for real-time updates
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ] 16.3 Implement proposal submission interface

    - Add proposal form within pitch detail page using shadcn/ui Dialog
    - Include fields for price, quantity, terms using shadcn/ui Form components
    - Display proposal history in timeline format with shadcn/ui Card
    - Show proposal status with shadcn/ui Badge (Pending, Accepted, Superseded)
    - Connect to POST /store/pitches/:id/proposals endpoint
    - Update UI optimistically with TanStack Query mutations
    - _Requirements: 6.2, 6.3_

  - [ ] 16.4 Create pitch closure interface

    - Add "Close Pitch" button using shadcn/ui Button (primary variant)
    - Build confirmation dialog using shadcn/ui Dialog
    - Display agreed terms summary in dialog
    - Add final confirmation step before closing
    - Connect to POST /store/pitches/:id/close endpoint
    - Show success message and update pitch status
    - Navigate to supplier relationships page after closure
    - _Requirements: 6.4_

  - [ ] 16.5 Build pitch list page
    - Create app/(dashboard)/pitches/page.tsx for pitch overview
    - Display pitch cards using shadcn/ui Card components
    - Show status badges using shadcn/ui Badge (Open, In Negotiation, Closed)
    - Add filter tabs for status using shadcn/ui Tabs
    - Display product thumbnail, other party info, and last activity
    - Connect to GET /store/pitches/buyer or /store/pitches/seller
    - Implement pagination with shadcn/ui Pagination
    - Style with Tailwind responsive grid
    - _Requirements: 6.5_

- [ ] 17. Build supplier relationship UI with Next.js

  - [ ] 17.1 Create supplier list page for Buyers

    - Create app/(dashboard)/suppliers/page.tsx
    - Display supplier cards using shadcn/ui Card components
    - Show company name, contact info, relationship date
    - Add quick action buttons using shadcn/ui Button
    - Connect to GET /store/buyers/:buyerId/suppliers endpoint
    - Implement search and filter for supplier list
    - Style with Tailwind grid layout
    - _Requirements: 7.2, 7.4_

  - [ ] 17.2 Create supplier relationship detail page
    - Create app/(dashboard)/suppliers/[id]/page.tsx
    - Display complete supplier information using shadcn/ui Card
    - Show agreed terms in organized sections
    - Display transaction history using shadcn/ui Table component
    - Add contact actions (email, phone) using shadcn/ui Button
    - Connect to GET /store/supplier-relationships/:relationshipId
    - Style with Tailwind for professional layout
    - _Requirements: 7.3, 7.5_

- [ ] 18. Implement subscription management UI with Next.js

  - [ ] 18.1 Create subscription plan selection page

    - Create app/(dashboard)/subscription/page.tsx
    - Display plan cards using shadcn/ui Card components
    - Highlight plan differences with shadcn/ui Badge
    - Show pricing prominently with Tailwind typography
    - Add "Select Plan" buttons using shadcn/ui Button
    - Connect to GET /store/subscription-plans endpoint
    - Style with Tailwind for pricing page layout
    - _Requirements: 9.1, 9.3_

  - [ ] 18.2 Build subscription activation flow

    - Create confirmation dialog using shadcn/ui Dialog
    - Display plan details and pricing summary
    - Add payment information section (placeholder for MVP)
    - Connect to POST /store/subscriptions endpoint
    - Show success message using shadcn/ui Toast
    - Update user's subscription status in AuthContext
    - Redirect to dashboard after activation
    - _Requirements: 9.2, 9.4_

  - [ ] 18.3 Add subscription status display in dashboard
    - Create dashboard widget using shadcn/ui Card
    - Show current plan name and expiry date
    - Display trade count with progress bar using Tailwind
    - Show progress toward next tier with visual indicator
    - Add "Upgrade Plan" button if applicable using shadcn/ui Button
    - Fetch data from GET /store/subscriptions/me endpoint
    - _Requirements: 9.5_

- [ ] 19. Add error handling and loading states to Next.js app

  - [ ] 19.1 Create error boundary and error pages

    - Create app/error.tsx for error boundary
    - Create app/not-found.tsx for 404 pages
    - Display user-friendly error messages with shadcn/ui Alert
    - Add retry button using shadcn/ui Button
    - Style error pages with Tailwind
    - _Requirements: All requirements_

  - [ ] 19.2 Implement loading states throughout app

    - Create loading.tsx files for route segments
    - Build skeleton components using Tailwind animate-pulse
    - Show loading spinners using shadcn/ui custom spinner or Lucide icons
    - Implement suspense boundaries for async components
    - Add loading states to buttons during form submission
    - _Requirements: All requirements_

  - [ ] 19.3 Set up toast notification system
    - Configure shadcn/ui Toaster component in root layout
    - Create useToast hook for showing notifications
    - Display success toasts for actions (profile update, pitch creation, etc.)
    - Show error toasts for failed operations
    - Configure auto-dismiss after 5 seconds
    - Style toasts with Tailwind for consistency
    - _Requirements: All requirements_

- [ ] 20. Implement API documentation and backend error handling

  - [ ] 20.1 Create OpenAPI documentation for MedusaJS

    - Install and configure Swagger plugin for MedusaJS
    - Document all custom API endpoints with request/response schemas
    - Include authentication requirements and error responses
    - Set up Swagger UI at /docs endpoint
    - Document custom entities and DTOs
    - _Requirements: All requirements_

  - [ ] 20.2 Implement centralized error handling in MedusaJS

    - Create custom error classes extending MedusaError
    - Implement error handler middleware for custom routes
    - Return consistent error response format
    - Log errors using MedusaJS logger with appropriate severity
    - Handle validation errors from Zod schemas
    - _Requirements: All requirements_

  - [ ] 20.3 Add request validation to custom endpoints
    - Create Zod schemas for all custom endpoint inputs
    - Implement validation middleware using Zod
    - Validate request body, query parameters, and path parameters
    - Return detailed validation errors to client
    - Document validation rules in OpenAPI spec
    - _Requirements: All requirements_

- [ ] 21. Implement security measures in MedusaJS

  - [ ] 21.1 Configure rate limiting

    - Install and configure rate limiting middleware
    - Set limit to 100 requests per minute per IP
    - Apply to all custom API endpoints
    - Return 429 status code when limit exceeded
    - Configure Redis for rate limit storage
    - _Requirements: 4.1, 4.2_

  - [ ] 21.2 Configure CORS and security headers

    - Configure CORS in medusa-config.js with allowed origins
    - Add security headers using helmet middleware
    - Configure Content Security Policy for Next.js frontend
    - Set secure cookie options for authentication
    - Enable HTTPS in production configuration
    - _Requirements: All requirements_

  - [ ] 21.3 Implement input sanitization
    - Sanitize all user inputs to prevent XSS attacks
    - Use parameterized queries (TypeORM default) to prevent SQL injection
    - Validate file uploads for type, size, and content
    - Implement CSRF protection for state-changing operations
    - Add input length limits to prevent DoS attacks
    - _Requirements: All requirements_

- [ ] 22. Set up logging and monitoring for MedusaJS

  - [ ] 22.1 Configure application logging

    - Use MedusaJS built-in logger (Winston-based)
    - Configure log levels for different environments
    - Log all API requests and responses
    - Log errors with stack traces and context
    - Implement log rotation for file-based logs
    - Configure structured logging for easier parsing
    - _Requirements: 5.1, 5.2_

  - [ ] 22.2 Add pseudonymization to logs
    - Create logging middleware to intercept log messages
    - Replace customer IDs with pseudonymous identifiers
    - Ensure no PII is logged in plain text
    - Store pseudonymization mapping securely
    - Document pseudonymization process
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 23. Create deployment configuration

  - [ ] 23.1 Create Dockerfile for MedusaJS backend

    - Create multi-stage Dockerfile for Node.js backend
    - Optimize image size using alpine base image
    - Configure environment variables
    - Set up health check endpoint
    - Configure production build process
    - _Requirements: All requirements_

  - [ ] 23.2 Create Dockerfile for Next.js frontend

    - Create Dockerfile for Next.js with standalone output
    - Build production-optimized bundle
    - Configure environment variables for runtime
    - Set up health check endpoint
    - Optimize image size and build time
    - _Requirements: All requirements_

  - [ ] 23.3 Create Docker Compose for local development
    - Configure services for MedusaJS, Next.js, PostgreSQL, and Redis
    - Set up volume mounts for hot reloading
    - Configure networking between services
    - Add environment variable files
    - Create initialization scripts for database setup
    - Document setup and usage in README
    - _Requirements: All requirements_
