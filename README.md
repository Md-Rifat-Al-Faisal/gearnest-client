# GearNest — Modern Smart-Rental Marketplace for Heavy Machinery & Industrial Equipment

[![Next.js 16](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth_1.7-black?style=for-the-badge&logo=auth0&logoColor=white)](https://www.better-auth.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**GearNest** is a full-stack, enterprise-grade heavy machinery and equipment rental marketplace connecting contractors, cinematography leads, and industrial operators with verified fleet owners. Engineered with photo-led design, atomic inventory locks, Stripe payment processing, and strict role-based access control (RBAC).

- **Production Client URL**: [https://gearnest-client.vercel.app](https://gearnest-client.vercel.app)
- **Production API URL**: [https://gearnest-server.vercel.app](https://gearnest-server.vercel.app)

---

## Platform Preview

<p align="center">
  <img src="public/homescreen.png" alt="GearNest Platform Preview" width="100%" />
</p>

---

## Architectural Workflow

```mermaid
flowchart TD
    subgraph Client["Next.js 16 Client (App Router)"]
        UI["Landing Page / Catalog / Dashboards"]
        AuthClient["Better-Auth Client (Session / JWT)"]
        StripeClient["Stripe Checkout Redirect"]
    end

    subgraph AuthLayer["Authentication & Identity"]
        BetterAuth["Better-Auth Service (MongoDB Adapter)"]
        JWKS["JWKS Key Store (MongoDB jwks collection)"]
    end

    subgraph Server["Express 5 REST API"]
        VerifyMiddleware["verifyToken / RBAC Guards"]
        CatalogAPI["Equipment & Categories"]
        BookingEngine["Booking & Stock Controller"]
        AnalyticsEngine["Parallel Aggregations Engine"]
        CronEngine["Rental Expiration & Stock Restorer"]
    end

    subgraph External["External Services"]
        Stripe["Stripe Payments API & Webhooks"]
        ImgBB["ImgBB Image Hosting"]
        Atlas[("MongoDB Atlas Database")]
    end

    UI --> AuthClient
    AuthClient --> BetterAuth
    BetterAuth --> JWKS
    BetterAuth --> Atlas

    UI --> Server
    Server --> VerifyMiddleware
    VerifyMiddleware -.-> JWKS
    BookingEngine --> Stripe
    Stripe --> StripeClient
    BookingEngine --> Atlas
    CronEngine --> Atlas
    AnalyticsEngine --> Atlas
    UI --> ImgBB
```

---

## Key Features by Workspace Role

### 1. Public Marketplace & Catalog Discovery
- **Hero & Category Grid**: Photo-led hero layout with high-contrast scrims, ambient blend, and a 6-category compact grid (`Construction`, `Photography`, `Vehicles`, `Agriculture`, `Electronics`, `Events`).
- **Dynamic Search & Multi-Filter**: Real-time regex-escaped search across name, brand, location, and description, paired with category, price range, rental unit (`Daily`, `Weekly`, `Monthly`), and in-stock filtering.
- **Equipment Detail Page**: Technical specifications, condition metrics, owner dispatch card, and login redirect preservation (`callbackUrl`).
- **Brand Theming**: 100% tokenized color palette supporting seamless light/dark modes with WCAG AAA compliant contrast ratios.

### 2. Customer / Renter Workspace
- **Live Wishlist / Favorites**: Interactive saved machinery with optimistic UI transitions backed by MongoDB compound indexes (`customerId + equipmentId`).
- **Dynamic Stripe Checkout**: Server-calculated rental durations and pricing units with automatic inventory validation before Stripe redirection.
- **Rental Progression**: Real-time contract status badges (`Active`, `Completed`, `Cancelled`) and transaction receipts.
- **Self-Service Cancellations**: Customers can instantly cancel pending, unpaid reservations to free reserved fleet allocations.

### 3. Equipment Owner / Partner Portal
- **Fleet Management**: Catalog table of listed machinery with administrative review status (`Approved`, `Pending`, `Rejected`).
- **Listing Submission Wizard**: Multi-field equipment creation with ImgBB direct image upload, specifications, and default pending moderation flow.
- **Rental Order Execution**: Process incoming customer bookings with atomic stock restoration upon transitioning orders to `Completed` or `Cancelled`.
- **Fleet Analytics**:
  - Stat KPI Cards: Gross Fleet Earnings, Listed Fleet Size, Active Deployments, Completed Orders.
  - 6-Month Monthly Earnings Velocity chart (`AreaChart`).
  - Fleet Moderation Distribution donut chart (`PieChart`).

### 4. Administrator Moderation Suite
- **Equipment Moderation**: Approve or reject pending partner listings with instant reflection across the public catalog.
- **Platform User Management**: Role management (`customer`, `owner`, `admin`) guarded against self-demotion and account self-deletion.
- **Master Platform Analytics**:
  - Global KPIs: Total Platform Users, Fleet Inventory, Pending Approvals, Active Deployments, Gross Stripe Volume.
  - 6-Month Revenue Trajectory chart (`AreaChart` with amber gradient).
  - Monthly Booking Volume trend (`BarChart`).
  - Fleet distribution breakdown across commercial categories.
- **Rental Audit Log**: Complete historical record of all bookings across all owners and renters.

---

## Demo Accounts & Role-Based Access

The platform features pre-configured accounts for evaluating all access levels:

| Role | Demo Email | Access Scope |
| :--- | :--- | :--- |
| **Customer** | `customer@gearnest.com` | Public catalog, favorites, Stripe checkout, rental tracking |
| **Fleet Owner** | `owner@gearnest.com` | Equipment listing, fleet orders, return dispatch, owner analytics |
| **Platform Administrator** | `admin@gearnest.com` | Listing moderation queue, user RBAC, platform-wide audit, master analytics |

> [!NOTE]
> Demo passwords are protected against unauthorized modification on shared environments. Evaluators can log in using the pre-configured credentials provided above or in the evaluation submission form.

---

## Tech Stack & Core Technologies

| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **Next.js 16** | ![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js) | App Router, Server Components, Turbopack |
| **React 19** | ![React](https://img.shields.io/badge/React-19.3-20232A?logo=react) | Modern UI library with action hooks |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC?logo=typescript) | Strict type safety across client & schemas |
| **Tailwind CSS v4** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css) | Tokenized theme variables & utilities |
| **Better-Auth** | ![Better-Auth](https://img.shields.io/badge/Better--Auth-1.7-black?logo=auth0) | MongoDB adapter, JWT plugin, session cookies |
| **Stripe** | ![Stripe](https://img.shields.io/badge/Stripe-API-626CD9?logo=stripe) | Client redirect & hosted checkout |
| **Framer Motion** | ![Framer](https://img.shields.io/badge/Framer_Motion-12.4-black?logo=framer) | Hardware-accelerated UI choreographies |
| **Recharts** | ![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e?logo=chartdotjs) | Visual analytics (AreaChart, BarChart, PieChart) |
| **Lucide React** | ![Lucide](https://img.shields.io/badge/Lucide-Icons-orange) | Crisp, lightweight SVG iconography |
| **Sonner** | ![Sonner](https://img.shields.io/badge/Sonner-Toasts-blue) | Accessible toast notification system |

---

## Environment Variables Reference

Create a `.env.local` file in the `gearnest-client` directory:

```bash
# Better-Auth Secret & Configuration
BETTER_AUTH_SECRET="your_secure_random_auth_secret_minimum_32_characters"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_DB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/gearnestdb"
DB_NAME="gearnestdb"

# Public Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Image Uploads (ImgBB Direct Client Upload)
NEXT_PUBLIC_IMGBB_API_KEY="your_imgbb_api_key"

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Optional Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
```

---

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Md-Rifat-Al-Faisal/gearnest-client.git
   cd gearnest-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Update values in .env.local
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Typecheck & Production Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
