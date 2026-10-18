# NEED ELECTRO System Architecture

## 1. Architecture Objective

Build NEED ELECTRO as a modular, API-first platform with a shared
backend for the public website, customer PWA, technician experience, and
administration.

The architecture must avoid duplicated business logic and must remain
ready for future ERP and nationwide expansion.

## 2. High-Level Architecture

``` text
Customer Web / PWA
        |
Technician PWA
        |
Admin Web
        |
        v
   NEED ELECTRO API
        |
  -----------------------
  |     |      |       |
Auth  Services Orders Payments
  |     |      |       |
  -----------------------
        |
   PostgreSQL
        |
  Object Storage
        |
 External Integrations
        |
 NEED ELECTRO ERP
```

### Production Stack

-   **Frontend & API Engine**: Next.js 15 (App Router, Server & Client Components)
-   **UI Library**: React 19, Tailwind CSS 3.4, Lucide React
-   **Database & ORM**: Prisma 6.3 with Supabase PostgreSQL (Port 6543 Transaction Pooler with PgBouncer)
-   **Authentication**: JWT token-based auth with bcryptjs password hashing and role-based access control
-   **Caching & State**: Client-side warm cache (`initWarmCache`) + Optimistic UI state updates
-   **PWA**: Offline technician job caching, service worker (`sw.js`), and Web App Manifest

### Storage

Use secure object storage for:

-   Product images
-   Service images
-   Technician documents
-   Customer-uploaded service media
-   Invoices and permitted files

Sensitive files must use protected access.

## 4. Backend Modules

Recommended NestJS modules:

``` text
auth
users
customers
technicians
services
bookings
products
inventory
orders
payments
warranty
reviews
support
notifications
wallet
earnings
disputes
branches
training
analytics
admin
audit
erp
```

Each module should own its business logic and data access boundaries.

## 5. API Structure

Use versioned APIs:

``` text
/api/v1/auth
/api/v1/users
/api/v1/customers
/api/v1/technicians
/api/v1/services
/api/v1/bookings
/api/v1/products
/api/v1/orders
/api/v1/payments
/api/v1/warranty
/api/v1/reviews
/api/v1/support
/api/v1/notifications
/api/v1/wallet
/api/v1/earnings
/api/v1/admin
/api/v1/branches
/api/v1/analytics
/api/v1/erp
```

Swagger documentation should be generated from DTOs and controllers.

## 6. Database Core Entities

Primary entities include:

-   Users
-   Roles
-   Permissions
-   Customers
-   Technicians
-   Employees
-   Services
-   Service Categories
-   Bookings
-   Booking Status History
-   Products
-   Product Categories
-   Brands
-   Product Variants
-   Serial Numbers
-   Inventory
-   Orders
-   Order Items
-   Payments
-   Invoices
-   Warranties
-   Warranty Claims
-   Reviews
-   Addresses
-   Support Tickets
-   Notifications
-   Technician Earnings
-   Wallet Transactions
-   Disputes
-   Documents
-   Training Courses
-   Certificates
-   Branches
-   Service Areas
-   Coupons
-   Promotions
-   Audit Logs

## 7. Authentication

Authentication must be centralized.

Support:

-   Email/password
-   Phone authentication where implemented
-   Password reset
-   Email verification
-   Secure session handling

Authorization must be enforced server-side.

## 8. Roles and Permissions

Roles:

-   Customer
-   Technician
-   Service Manager
-   Sales Manager
-   Inventory Manager
-   Accountant
-   Support Agent
-   Training Manager
-   Admin
-   Super Admin

Use permission-based authorization rather than hardcoding role checks
throughout the application.

## 9. Booking Matching

The technician matching service should evaluate:

-   Required skills
-   Verification status
-   Service area
-   Availability
-   Distance where location is available
-   Current workload
-   Service eligibility

Job acceptance must use transactional database logic so two technicians
cannot successfully claim the same job.

## 10. Financial Integrity

Financial records should use immutable transaction principles.

Do not let ordinary users edit completed payment records.

