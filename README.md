# 🛒 StoreCraft — Enterprise Full-Stack E-Commerce & Product Management Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://cohort-3-project-eight.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

A high-performance, full-stack E-Commerce platform built with **TypeScript**, **Node.js/Express**, **MongoDB Atlas**, and **React (Vite)**. Engineered with enterprise security standards featuring **dual-token JWT authentication (Access + Refresh tokens with `httpOnly` cookies)**, **Role-Based Access Control (RBAC)**, full **Product Catalog CRUD** with `express-validator`, an interactive **Slide-Over Shopping Cart & Checkout System**, and a dedicated **Admin Inventory & Business Analytics Dashboard**.

---

## 🌐 Live Deployment & Demo Credentials

- **Live URL**: [https://cohort-3-project-eight.vercel.app/](https://cohort-3-project-eight.vercel.app/)
- **Repository**: [https://github.com/Pratham707-S/cohort-3-project](https://github.com/Pratham707-S/cohort-3-project)

### ⚡ One-Click Demo Access
The platform includes built-in 1-Click login presets right on the sign-in screen:

| Role | Demo Email | Password | Permissions / Capabilities |
|---|---|---|---|
| 🛍️ **Customer / Shopper** | `customer@test.com` | `password123` | Browse catalog, filter categories, Add to Cart, adjust quantities, place orders. *(Admin panel is hidden)* |
| 🛡️ **Store Admin / Manager** | `pratham@test.com` | `password123` | Full store access + **Admin Dashboard**, live inventory valuation, low stock alerts, Add/Edit/Delete products. |

---

## 📐 System Architecture

StoreCraft is deployed as a unified full-stack architecture on **Vercel Serverless Functions** communicating with **MongoDB Atlas**, eliminating CORS friction and cold starts while securing authentication tokens.

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │                      CLIENT TIER                        │
                                  │       React 18 + TypeScript + Vite + Lucide Icons       │
                                  └────────────┬───────────────────────────────┬────────────┘
                                               │                               │
                      HTTP /api Requests (Axios)                               │ JWT httpOnly Cookies
                                               ▼                               ▼
                                  ┌─────────────────────────────────────────────────────────┐
                                  │              SERVERLESS API GATEWAY (Vercel)            │
                                  │                      api/index.ts                       │
                                  └────────────────────────────┬────────────────────────────┘
                                                               │
                                                               ▼
                                  ┌─────────────────────────────────────────────────────────┐
                                  │                   MIDDLEWARE PIPELINE                   │
                                  │  • CORS & Cookie Parser                                 │
                                  │  • validate.middleware (express-validator)              │
                                  │  • auth.middleware (JWT Verify & RBAC Guard)            │
                                  └─────────────┬─────────────────────────────┬─────────────┘
                                                │                             │
                                                ▼                             ▼
                          ┌───────────────────────────┐         ┌───────────────────────────┐
                          │      Auth Controller      │         │     Product Controller    │
                          │ • /register               │         │ • GET /products (Search)  │
                          │ • /login (Dual JWT)       │         │ • GET /products/:id       │
                          │ • /refresh-token          │         │ • POST /products (Admin)  │
                          │ • /logout (Token Revoke)  │         │ • PUT /products/:id       │
                          │ • /me (Profile & Role)    │         │ • DELETE /products/:id    │
                          └─────────────┬─────────────┘         └─────────────┬─────────────┘
                                        │                                     │
                                        └──────────────────┬──────────────────┘
                                                           │
                                                           ▼
                                  ┌─────────────────────────────────────────────────────────┐
                                  │               DATA PERSISTENCE LAYER                    │
                                  │            Mongoose ODM + MongoDB Atlas                 │
                                  │  • User Model (bcrypt pre-save hook, roles: user/admin) │
                                  │  • Product Model (indexed search, inventory stock)      │
                                  └─────────────────────────────────────────────────────────┘
```

---

## 🔄 Dual-Token Authentication Lifecycle

```
[ Customer / Admin ]                       [ Express API ]                    [ MongoDB Atlas ]
         │                                        │                                   │
         ├─────── 1. POST /api/auth/login ───────>│                                   │
         │          (Email + Password)            ├─────── Find User & Validate ─────>│
         │                                        │<────── Return User Record ────────┤
         │                                        │                                   │
         │                                        ├─────── Generate Access Token (15m)
         │                                        ├─────── Generate Refresh Token (7d)
         │                                        ├─────── Save Refresh Token ───────>│
         │<────── 2. Response: Access Token ──────┤                                   │
         │        + Set-Cookie: refreshToken      │                                   │
         │          (httpOnly, secure)            │                                   │
         │                                        │                                   │
         │─── 3. Subsequent Authenticated Call ──>│                                   │
         │    (Authorization: Bearer <token>)     ├─────── Verify JWT Signature       │
         │                                        ├─────── Process Request ──────────>│
         │<────── 4. Data Response (200 OK) ──────┤                                   │
         │                                        │                                   │
         │─── 5. Access Token Expires (401) ─────>│                                   │
         │                                        │                                   │
         │─── 6. Axios Interceptor Auto-Triggers ─>│                                  │
         │       POST /api/auth/refresh-token     ├─────── Validate Cookie vs DB ────>│
         │<────── New Access Token (200 OK) ──────┤                                   │
         │                                        │                                   │
         │─── 7. POST /api/auth/logout ──────────>│                                   │
         │                                        ├─────── Clear DB Refresh Token ───>│
         │<────── Clear Cookie & Logged Out ──────┤                                   │
```

---

## ✨ Key Features & Capabilities

### 🛍️ 1. Modern E-Commerce Storefront
- **Instant Live Search**: Debounced search across product titles and detailed descriptions.
- **Category Filter Pills**: Quick-filter by *Electronics*, *Clothing*, *Home & Kitchen*, *Books*, *Beauty*, and *Sports*.
- **Pagination Controls**: Clean server-paginated catalog with total count indicators.
- **Stock Status Badges**: Dynamic indicators showing exact stock units available or "Out of Stock".

### 🛒 2. Slide-Over Cart & Checkout Drawer
- **Persistent Cart State**: Stored in `localStorage` and synchronized across tabs via React Context.
- **Quantity Management**: Real-time increment/decrement with upper-bound stock constraints.
- **Financial Breakdown**: Automatic real-time subtotal, estimated sales tax (8%), and grand total calculations.
- **Interactive Checkout Modal**: Delivery address collection, payment method selector (Card / UPI / Cash on Delivery), and instant order receipt generation with unique tracking IDs.

### 🛡️ 3. Role-Based Admin Panel & Inventory Control
- **Automatic Role Separation**: Admin users gain access to a dedicated Admin Panel; normal users only see customer shopping features.
- **Business KPI Cards**:
  - 📦 **Total Products Count**
  - 💵 **Total Inventory Valuation ($)** (Calculated dynamically from stock × price)
  - ⚠️ **Low Stock Alert Counter** (Items with ≤ 5 units remaining)
  - 🗂️ **Active Categories Count**
- **Inventory Data Table**: Tabular view of all catalog items with direct **Create**, **Edit**, and **Delete** actions backed by confirmation dialogs.

### 🎨 4. Human-Crafted Aesthetic
- Tailored organic warm skin/cream and espresso palette (`#fbf5ee` / `#f4e9dd` / `#2d231a`).
- Glassmorphic modal backdrops, micro-interactions, responsive grids, and zero AI generic styling.

---

## 📁 Repository Directory Structure

```
cohort-3-project/
├── api/
│   └── index.ts                     # Vercel Serverless Function entry point
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # MongoDB Atlas Mongoose connection pool
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Register, Login, Refresh-token, Logout, Me
│   │   │   └── product.controller.ts # Product CRUD handlers
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts    # JWT verification & req.user injector
│   │   │   ├── validate.middleware.ts# express-validator result handler
│   │   │   └── error.middleware.ts   # Centralized error handler
│   │   ├── models/
│   │   │   ├── user.model.ts         # User schema, bcrypt hash & role definition
│   │   │   └── product.model.ts      # Product schema with creator reference
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # /api/auth routes
│   │   │   ├── product.routes.ts     # /api/products routes
│   │   │   └── index.ts              # Master API router
│   │   ├── validators/
│   │   │   ├── auth.validator.ts     # Schema validation rules for Auth
│   │   │   └── product.validator.ts  # Schema validation rules for Products
│   │   ├── types/
│   │   │   └── index.ts              # Backend TypeScript interfaces
│   │   ├── app.ts                    # Express application configuration
│   │   ├── server.ts                 # Standalone development server
│   │   └── seed.ts                   # Database seeder with demo products & users
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Navigation header with Shop/Admin tabs & Cart badge
│   │   │   ├── ProductCard.tsx       # Product card with Add to Cart & stock status
│   │   │   ├── CartDrawer.tsx        # Slide-over cart drawer with tax/subtotal calculation
│   │   │   ├── CheckoutModal.tsx     # Order checkout form & confirmation receipt
│   │   │   ├── ProductModal.tsx      # Add & Edit product modal
│   │   │   └── DeleteModal.tsx       # Deletion confirmation modal
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # Authentication context & token management
│   │   │   └── CartContext.tsx       # Shopping cart context & quantity handlers
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # Storefront catalog with category pills
│   │   │   ├── AdminPage.tsx         # Admin dashboard with business metrics & table
│   │   │   ├── LoginPage.tsx         # 1-Click demo logins & authentication form
│   │   │   ├── RegisterPage.tsx      # New account registration view
│   │   │   └── ProductDetailPage.tsx # Single product deep-dive & direct cart addition
│   │   ├── services/
│   │   │   └── api.ts                # Axios instance with auto-refresh interceptors
│   │   ├── types/
│   │   │   └── index.ts              # Frontend TypeScript contracts
│   │   ├── App.tsx                   # Master routing & modal coordinator
│   │   └── index.css                 # Premium warm skin tone design system
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── vercel.json                       # Full-stack serverless routing configuration
├── package.json                      # Root workspace build scripts
└── README.md
```

---

## 📡 REST API Reference

### 🔐 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account (defaults to `user` role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue Access Token (body) + Refresh Token (cookie) |
| `POST` | `/api/auth/refresh-token`| Public* | Exchange Refresh Token cookie for a fresh Access Token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token in database & clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Return currently authenticated user profile & role |

#### Example Login Request:
```bash
curl -X POST https://cohort-3-project-eight.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "pratham@test.com", "password": "password123"}'
```

---

### 📦 2. Product Endpoints (`/api/products`)

| Method | Endpoint | Access | Query Parameters | Description |
|---|---|---|---|---|
| `GET` | `/api/products` | Public | `page`, `limit`, `search`, `category` | Fetch paginated product catalog |
| `GET` | `/api/products/:id` | Public | `id` (Mongo ObjectId) | Fetch single product details |
| `POST` | `/api/products` | Authenticated | None | Create a new product listing |
| `PUT` | `/api/products/:id` | Authenticated | `id` (Mongo ObjectId) | Update an existing product |
| `DELETE` | `/api/products/:id` | Authenticated | `id` (Mongo ObjectId) | Remove a product from inventory |

#### Example Create Product Request:
```bash
curl -X POST https://cohort-3-project-eight.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "name": "Mechanical Keyboard RGB",
    "description": "Hot-swappable mechanical switches with custom dampening foam.",
    "price": 89.99,
    "category": "Electronics",
    "stock": 30,
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
  }'
```

---

## 🛡️ Validation & Error Response Contract

All incoming request payloads are strictly validated using `express-validator`. If validation fails, the API responds with `400 Bad Request` and field-specific error messages:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number greater than 0"
    },
    {
      "field": "stock",
      "message": "Stock must be an integer (0 or more)"
    }
  ]
}
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Pratham707-S/cohort-3-project.git
cd cohort-3-project
```

### 2. Configure Backend Environment
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### 3. Run Backend & Seed Database
```bash
cd backend
npm install
npx ts-node-dev src/seed.ts   # Seeds initial admin, customer & 8 catalog products
npm run dev                   # Starts backend on http://localhost:5000
```

### 4. Run Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev                   # Starts Vite dev server on http://localhost:5173
```

---

## 🚢 Deployment Configuration (Vercel)

StoreCraft is deployed seamlessly on Vercel as a single full-stack project using `vercel.json`:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.ts"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    }
  ]
}
```

---

## 👨‍💻 Author & Acknowledgments

- **Developer**: Pratham
- **Course**: Sheryians Coding School (Cohort 3 Project)
- **License**: MIT
