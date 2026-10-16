# NEED ELECTRO - Electrical & Technological Solutions Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)

**NEED ELECTRO** is a comprehensive electrical and technological solutions ecosystem in Bangladesh, combining on-demand professional technician services, an electronics e-commerce store, real-time booking and order tracking, warranty management, and administrative control.

Sister concern of **Amdads Group**.

---

## ⚡ Key Features

- **Service Booking System**: Multi-step booking for AC repair, electrical wiring, home appliance diagnostics, CCTV installation, and industrial electrical setups.
- **E-Commerce Store**: Product catalog with category filtering, cart management, instant checkout, and bKash / Nagad / Rocket / Cash-on-Delivery payment flows.
- **Technician Network**: Independent technician onboarding, document verification, job alerts, status updates, and payout management.
- **Role-Based Portals**:
  - **Customer Portal**: Booking history, orders, warranty claims, and profile settings.
  - **Technician Portal**: Active assignments, job status workflows, and earnings.
  - **Admin Control Center**: Operations dashboard for orders, bookings, verification approvals, technician allocation, and inventory management.
- **Progressive Web App (PWA)**: Installable on Android, iOS, and desktop with offline support and push notification capabilities.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (local development) / PostgreSQL (production)
- **Authentication**: JWT token-based authentication with bcrypt password hashing

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/needelectro/need-electro.git
   cd need-electro
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
   Update the configuration parameters as needed.

4. **Initialize Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
├── prisma/               # Prisma schema and seed scripts
├── public/               # Static assets, icons, manifest.json
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── (auth)/       # Authentication pages (login, register)
│   │   ├── (main)/       # Public storefront, services, cart, checkout
│   │   ├── admin/        # Administrator management portal
│   │   ├── customer/     # Customer dashboard
│   │   ├── technician/   # Technician workspace
│   │   └── api/          # RESTful backend API routes
│   ├── components/       # Reusable UI and layout components
│   └── lib/              # Database client, auth utilities, and helpers
├── architecture.md       # Technical architecture specification
├── design.md             # UI/UX design guidelines
├── phases.md             # Project roadmap and implementation phases
├── prd.md                # Product Requirements Document
└── rules.md              # Engineering rules and coding standards
```

---

## 🏢 Business & Contact Information

- **Headquarters & Diagnostic Hub**: Kusumbag Point, Moulvibazar Sadar, Moulvibazar 3200, Bangladesh
- **Nationwide Coverage**: Insured courier delivery & certified technician dispatch across all 64 districts in Bangladesh
- **Hotline & WhatsApp**: +880 1733 983752
- **Email**: needelectro23@gmail.com
- **Official Website**: [www.needelectro.store](https://www.needelectro.store)

