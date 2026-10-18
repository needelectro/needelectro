# NEED ELECTRO — Trusted Electrical and Technological Solutions

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-104%20Passing-brightgreen?style=flat)](https://github.com/needelectro/needelectro)

**NEED ELECTRO** is Bangladesh's certified service-first electrical and technological marketplace. We connect residential, commercial, and industrial clients with trade-tested, background-verified electricians, AC technicians, CCTV installers, and appliance repair experts across all 64 districts.

Sister concern of **Amdads Group**.  
**Tagline:** *Trusted Electrical and Technological Solutions*

---

## ⚡ Core Architecture & Capabilities

### 1. Service-First Focus
- **Hero & Information Architecture**: Primary navigation and mobile app experience prioritize **Home**, **Services**, **Book a Service**, **My Bookings**, **Technician Portal**, **Admin Dispatch Board**, and **Support**.
- **Secondary Parts & Materials**: E-commerce products are de-emphasized into a dedicated spare parts & materials catalog at `/parts`, controlled via `FEATURE_FLAGS.ENABLE_SHOP` (reads `NEXT_PUBLIC_ENABLE_SHOP="true"`).

### 2. End-to-End Service Booking Lifecycle
```
DRAFT → REQUESTED → QUOTED → CONFIRMED → ASSIGNED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED → PAID → CLOSED
(Also handles: CANCELLED, DISPUTED, REFUNDED)
```
- **Instant Estimation & Quotes**: Immediate quotation with itemized labor and preliminary estimates upon booking creation.
- **Dynamic Dispatch**: Admin dispatch board and automated marketplace matching for local verified technicians.
- **Parts Recording**: Technicians add replacement parts and materials directly during job execution.
- **Service Invoicing**: Real-time generation of `ServiceInvoice` combining labor and verified parts costs.
- **30-Day Workmanship Warranty**: Automatic `ServiceWarranty` created upon job completion with nationwide warranty tracking via invoice and booking number.
- **Verified Customer Reviews**: Ratings and reviews strictly permitted only on completed bookings, directly updating technician trust scores.

### 3. Modern Customer Profile & Accounts
- **Dual-Context Architecture**: Standalone route (`/customer/profile`) and embedded dashboard tab (`/customer/dashboard?tab=profile`) sharing the unified `CustomerProfileView` component.
- **Complete Identity Control**: Personal information management (name, phone, email, join date, verified customer ID badge), password change security modal with bcrypt verification, and default delivery address management.
- **Strict Role Separation**: Route boundary guards enforce complete separation between Customer and Technician portals.

### 4. Mobile Ergonomics & Service Showcase
- **Compact 2-Column Grid**: Mobile homepage service cards optimized with a 50% height reduction (`grid-cols-2`, square aspect ratio, compact typography, dual mini action buttons) matching the `/services` catalog.
- **PWA Experience**: Installable mobile app with offline fallback, touch-first bottom navigation (`MobileNav.tsx`), and zero-wait edge caching headers.

### 5. Technician Economics
- **85% Revenue Share**: 85% of labor amount credited directly to technician digital wallet upon job completion.
- **15% Platform Commission**: Automated platform fee accounting and transparent wallet transaction logs.
- **Technician Portal**: Job acceptance board, status updates, photo evidence, and earnings withdrawal requests.

### 6. Nationwide Coverage
- **64 Districts & Thanas**: Structured coverage across all 8 administrative divisions of Bangladesh.
- **Delivery Calculation Engine**: Automated regional delivery charges based on division/district destination.
- **Local SEO & Schema.org**: Dedicated location landing pages (`/services/[slug]/[location]`) with `LocalBusiness`, `Service`, and `AggregateRating` JSON-LD schemas.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (local development) / PostgreSQL (production)
- **Authentication**: JWT token-based authentication with bcrypt password hashing
- **PWA**: Offline technician job caching and push notifications

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/needelectro/needelectro.git
   cd needelectro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   To toggle public standalone e-commerce catalog:
   ```bash
   NEXT_PUBLIC_ENABLE_SHOP=false  # Service-first mode (default)
   ```

4. **Initialize Database & Seed**:
   ```bash
   npm run db:push
   node prisma/seed.mjs
   ```

5. **Run Automated Test Suite**:
   ```bash
   node --test tests/*.test.mjs
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
├── prisma/
│   ├── schema.prisma       # Service-first data model (Booking, Quote, Warranty, Parts, etc.)
│   ├── migrations/         # Non-destructive SQL migration scripts
│   └── seed.mjs            # Production service-first demo seed data
├── src/
│   ├── app/
│   │   ├── api/v1/         # REST APIs (bookings, quotes, parts, payments, warranty)
│   │   ├── booking/        # Multi-step service booking wizard
│   │   ├── services/       # Service catalog & SEO location pages
│   │   ├── parts/          # Secondary spare parts & materials catalog
│   │   ├── customer/       # Customer portal, profile (/customer/profile) & bookings tracking
│   │   ├── technician/     # Technician job board & wallet earnings
│   │   └── admin/          # Admin dispatch board & operations center
│   ├── components/         # Reusable responsive UI components (Profile, Header, Cards)
│   └── lib/                # Feature flags, auth, database client, national data
└── tests/                  # 104 automated test cases (lifecycle, economics, profile, cache, portal RBAC)
```

---

## 📄 License

Proprietary © NEED ELECTRO. All rights reserved.
Part of **Amdads Group**.
