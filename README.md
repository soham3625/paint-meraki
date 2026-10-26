# 🎨 paint_n_meraki — Handcrafted Resin Art & Luxury Home Decor E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-764ABC?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Security](https://img.shields.io/badge/Auth-BcryptJS_Session-green?style=for-the-badge)](https://github.com/dcodeIO/bcrypt.js)

A production-ready, luxury e-commerce and bespoke order management platform built for **paint_n_meraki** — an artisanal resin art and handcrafted home decor brand founded by artist **Astha Patel**. 

The platform combines a customer storefront with a **16-Module Admin Management Panel**, real-time UPI and Cash-on-Delivery payment handling, multi-size product customization, custom order commission tracking, role-based access control, and a resilient dual-layer data architecture.

> 🗺️ **Visual Graph & Structure View**: [**`WEBSITE_STRUCTURE_GRAPH.md`**](./WEBSITE_STRUCTURE_GRAPH.md)  
> 📖 **Comprehensive Architecture & Sitemap Guide**: [**`WEBSITE_OVERVIEW.md`**](./WEBSITE_OVERVIEW.md)  

---

## 📑 Table of Contents

- [✨ Comprehensive Feature Matrix](#-comprehensive-feature-matrix)
  - [1. Customer Storefront](#1-customer-storefront)
  - [2. Professional Admin Control Center (16 Modules)](#2-professional-admin-control-center-16-modules)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project & Directory Structure](#-project--directory-structure)
- [🧠 Unified Resilient Database Architecture](#-unified-resilient-database-architecture)
- [📊 Database Schema & Prisma Models](#-database-schema--prisma-models)
- [🔌 REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [🔑 Admin Access & Authentication](#-admin-access--authentication)
- [⚡ Getting Started (Local Setup)](#-getting-started-local-setup)
- [🚀 Production Build & Deployment](#-production-build--deployment)

---

## ✨ Comprehensive Feature Matrix

### 1. Customer Storefront

- **Luxury Brand Experience**: Warm artisanal dark & gold luxury color palette, Google Fonts typography, glassmorphic headers, smooth carousel transitions, and responsive mobile navigation.
- **Dynamic Product Catalog (`/shop`, `/shop/[category]`)**:
  - Filter by Categories: *Resin Clocks*, *Pooja Thalis*, *Preservation Frames*, *Hanging Decor*, *Coasters*.
  - Multi-facet filters: Price range, in-stock availability, featured items, best sellers, and sort order.
  - Slide-over real-time search with instant keyword suggestions.
- **Bespoke Product Details (`/product/[slug]`)**:
  - High-resolution multi-angle image gallery with interactive thumbnail selector.
  - Multi-size variant picker (e.g. 10", 12", 16", 20") with automatic dynamic price updates.
  - Custom inscription and name personalization text inputs.
  - Detailed material specifications, base dimensions, and care instructions.
  - Add to Cart & instant "Buy Now" direct checkout flow.
- **Bespoke Custom Order Engine (`/custom-order`)**:
  - Commission creation wizard for custom wedding preservation, anniversary clocks, and luxury nameplates.
  - High-res photo upload engine (up to 10MB) for reference art and personal memories.
  - Budget preference, dimension requirements, color themes, and special instructions.
  - Direct WhatsApp order inquiry integration.
- **Interactive Shopping Cart (`/cart`)**:
  - Zustand-powered state with `localStorage` client persistence.
  - Real-time subtotal recalculation and quantity adjustments.
  - Dynamic **Free Shipping Progress Meter** (Free delivery on orders above ₹2,000).
  - Promo code validation engine with instant discount calculation.
- **Frictionless Checkout (`/checkout`)**:
  - Full Indian postal address capture (Address, City, State, Pincode, Landmark).
  - **UPI QR & UPI ID**: Displays merchant UPI ID (`paintmeraki@upi`), payment QR code, and UTR transaction reference capture.
  - **Cash on Delivery (COD)**: Configurable thresholds & optional COD convenience fees.
- **Order Tracking & Confirmation (`/order-success`, `/track-order`)**:
  - Detailed order confirmation screen with itemized invoice card.
  - One-click WhatsApp order confirmation broadcast pre-filled with order summary.
  - Self-service order lookup tool by Order # (e.g., `PM1001`) and mobile number.
- **Customer Portal & Wishlist (`/account`, `/wishlist`)**:
  - Customer registration, login, profile management, and saved order history.
  - Persistent saved items wishlist across browser sessions.

---

### 2. Professional Admin Control Center (16 Modules)

Located under `/admin`, the administrative console delivers complete control over all business operations:

| # | Admin Module | Route | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **1** | **Master KPI Dashboard** | `/admin` | Live revenue, total orders, custom requests, active customers, order status breakdown, and recent orders. |
| **2** | **Product Catalog** | `/admin/products` | Browse, search, filter by category/stock, toggle active visibility, and inline price edits. |
| **3** | **Product Creator** | `/admin/products/new` | Rich multi-step form for creating new products with multiple size options, images, and material specs. |
| **4** | **Product Editor** | `/admin/products/[id]/edit` | Full catalog item editor with image gallery management, variant prices, and SEO tags. |
| **5** | **Category Manager** | `/admin/categories` | Add and update product categories with custom slugs, banners, and descriptions. |
| **6** | **Order Processing** | `/admin/orders` | Filter by status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`) and payment mode. |
| **7** | **Order Inspector & Dispatch** | `/admin/orders/[id]` | Inspect item details, custom inscriptions, mark payment verified, and assign courier tracking numbers. |
| **8** | **Custom Bespoke Orders** | `/admin/custom-orders` | View reference photos, manage 7-stage workflow (`NEW` ➔ `COMPLETED`), and launch WhatsApp chats. |
| **9** | **Coupons & Discounts** | `/admin/coupons` | Create percentage / fixed coupons, set min orders, max discounts, expiry dates, and usage limits. |
| **10** | **Customer Reviews** | `/admin/reviews` | Moderate customer feedback, view star ratings, and toggle `APPROVED` status for storefront display. |
| **11** | **Promotional Banners** | `/admin/banners` | Manage hero sliders and promotional banners with custom CTA links and mobile/desktop image URLs. |
| **12** | **Customer Directory** | `/admin/customers` | View customer order counts, lifetime value (LTV), phone numbers, and WhatsApp contact shortcuts. |
| **13** | **Inventory Control** | `/admin/inventory` | Stock level tracking, low-stock visual warning badges, and quick stock count modifiers. |
| **14** | **Homepage CMS** | `/admin/homepage-config` | Edit hero headlines, subheadings, hero imagery, and select featured products & best sellers. |
| **15** | **Business Settings** | `/admin/settings` | Superadmin controls: UPI ID, QR code, COD limits, shipping fees, free shipping milestone, and announcement bar. |
| **16** | **Admin Users & Staff** | `/admin/admin-users` | Superadmin controls: Manage team accounts, assign roles (`ADMIN` vs `STAFF`), and configure permissions. |
| **17** | **Activity Audit Logs** | `/admin/activity-logs` | Chronological audit trail tracking logins, order updates, catalog modifications, and system events. |

---

## 🛠️ Technology Stack

| Layer | Technologies / Packages | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.0 (App Router, Turbopack) | Server & Client Components, Route Handlers, Server Actions |
| **UI & Components** | React 19.2.8 | Declarative reactive UI components |
| **Language** | TypeScript 5.0 | End-to-end static type safety |
| **Styling & Theme** | Tailwind CSS v4 & PostCSS | Luxury bespoke design system, dark mode & gold palettes |
| **State Management** | Zustand 5.0 | Persistent Cart, Wishlist, Auth & Order stores |
| **Database & ORM** | Prisma ORM 7.9.1 & PostgreSQL | Schema management, type-safe queries, migrations |
| **Data Resilience** | Unified Active Runtime Service | Zero-latency fallback memory store + database synchronization |
| **Security & Auth** | BcryptJS & HTTP-Only Sessions | Secure password hashing, cookie-based token sessions |
| **Icons & Transitions** | Lucide React & Framer Motion | Modern iconography & smooth layout transitions |
| **Notifications** | React Hot Toast | Toast alert system for user & admin feedback |
| **Validation** | Zod 4.4 | Form and API request payload validation |

---

## 📁 Project & Directory Structure

```
paint-meraki/
├── prisma/
│   ├── schema.prisma              # Prisma ORM Database Models & Enums
│   └── seed.ts                    # Database seeder script
├── public/
│   └── images/                    # Product imagery, category banners, placeholders
├── src/
│   ├── app/
│   │   ├── (site)/                # Public Storefront Route Group
│   │   │   ├── about/             # Brand story & artist profile
│   │   │   ├── account/           # Customer auth & order history
│   │   │   ├── cart/              # Interactive cart & shipping calculator
│   │   │   ├── checkout/          # UPI & COD checkout terminal
│   │   │   ├── contact/           # Contact form & studio information
│   │   │   ├── custom-order/      # Bespoke custom commission engine
│   │   │   ├── order-success/     # Order placement confirmation
│   │   │   ├── product/[slug]/    # Dynamic product detail page
│   │   │   ├── reviews/           # Customer reviews showcase
│   │   │   ├── shop/              # Catalog with multi-facet filters
│   │   │   ├── track-order/       # Order tracking lookup
│   │   │   └── wishlist/          # Saved customer items
│   │   ├── admin/                 # Admin Panel Management Console
│   │   │   ├── activity-logs/     # System audit trail
│   │   │   ├── admin-users/       # Staff & RBAC management
│   │   │   ├── banners/           # Homepage banners & sliders
│   │   │   ├── categories/        # Category hierarchy
│   │   │   ├── coupons/           # Promotional discounts
│   │   │   ├── custom-orders/     # Bespoke commission workflow
│   │   │   ├── customers/         # Customer directory & LTV
│   │   │   ├── homepage-config/   # Dynamic homepage CMS
│   │   │   ├── inventory/         # Stock control & alerts
│   │   │   ├── login/             # Luxury admin login portal
│   │   │   ├── orders/            # Order list & status processing
│   │   │   │   └── [id]/          # Detailed order & courier dispatcher
│   │   │   ├── products/          # Catalog management
│   │   │   │   ├── [id]/edit/     # Product editor
│   │   │   │   └── new/           # New product creator
│   │   │   ├── reviews/           # Review moderation
│   │   │   ├── settings/          # Store & UPI business settings
│   │   │   └── layout.tsx         # Admin layout with sidebar & header
│   │   ├── api/                   # Unified REST API Handlers
│   │   │   ├── admin/             # Protected Admin APIs (Auth, Orders, CRUD)
│   │   │   ├── categories/        # Public Categories API
│   │   │   ├── coupons/           # Public Coupon Validation API
│   │   │   ├── custom-orders/     # Public Custom Orders API
│   │   │   ├── orders/            # Public Order Placement & Tracking API
│   │   │   ├── products/          # Public Products API
│   │   │   ├── reviews/           # Public Reviews API
│   │   │   └── settings/          # Public Business Settings API
│   │   ├── globals.css            # Global CSS, Tailwind v4 directives & theme tokens
│   │   ├── layout.tsx             # Root application layout
│   │   ├── not-found.tsx          # Custom 404 page
│   │   └── sitemap.ts             # Dynamic XML sitemap generator
│   ├── components/
│   │   ├── admin/                 # AdminHeader, AdminSidebar, Modals
│   │   ├── layout/                # Storefront Header, Footer, AnnouncementBar, WhatsAppFloat
│   │   ├── product/               # ProductCard, ProductGrid, ProductGallery
│   │   └── ui/                    # Reusable UI elements (Badge, Button, Input, Modal)
│   ├── lib/
│   │   ├── auth/                  # Admin session verification & Bcrypt hashing
│   │   ├── data/                  # Seed catalog data (Products, Categories, Reviews)
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── services/              # Unified db-service.ts data pipeline
│   │   └── store/                 # Zustand state stores (Cart, Wishlist, Auth, Order)
│   └── types/                     # TypeScript data models and interfaces
├── WEBSITE_OVERVIEW.md            # Comprehensive visual architecture & sitemap guide
├── package.json                   # Dependencies & npm scripts
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## 🧠 Unified Resilient Database Architecture

The application uses a **Dual-Layer Unified Data Service** (`src/lib/services/db-service.ts`) designed for high availability:

1. **Active Memory Runtime Store**:
   - All mutations (creating products, updating order statuses, saving settings, adding coupons) execute instantly with sub-millisecond response times.
   - Eliminates page lag and guarantees the storefront and admin panel remain 100% in-sync in real time.
2. **PostgreSQL & Prisma Synchronization**:
   - When a PostgreSQL database is connected via `DATABASE_URL`, mutations are automatically upserted to the database.
   - If the database is temporarily offline or during initial development without database credentials, the platform seamlessly runs on the resilient active runtime store without crashing.

---

## 📊 Database Schema & Prisma Models

Managed via Prisma (`prisma/schema.prisma`):

- **`User`**: Admin and customer user accounts with role-based access (`ADMIN` | `STAFF` | `CUSTOMER`).
- **`Product`**: Catalog products, multi-size pricing JSON, stock levels, rating metrics, specs, and status flags (`ACTIVE` | `DRAFT` | `ARCHIVED`).
- **`Category`**: Category classifications with custom banner images and product relations.
- **`Order` & `OrderItem`**: E-commerce orders tracking customer address, payment mode (`UPI` | `COD`), payment status (`PENDING` | `CONFIRMED` | `FAILED`), UTR references, courier assignments, and order lifecycle statuses.
- **`CustomOrder`**: Bespoke art commissions with customer brief, preferred dimensions, target budget, reference photo URLs, and 7-stage workflow status.
- **`Review`**: Customer ratings (1 to 5 stars), verification status, and moderation flags.
- **`Coupon`**: Discount codes supporting `PERCENTAGE` or `FIXED` amount discounts, minimum spend, max discount caps, and usage tracking.
- **`Banner`**: Hero and promotional banners with sort order, visibility toggles, and device-specific images.
- **`BusinessSettings`**: Store business name, UPI ID, QR code, COD limits, shipping rules, and announcement bar.
- **`ActivityLog`**: System audit trail logging administrative actions, actor emails, timestamps, and target entities.

---

## 🔌 REST API Endpoints Reference

### Public Storefront APIs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve catalog products with category, search, and price filters |
| `GET` | `/api/categories` | Retrieve all active product categories |
| `POST` | `/api/orders` | Place a new customer order (UPI / COD) |
| `GET` | `/api/orders?orderNumber=...` | Look up order tracking status |
| `POST` | `/api/custom-orders` | Submit bespoke custom order commission request |
| `GET` | `/api/reviews` | Retrieve approved customer reviews |
| `POST` | `/api/coupons/validate` | Validate coupon code against cart subtotal |
| `GET` | `/api/settings` | Retrieve store announcement and business settings |

### Protected Admin APIs (Session Required)

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/auth/login` | Secure admin credentials login | Public |
| `GET` | `/api/admin/auth/me` | Fetch authenticated session profile | Admin / Staff |
| `POST` | `/api/admin/auth/logout` | Terminate session & clear cookies | Admin / Staff |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/products` | Product catalog CRUD operations | Admin / Staff |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/categories` | Category hierarchy management | Admin / Staff |
| `GET`, `PUT`, `DELETE` | `/api/admin/orders` | Order management & courier dispatch | Admin / Staff |
| `GET`, `PUT`, `DELETE` | `/api/admin/custom-orders` | Custom commission lifecycle updates | Admin / Staff |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/coupons` | Promo & discount coupon engine | Admin / Staff |
| `GET`, `PUT`, `DELETE` | `/api/admin/reviews` | Customer review moderation | Admin / Staff |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/banners` | Promotional banners & hero sliders | Admin / Staff |
| `GET`, `PUT` | `/api/admin/homepage-config` | Homepage layout & featured items CMS | Admin / Staff |
| `GET` | `/api/admin/analytics` | Master metrics & revenue chart data | Admin / Staff |
| `GET`, `PUT` | `/api/admin/settings` | Update store configuration & UPI settings | Superadmin Only |
| `GET`, `POST`, `DELETE` | `/api/admin/users` | Manage administrative & staff accounts | Superadmin Only |
| `GET` | `/api/admin/activity-logs` | Retrieve chronological audit trail | Superadmin Only |

---

## 🔑 Admin Access & Authentication

- **Admin Login Portal**: [`/admin/login`](http://localhost:3000/admin/login)
- **Security Standard**: Passwords hashed with `bcryptjs` (salt rounds: 10), stored securely, and validated via HTTP-only server session cookies.

### Default Admin Accounts

| Account | Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Astha Patel** | Superadmin (Founder) | `admin@paintmeraki.com` | `Asthapatel@#9990` | Full Access (All 16 Modules) |
| **Super Admin** | Superadmin (Manager) | `superadmin@paintmeraki.com` | `Soham@335323#` | Full Access (All 16 Modules) |
| **Support Team** | Staff Member | `staff@paintmeraki.com` | `admin123` | Orders, Catalog, Reviews & Inventory |

---

## 📱 Firebase Phone Authentication (Customer Login)

Customer authentication is powered by **Firebase Phone Authentication** with OTP verification:

1. **Client Modular SDK**: `src/lib/firebase.ts` initializes Firebase Web App.
2. **Server-Side Token Verification**: `src/lib/firebase-admin.ts` verifies Firebase ID tokens.
3. **Session Management**: Secure HTTP-only cookies (`paint_meraki_customer_session`).
4. **Data Sync**: Customers are mapped directly in PostgreSQL / database service by `firebaseUid` & `mobile`.

### How to Test with Firebase Fictional/Test Phone Numbers

To test customer login on `http://localhost:3000` without sending real SMS:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Select project **`paintmeraki-1b0bd`**.
2. Navigate to **Build** → **Authentication** → **Sign-in method** tab.
3. Click on **Phone** provider.
4. Scroll down to **"Phone numbers for testing (optional)"**.
5. Add a fictional phone number and verification code:
   - **Phone number**: `+919999999999` (or `+91 98765 43210`)
   - **Test OTP Code**: `123456`
6. Click **Save**.
7. In the website login screen (`/account/login`), enter `9999999999`, click **Send OTP**, enter `123456`, and click **Verify & Continue**.

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**, **yarn**, or **pnpm**

### 1. Clone & Navigate to Project
```bash
git clone <repository-url>
cd paint-meraki
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file from the template:
```bash
cp .env.example .env.local
```

Example configuration in `.env.local`:
```env
# Optional Database (Runs resiliently in-memory if DB is not provided)
DATABASE_URL="postgresql://username:password@localhost:5432/paint_meraki?schema=public"

# NextAuth Secret
NEXTAUTH_SECRET="your-super-secret-key-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Public Store Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="919878541310"
NEXT_PUBLIC_UPI_ID="paintmeraki@upi"
```

### 4. (Optional) Run Prisma Migrations
If using PostgreSQL:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [**`http://localhost:3000`**](http://localhost:3000) in your browser.
Open [**`http://localhost:3000/admin`**](http://localhost:3000/admin) to access the Admin Control Center.

---

## 🚀 Production Build & Deployment

### Build the Application
```bash
npm run build
```

### Run Production Server
```bash
npm run start
```

### Recommended Deployment Platforms
- **Vercel**: Zero-config deployment for Next.js App Router.
- **Node.js Server (Docker / VPS)**: Deploy using standard `npm run build && npm run start`.
- **Database**: Supabase, Neon, AWS RDS, or Railway PostgreSQL.

---

## 📄 License & Attribution

All rights reserved © **paint_n_meraki**. Handcrafted with passion by **Astha Patel**.
