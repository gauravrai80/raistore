# 🛍️ RaiStore — Premium E-Commerce Platform

A full-stack, production-ready e-commerce web application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). RaiStore features a polished storefront with a live product catalog, persistent cart, secure user authentication, Stripe payment integration, Brevo transactional emails, and a fully functional admin dashboard.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [Admin Dashboard](#admin-dashboard)
- [Database Models](#database-models)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## 🌐 Overview

RaiStore is a curated premium e-commerce storefront specializing in lifestyle products. It is a complete commerce solution featuring:

- A **React/Vite** frontend with smooth animations and a polished UI
- An **Express.js + Node.js** REST API backend
- A **MongoDB** database (via Mongoose) for all persistent data
- **JWT-based authentication** with secure HTTP-only cookies
- **Stripe** integration for secure payment processing

---

## 🧰 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **Vite** | 5.x | Build tool & dev server |
| **React Router DOM** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **shadcn/ui** | latest | Pre-built accessible UI components |
| **Framer Motion** | 12.x | Animations and transitions |
| **Radix UI** | latest | Headless UI primitives |
| **Lucide React** | 0.462 | Icon library |
| **Recharts** | 2.x | Charts & analytics visualizations |

### State Management & Data Fetching

| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | 5.x | Global cart & auth state |
| **TanStack Query** | 5.x | Server state, caching & query management |
| **Axios** | 1.x | HTTP client for API calls |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.x | REST API framework |
| **MongoDB** | — | NoSQL database |
| **Mongoose** | 8.x | MongoDB ODM |
| **JSON Web Token** | 9.x | Authentication tokens |
| **bcryptjs** | 2.x | Password hashing |
| **Stripe** | 20.x | Payment processing |
| **Brevo SDK** (`@getbrevo/brevo`) | latest | Transactional email service |
| **Helmet** | 7.x | HTTP security headers |
| **express-rate-limit** | 7.x | API rate limiting |
| **cookie-parser** | 1.x | Cookie handling |

### Forms & Validation

| Technology | Purpose |
|---|---|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **@hookform/resolvers** | Connect Zod to React Hook Form |

---

## 🏗️ Architecture

RaiStore uses a standard **MERN stack** architecture with a clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                      │
│  Port: 8080                                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Zustand     │  │  TanStack    │  │  Axios API        │  │
│  │  Cart/Auth   │  │  Query Cache │  │  Client (/api/*)  │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / REST API
┌────────────────────────────▼────────────────────────────────┐
│              Express.js Backend (Node.js)                    │
│  Port: 5000                                                  │
│                                                              │
│  • JWT Auth   • Rate Limiting   • Helmet Security           │
│  • Stripe Payments              • Nodemailer Emails          │
└────────────────────────────┬────────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────────┐
│                        MongoDB                               │
│  Collections: users, products, categories, orders,           │
│               inventory, coupons, wishlists                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Storefront
- 🛍️ **Live product catalog** with category filtering
- 🔍 **Product detail pages** with image gallery and variant selection
- 🛒 **Persistent cart** managed via Zustand (survives page refresh)
- 💳 **Stripe Checkout** — secure payment processing
- 🎞️ **Animated UI** — smooth entrance animations with Framer Motion
- 📱 **Fully responsive** — mobile-first design

### User Account
- 📦 **Order history** — view all past orders and their statuses
- 👤 **User profile** — edit name, avatar, and personal details
- ❤️ **Wishlist** — save products for later
- 🎟️ **Coupon codes** — apply discount codes at checkout

### Transactional Emails (Brevo)
- 🎉 **Welcome email** — sent automatically when a user registers
- ✅ **Order confirmation** — full order summary emailed on purchase
- 🚚 **Order status updates** — email notifications when admin changes order status (processing / shipped / delivered / cancelled / refunded)

### Admin Dashboard (`/admin`)
- 📊 **Statistics** — Revenue, Orders, Products, Users at a glance
- 📦 **Products management** — Full CRUD with image uploads
- 🛒 **Orders management** — View all orders and update statuses
- 📋 **Inventory tracking** — Stock levels and low-stock alerts
- 🏷️ **Coupon management** — Create discount codes
- 👥 **User management** — View all registered users
- 🔐 **Admin-only access** — Protected via JWT role check

### Authentication
- 📧 Email/password sign-up & login
- ✉️ Email OTP verification via Nodemailer
- 🔐 Secure JWT tokens stored in HTTP-only cookies
- 🔑 Role-based access (`admin` vs `user`)

---

## 📁 Project Structure

```
raistore/
├── server/                    # Node.js / Express backend
│   └── src/
│       ├── config/
│       │   └── db.js          # MongoDB connection setup
│       ├── controllers/       # Route handler logic
│       │   ├── auth.controller.js
│       │   ├── product.controller.js
│       │   ├── category.controller.js
│       │   ├── order.controller.js
│       │   ├── inventory.controller.js
│       │   ├── coupon.controller.js
│       │   ├── wishlist.controller.js
│       │   └── payment.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification
│       │   └── admin.middleware.js  # Admin role check
│       ├── models/            # Mongoose schemas
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Category.js
│       │   ├── Order.js
│       │   ├── Inventory.js
│       │   ├── Coupon.js
│       │   └── Wishlist.js
│       ├── routes/            # Express route definitions
│       │   ├── auth.routes.js
│       │   ├── product.routes.js
│       │   ├── category.routes.js
│       │   ├── order.routes.js
│       │   ├── inventory.routes.js
│       │   ├── coupon.routes.js
│       │   ├── wishlist.routes.js
│       │   └── payment.routes.js
│       ├── utils/
│       │   ├── generateToken.js      # JWT token helper
│       │   └── emailService.js       # Brevo transactional email service
│       └── index.js           # App entry point
│
└── src/                       # React frontend
    ├── api/                   # Axios API client modules
    ├── components/            # Reusable UI components
    │   └── ui/                # shadcn/ui component library
    ├── context/               # React context providers
    ├── data/                  # Static/seed data
    ├── hooks/                 # Custom React hooks
    ├── lib/                   # Utility functions
    ├── pages/
    │   ├── ShopifyStorefront.jsx  # Main storefront (home)
    │   ├── ProductDetail.jsx      # Product detail page
    │   ├── ShopifyProductDetail.jsx
    │   ├── Checkout.jsx           # Checkout & Stripe payment
    │   ├── Orders.jsx             # Order history page
    │   ├── Profile.jsx            # User profile page
    │   ├── Admin.jsx              # Admin dashboard
    │   ├── Index.jsx              # Root redirect
    │   └── NotFound.jsx           # 404 page
    ├── stores/
    │   └── cartStore.js       # Zustand cart store (persisted)
    ├── App.jsx                # Root component with routing
    ├── main.jsx               # App entry point
    └── index.css              # Global styles & design tokens
```

---

## 🗺️ Pages & Routes

### Frontend Routes

| Route | Component | Description |
|---|---|---|
| `/` | `ShopifyStorefront` | Main storefront — hero, category tabs, product grid |
| `/product/:id` | `ProductDetail` | Product page with images, variants, add to cart |
| `/checkout` | `Checkout` | Cart review + Stripe payment form |
| `/orders` | `Orders` | User order history |
| `/profile` | `Profile` | User profile — edit details |
| `/admin` | `Admin` | Admin-only dashboard (role protected) |
| `*` | `NotFound` | 404 fallback page |

---

## 🔌 API Reference

All API routes are prefixed with `/api`.

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register a new user |
| `/api/auth/login` | POST | Public | Login and receive JWT cookie |
| `/api/auth/logout` | POST | Auth | Clear the auth cookie |
| `/api/auth/me` | GET | Auth | Get the logged-in user's profile |
| `/api/products` | GET | Public | List all products (with filters) |
| `/api/products/:id` | GET | Public | Get a single product |
| `/api/products` | POST | Admin | Create a new product |
| `/api/products/:id` | PUT | Admin | Update a product |
| `/api/products/:id` | DELETE | Admin | Delete a product |
| `/api/categories` | GET | Public | List all categories |
| `/api/orders` | GET | Auth | Get the current user's orders |
| `/api/orders` | POST | Auth | Place a new order |
| `/api/orders/:id` | PUT | Admin | Update order status |
| `/api/inventory` | GET | Admin | View inventory levels |
| `/api/coupons/validate` | POST | Auth | Validate a coupon code |
| `/api/coupons` | POST | Admin | Create a coupon |
| `/api/wishlists` | GET | Auth | Get user's wishlist |
| `/api/wishlists` | POST | Auth | Add item to wishlist |
| `/api/payment/create-intent` | POST | Auth | Create a Stripe Payment Intent |

---

## � Email Service (Brevo)

Transactional emails are sent automatically via the **Brevo API** (`@getbrevo/brevo` SDK).

**File:** `server/src/utils/emailService.js`

| Function | Trigger | Email Sent |
|---|---|---|
| `sendWelcomeEmail(user)` | New user registers | Welcome message with account details |
| `sendOrderConfirmationEmail(order)` | Order is created | Full order summary with items, totals & address |
| `sendOrderStatusEmail(order)` | Admin updates order status | Status notification with tracking link |

All emails are sent **non-blocking** — a Brevo failure never crashes the API response.

> ⚠️ The sender email (`BREVO_SENDER_EMAIL`) must be verified as a sender in the Brevo dashboard.

---

## �🔐 Authentication & Authorization

### Auth Flow

1. User submits email/password to `/api/auth/register` or `/api/auth/login`
2. Server verifies credentials and signs a **JWT**
3. JWT is stored in a **secure HTTP-only cookie** (not accessible via JS)
4. Protected routes check the cookie via `auth.middleware.js`
5. Admin routes additionally check `user.role === 'admin'` via `admin.middleware.js`

### Password Security

- Passwords are hashed with **bcryptjs** (salt rounds: 12) before storage
- Plain text passwords are never stored

---

## 🖥️ Admin Dashboard

Located at `/admin` — only accessible to users with `role: "admin"`.

### Tabs

| Tab | Features |
|---|---|
| **Dashboard** | KPI cards (Revenue, Orders, Products, Users) + recent orders table |
| **Products** | List, search, create, edit, delete products |
| **Orders** | View all orders, update status (pending → processing → shipped → delivered) |
| **Inventory** | Track stock per product/SKU/variant, low-stock alerts |
| **Coupons** | Create % or flat discount codes with expiry and usage limits |
| **Users** | View all registered users |

---

## 🗄️ Database Models

### `User`
| Field | Type | Description |
|---|---|---|
| `name` | String | Display name |
| `email` | String (unique) | Login email |
| `password` | String | Hashed password |
| `role` | String | `user` or `admin` |
| `avatar` | String | Profile picture URL |
| `isVerified` | Boolean | Email verification status |

### `Product`
| Field | Type | Description |
|---|---|---|
| `name` | String | Product name |
| `brand` | String | Brand name |
| `slug` | String (unique) | URL-safe identifier |
| `price` | Number | Current price |
| `originalPrice` | Number | Pre-sale price |
| `category` | ObjectId (FK) | Reference to Category |
| `images` | [String] | Array of image URLs |
| `colors` | [String] | Available color options |
| `sizes` | [String] | Available size options |
| `isFeatured` | Boolean | Show in featured section |
| `isActive` | Boolean | Publish toggle |

### `Order`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId (FK) | Reference to User |
| `items` | [Object] | Array of order line items |
| `status` | String | `pending` / `processing` / `shipped` / `delivered` / `cancelled` |
| `total` | Number | Order total after discounts |
| `shippingAddress` | Object | Delivery address |
| `paymentMethod` | String | Payment provider |
| `paymentStatus` | String | `pending` / `paid` / `failed` |

### `Inventory`
| Field | Type | Description |
|---|---|---|
| `product` | ObjectId (FK) | Reference to Product |
| `sku` | String | Stock-keeping unit |
| `quantity` | Number | Current stock count |
| `lowStockThreshold` | Number | Alert threshold |
| `color` / `size` | String | Variant dimensions |

### `Coupon`
| Field | Type | Description |
|---|---|---|
| `code` | String (unique) | Discount code |
| `discountType` | String | `percentage` or `fixed` |
| `discountValue` | Number | Amount off |
| `minOrderAmount` | Number | Minimum cart value |
| `maxUses` / `usedCount` | Number | Usage tracking |
| `expiresAt` | Date | Expiry date |
| `isActive` | Boolean | Enable/disable |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- **Stripe** account for payment processing

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd raistore

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
```

### Running in Development

Open **two terminals** and run both services simultaneously:

```bash
# Terminal 1 — Frontend (http://localhost:8080)
npm run dev

# Terminal 2 — Backend (http://localhost:5000)
cd server
npm run dev
```

---

## ⚙️ Environment Variables

### Frontend (`/.env`)

```env
VITE_API_URL=http://localhost:5000
```

### Backend (`/server/.env`)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/raistore
# OR for Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/raistore

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
CLIENT_URL=http://localhost:8080

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Brevo Transactional Email
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=your_verified_sender@example.com
```

---

## 📦 Scripts

### Frontend

```bash
npm run dev        # Start Vite dev server (localhost:8080)
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run Vitest unit tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
```

### Backend

```bash
cd server
npm run dev    # Start with nodemon (auto-restart on changes)
npm run start  # Start in production mode
```

---

## 🎨 Design System

### Custom Utilities (`index.css`)

| Class | Description |
|---|---|
| `gradient-hero` | Dark hero gradient background |
| `gradient-orange` | Brand orange gradient (CTA buttons) |
| `text-gradient` | Orange gradient text |
| `glass-dark` | Frosted glass dark effect |
| `shadow-brand` | Signature orange glow shadow |
| `animate-pulse-dot` | Pulsing status indicator |

### Component Library

Built on **shadcn/ui** + **Radix UI** primitives including: Accordion, Button, Card, Dialog, Drawer, Dropdown, Form, Input, Select, Sheet, Skeleton, Table, Tabs, Toast, Tooltip, and more.

---

## 📜 License

© 2025 RaiStore. All rights reserved. Built by **Sudhanshu**.
