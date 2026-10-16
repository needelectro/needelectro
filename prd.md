# NEED ELECTRO Product Requirements Document

## 1. Product Overview

NEED ELECTRO is a Bangladesh focused electrical and technological
solutions ecosystem. The platform combines professional services,
technology products, technician work opportunities, warranty support,
customer support, training, and future ERP integration.

The product will initially be delivered as a responsive website and
Progressive Web App (PWA), backed by a shared API and database.

## 2. Brand Information

**Company:** NEED ELECTRO\
**Tagline:** Trusted Electrical and Technological Solutions\
**Founded:** 2023\
**Main Branch:** Moulvibazar, Bangladesh\
**Address:** Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200\
**Phone:** 01733-983752\
**Email:** needelectro23@gmail.com\
**Website:** www.needelectro.store\
**Organization:** Sister concern of Amdads Group

## 3. Product Goals

1.  Allow customers to discover and book electrical and technical
    services.
2.  Allow customers to purchase electrical and technology products.
3.  Allow technicians to register, become verified, discover jobs,
    accept work, and earn.
4.  Provide order, booking, warranty, payment, support, and review
    management.
5.  Provide administrators with complete operational control.
6.  Prepare the platform for integration with NEED ELECTRO ERP.
7.  Build an architecture that can expand from Moulvibazar to
    Bangladesh-wide operations.

## 4. Core User Types

### Customer

Customers can create accounts, book services, buy products, track orders
and bookings, manage devices and warranties, submit reviews, and contact
support.

### Technician

Technicians can register independently, submit verification documents,
create professional profiles, define skills and service areas, receive
available jobs, accept work, update job status, and manage earnings.

### Staff

Staff roles may include service manager, sales manager, inventory
manager, accountant, support agent, and training manager.

### Admin

Admins manage customers, technicians, services, products, bookings,
orders, warranties, support, payments, commissions, and operational
settings.

### Super Admin

Super Admin has full platform control and manages permissions and
critical configuration.

## 5. Core Modules

### Service Marketplace

Service categories include electrical work, house wiring, installation,
troubleshooting, CCTV, computer services, networking, smart electrical
solutions, maintenance, and emergency services.

### Booking

Customers select a service, describe the problem, provide location,
choose a preferred date and time, upload supporting media, and submit a
booking.

### Technician Marketplace

Verified technicians can discover suitable jobs based on skills, service
area, availability, verification status, and other matching rules.

### Product Marketplace

Products include laptops, computers, accessories, CCTV equipment,
networking products, electrical products, smart devices, gadgets, and
related technology products.

### Orders

Customers can add products to cart, checkout, pay, and track orders.

### Warranty

Products can be associated with serial numbers, invoices, warranty
periods, service history, and warranty claims.

### Customer Support

Customers and technicians can create support tickets and disputes.

### Reviews

Customers can review completed services and technicians.

### Notifications

The platform supports in-app notification architecture and can later
connect email, SMS, and push notifications.

### ERP Integration

The platform must be designed for synchronization with NEED ELECTRO ERP
for inventory, sales, cash, payments, expenses, warranty, customers,
technicians, and reporting.

## 6. Customer Requirements

Customers must be able to:

-   Register and log in.
-   Manage profile and addresses.
-   Search products and services.
-   Book services.
-   Upload photos and other permitted media.
-   Track booking status.
-   View technician information after appropriate assignment.
-   Purchase products.
-   Track orders.
-   View invoices.
-   Register and view devices.
-   Check warranties.
-   Submit warranty claims.
-   Submit reviews.
-   Open support tickets.
-   Receive notifications.

## 7. Technician Requirements

Technicians must be able to:

-   Register as independent service providers.
-   Submit identity and professional information.
-   Upload verification documents.
-   Define skills and service areas.
-   Set availability.
-   Receive verification status.
-   View eligible available jobs.
-   Accept or decline jobs.
-   Update job status.
-   Record completion information.
-   View earnings.
-   View wallet transactions.
-   Receive ratings.
-   Contact support.

Only verified and active technicians can accept customer jobs.

## 8. Booking Lifecycle

`Available → Accepted → Confirmed → On The Way → Arrived → Work Started → Work Completed → Customer Confirmed → Payment Completed → Closed`

Every transition must be recorded with actor, timestamp, and relevant
notes.

## 9. Product Order Lifecycle

`Order Placed → Payment Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered`

Alternative terminal states include `Cancelled`, `Returned`, and
`Refunded`.

## 10. Technician Earnings

The system must calculate technician earnings from completed jobs
according to configurable rules.

Supported commission models:

-   Percentage
-   Fixed amount
-   Service-specific
-   Technician-level

The system must maintain an immutable transaction history for financial
events.

## 11. Warranty Requirements

A warranty record should support:

-   Product
-   Serial number
-   Customer
-   Invoice
-   Purchase date
-   Warranty start
-   Warranty end
-   Status
-   Claims
-   Service history

## 12. Business Requirements

The system should support:

-   Multiple branches in the future.
-   Multiple service areas.
-   Configurable service prices.
-   Configurable technician commissions.
-   Inventory synchronization.
-   Financial synchronization.
-   Role-based access control.
-   Audit logging.
-   Bangladesh currency and address conventions.
-   English initially, with architecture ready for Bangla.

## 13. Non-Functional Requirements

The platform must be:

-   Secure
-   Responsive
-   Mobile-first
-   Accessible
-   Fast
-   SEO friendly
-   Maintainable
-   Scalable
-   API driven
-   PWA compatible

## 14. Success Criteria

The initial product is successful when:

1.  A customer can register and book a service end to end.
2.  A technician can register, be verified, accept a job, and complete
    it.
3.  A customer can purchase a product and track the order.
4.  Warranty information can be stored and retrieved.
5.  Admins can manage the entire operational workflow.
6.  Critical financial and operational actions are auditable.
7.  The same backend supports both web and PWA experiences.
8.  The architecture can connect to NEED ELECTRO ERP without rebuilding
    the core platform.
