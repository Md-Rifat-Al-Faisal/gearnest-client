# GearNest — Industrial & Heavy Equipment Rental Platform (Client)

**GearNest** is a full-stack, enterprise-grade heavy machinery and equipment rental marketplace designed for contractors, industrial project managers, equipment owners, and fleet administrators. Built with Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, and Better-Auth.

- **Live Application URL**: [https://gearnest-client.vercel.app](https://gearnest-client.vercel.app)
- **Backend API URL**: [https://gearnest-server.vercel.app](https://gearnest-server.vercel.app)

---

## Key Features by User Role

### 1. Public Catalog & Discovery
- **Hero & Fleet Showcase**: Industrial Slate & Amber aesthetic with dark/light mode toggle and responsive motion choreography.
- **Search & Filtering**: Real-time regex-escaped search across equipment name, brand, location, and description.
- **Multi-Filter Sidebar**: Filter by category (Construction Equipment, Photography Equipment, Vehicles & Transportation, Agriculture Equipment, Electronics, Event Equipment), rental rate range, rental term (Daily, Weekly, Monthly), and live inventory availability.
- **Sorting & Pagination**: Sort by newest listings, price ascending, and price descending with server-side pagination.
- **Equipment Details**: Complete specifications table, rental terms, owner verification card with verified email contact, and automatic login return callbacks.

### 2. Customer / Renter Workspace
- **Live Favorites**: Interactive wishlist with optimistic heart animations and compound index persistence.
- **Dynamic Stripe Checkout**: Server-calculated rental durations and pricing units with automatic inventory validation and Stripe redirect.
- **Rental Tracking**: View ongoing, completed, and pending rental reservations with real-time payment status badges.
- **Renter Profile**: Update phone, address, and profile credentials.

### 3. Equipment Owner / Partner Portal
- **Fleet Management**: Catalog view of listed machinery with live status indicators (Approved, Pending Review, Rejected).
- **Add Equipment**: Multi-field submission wizard with ImgBB direct image uploads, pricing units, specs, and default "Pending" moderation flow.
- **Rental Order Execution**: Manage customer rental contracts with atomic stock restoration upon marking bookings "Completed" or "Cancelled".
- **Partner Analytics Overview**:
  - KPI Stat Cards: Total Earnings, Fleet Inventory, Active Site Deployments, Completed Contracts.
  - 6-Month Monthly Earnings Velocity chart (`AreaChart`).
  - Equipment Moderation Status donut chart (`PieChart`).
- **Partner Profile**: Edit business address, dispatch contact, and profile avatar.

### 4. Administrator Moderation Suite
- **Master Platform Analytics**:
  - Summary Metrics: Total Platform Users, Fleet Inventory, Pending Moderation Queue, Active Rentals, Gross Stripe Revenue.
  - 6-Month Revenue Trajectory chart (`AreaChart` with amber gradient fill).
  - Monthly Booking Volume trend (`BarChart`).
  - Fleet Distribution progress bars across machinery categories.
- **Equipment Moderation**: Approve or reject pending machinery listings with instant status updates in the public catalog and owner fleet dashboard.
- **All Platform Rentals**: Global audit log of all bookings with renter, owner, and transaction status.
- **User Management**: Role management (Customer, Owner, Admin) with demotion and self-deletion guardrails.

---

## Demo Credentials

You can test any role directly using these pre-seeded demo accounts (or click the quick-fill buttons on the Sign-In page):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@gearnest.com` | `Password123!` | Public Catalog, Wishlist, Stripe Checkout, Customer Dashboard |
| **Fleet Owner** | `owner@gearnest.com` | `Password123!` | Add/Edit Equipment, Fleet Orders, Stock Restore, Owner Analytics |
| **Admin** | `admin@gearnest.com` | `Password123!` | Moderate Equipment, Manage Users, Platform Analytics, All Rentals |

---

## Tech Stack & Dependencies

### Core Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with centralized CSS custom properties
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Themes**: [next-themes](https://github.com/pacocoursey/next-themes) (Light & Dark mode support)

### Authentication & Payments
- **Authentication**: [Better-Auth](https://www.better-auth.com/) with MongoDB adapter and JWT plugin
- **Payments**: [@stripe/stripe-js](https://stripe.com/docs/js) & Stripe API

### Complete NPM Dependencies
```json
{
  "dependencies": {
    "@base-ui/react": "^1.9.0",
    "@better-auth/mongo-adapter": "^1.7.17",
    "@stripe/stripe-js": "^10.2.1",
    "better-auth": "^1.7.17",
    "class-variance-authority": "^0.7.1",
    "cn": "^0.5.2",
    "framer-motion": "^12.4.0",
    "lucide-react": "^1.68.0",
    "mongodb": "^7.8.0",
    "next": "^16.4.3",
    "next-themes": "^0.4.6",
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "recharts": "^2.15.1",
    "shadcn": "^4.23.0",
    "sonner": "^2.0.1",
    "stripe": "^23.1.0",
    "tw-animate-css": "^1.4.0"
  }
}
```

---

## Environment Variables Reference

Create a `.env.local` file in the `gearnest-client` root directory:

```bash
# Better-Auth Secret & Base URL
BETTER_AUTH_SECRET="your_secure_random_auth_secret_minimum_32_characters"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_DB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/gearnestdb"
DB_NAME="gearnestdb"

# Public App & API URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Image Uploads (ImgBB)
NEXT_PUBLIC_IMGBB_API_KEY="your_imgbb_api_key"

# Stripe Checkout
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
```

---

## Local Setup & Development

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
   # Fill in your database and API credentials
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Quality Checks

```bash
# Type check TypeScript definitions
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```