Wallet balances should be derived from transaction records or updated
through controlled transactional operations.

Every adjustment requires an audit trail.

## 11. ERP Integration

NEED ELECTRO ERP should eventually synchronize:

-   Customers
-   Products
-   Inventory
-   Orders
-   Sales
-   Bookings
-   Technicians
-   Warranty
-   Payments
-   Cash transactions
-   Expenses
-   Invoices
-   Reports

Use an explicit integration layer rather than directly coupling every
module to ERP internals.

Where appropriate, use webhooks, scheduled synchronization, idempotency
keys, and reconciliation processes.

## 12. PWA Architecture

Provide:

-   `manifest.webmanifest`
-   Service worker
-   Offline fallback
-   Installability
-   App icons
-   Caching strategy
-   Push notification foundation

Do not cache sensitive private data indiscriminately.

## 13. File Upload Architecture

Uploads must be validated for:

-   File type
-   File size
-   MIME type
-   Authorization
-   Storage location

Use private storage for:

-   NID
-   Technician documents
-   Private customer media
-   Sensitive invoices

Use signed URLs for authorized access where required.

## 14. Observability

Implement:

-   Structured application logs
-   Error tracking
-   Audit logs
-   API request tracing where practical
-   Critical business event logs

Do not log passwords, payment credentials, or sensitive identity
information.

## 15. Scalability

Design for future:

-   Multiple branches
-   More technicians
-   More service areas
-   More products
-   Third-party sellers
-   Multiple languages
-   Bangladesh-wide operation

Use pagination, database indexes, caching, and efficient queries from
the beginning.

## 16. Deployment

Production deployment model:

-   Next.js frontend and API routes on Vercel Edge/Serverless.
-   Database on Supabase PostgreSQL (Singapore/Sydney region) using Port 6543 Transaction Pooler.
-   Automated keep-alive cron endpoint (`/api/v1/keep-alive`) to prevent serverless database cold starts.
-   Environment configuration via Vercel secrets and `.env`.

## 17. Customer Profile Dual-Context Architecture

The customer profile employs a dual-context presentation pattern:

-   **Standalone Route**: `/customer/profile` for deep links from header navigation, profile dropdown, and mobile navigation drawer.
-   **Embedded Dashboard Tab**: `/customer/dashboard?tab=profile` allowing fluid tab switching within the customer dashboard.
-   **Unified Component**: `src/components/profile/CustomerProfileView.tsx` accepts an `isStandalonePage` boolean flag to adapt its container styling, header presentation, and internal tab routes without code duplication.
-   **Identity & Security**: Real customer ID generation (`NE-CUST-[ID]`), authentic account creation date from `/api/v1/auth/me`, editable contact attributes, and dedicated bcrypt-verified password modal.

## 18. Zero-Wait Performance & Caching Strategy

To deliver an instantaneous experience on high-latency mobile networks in Bangladesh:

-   **Client Warm Cache**: `src/lib/cache.ts` provides `initWarmCache()` to pre-fill in-memory data before remote responses arrive.
-   **Fast Fetch (`fastFetch`)**: In-flight deduplication and cache-first retrieval for frequently requested datasets.
-   **Optimistic UI Updates**: State transitions (e.g. technician status changes, address updates) render immediately with automatic rollback on network failure.
-   **Database Indexes**: Composite and targeted indexes on foreign keys (`userId`, `technicianId`, `bookingId`), status enums, and timestamp fields.

## 19. Strict Portal & Role Separation Middleware

To guarantee security and eliminate customer/technician confusion:

-   **Boundary Enforcement**: Middleware and layout guards redirect technicians attempting to access customer routes (`/customer/*`, `/cart`, `/checkout`, `/booking`) to `/technician/dashboard`.
-   **Customer Boundary**: Customers attempting to view `/technician/*` or `/admin/*` are strictly bounced to `/auth/login` or their respective dashboard.
-   **API Isolation**: API routes enforce role checks on decoded JWTs, forbidding technician accounts from placing orders or booking services directly.
