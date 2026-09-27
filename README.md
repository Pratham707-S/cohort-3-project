# E-Commerce Authentication & Product CRUD Platform

A full-stack REST API and interactive client built with Node.js, Express, TypeScript, MongoDB (Mongoose), and React. This project implements a secure dual-token JWT authentication flow (Access Token + Refresh Token), full CRUD operations on product resources, request validation with `express-validator`, and a responsive frontend user interface.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **Validation**: `express-validator`
- **Frontend**: React, TypeScript, Vite, Lucide Icons, Axios

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts     # Register, Login, Refresh, Logout, Me
│   │   │   └── product.controller.ts  # Create, Read, Update, Delete Products
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts     # JWT verification middleware
│   │   │   ├── validate.middleware.ts # express-validator error handler
│   │   │   └── error.middleware.ts    # Centralized application error handling
│   │   ├── models/
│   │   │   ├── user.model.ts          # User Mongoose schema & bcrypt hash hook
│   │   │   └── product.model.ts       # Product Mongoose schema
│   │   ├── routes/
│   │   │   ├── auth.routes.ts         # Auth route definitions
│   │   │   ├── product.routes.ts      # Product route definitions
│   │   │   └── index.ts               # Root route registry
│   │   ├── validators/
│   │   │   ├── auth.validator.ts      # express-validator rules for auth
│   │   │   └── product.validator.ts   # express-validator rules for products
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces & types
│   │   ├── app.ts                     # Express app setup & middleware stack
│   │   └── server.ts                  # Server initialization & DB boot
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Responsive navigation header
│   │   │   ├── ProductCard.tsx        # Product catalog card with actions
│   │   │   ├── ProductModal.tsx       # Create & Edit product modal
│   │   │   └── DeleteModal.tsx        # Delete confirmation dialog
│   │   ├── context/
│   │   │   └── AuthContext.tsx        # User authentication state provider
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # Product catalog, search & pagination
│   │   │   ├── LoginPage.tsx          # Login view with field errors
│   │   │   ├── RegisterPage.tsx       # Registration view with field errors
│   │   │   └── ProductDetailPage.tsx  # Detailed product view
│   │   ├── services/
│   │   │   └── api.ts                 # Axios instance with JWT auto-refresh interceptor
│   │   ├── types/
│   │   │   └── index.ts               # Client TypeScript definitions
│   │   ├── App.tsx                    # Main app container & routing
│   │   ├── index.css                  # Modern responsive design system
│   │   └── main.tsx                   # React root entry
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── package.json                       # Root workspace scripts
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce_db?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd cohort-3-project-backend
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 🔒 Authentication Flow & Security

1. **Password Hashing**: Passwords are automatically hashed using `bcryptjs` with 10 salt rounds prior to persistence.
2. **Access Token**: Short-lived (15 minutes), signed with `ACCESS_TOKEN_SECRET`. Returned in the JSON response body and passed in `Authorization: Bearer <token>` header.
3. **Refresh Token**: Long-lived (7 days), signed with `REFRESH_TOKEN_SECRET`. Stored as an `httpOnly`, `secure` (in production) cookie and tracked in the database to support immediate revocation upon logout.
4. **Auto Token Refresh**: The frontend Axios client automatically detects expired access tokens (401 response) and calls `/api/auth/refresh-token` in the background to retry failed requests transparently.

---

## 📡 API Endpoints Reference

### 1. Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue access + refresh tokens |
| `POST` | `/api/auth/refresh-token` | Public* | Issue a new access token using refresh token cookie |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh token and clear cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user's profile |

#### Register Request Example (`POST /api/auth/register`)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

#### Login Request Example (`POST /api/auth/login`)
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

---

### 2. Product CRUD APIs (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (supports `page`, `limit`, `search`, `category`) |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `POST` | `/api/products` | Authenticated | Create a new product |
| `PUT` | `/api/products/:id` | Authenticated | Update an existing product |
| `DELETE` | `/api/products/:id` | Authenticated | Delete an existing product |

#### Create Product Request Example (`POST /api/products`)
```json
{
  "name": "Wireless Noise Cancelling Headphones",
  "description": "Premium over-ear headphones with 30-hour battery life and spatial audio.",
  "price": 199.99,
  "category": "Electronics",
  "stock": 25,
  "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
}
```

---

## 🛡️ Validation & Error Format

All incoming requests are validated with `express-validator`. If any field fails validation, a standard 400 Bad Request error is returned with field-level breakdowns:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```
