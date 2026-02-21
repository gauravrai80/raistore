# 🔄 Convert RaiStore to MERN Stack — Full Step-by-Step Guide

This document covers **every single step** to convert RaiStore from its current stack (React + Vite + Supabase + Shopify) to a full **MERN Stack** (MongoDB + Express.js + React + Node.js), keeping the Shopify Storefront integration intact.

---

## 📐 Current Stack vs Target MERN Stack

| Layer | Current | MERN Target |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | React + Vite + **JavaScript** ✅ (converted) |
| **Styling** | Tailwind CSS + shadcn/ui | Tailwind CSS + shadcn/ui ✅ (keep) |
| **Animations** | Framer Motion | Framer Motion ✅ (keep) |
| **State** | Zustand + TanStack Query | Zustand + TanStack Query ✅ (keep) |
| **Commerce** | Shopify Storefront API | Shopify Storefront API ✅ (keep) |
| **Database** | Supabase (PostgreSQL) | MongoDB (Atlas) ❌ replace |
| **Auth** | Supabase Auth (JWT) | JWT + bcrypt (custom) ❌ replace |
| **Backend** | Supabase Edge Functions | Express.js + Node.js ❌ replace |
| **ORM/Client** | Supabase JS SDK | Mongoose ODM ❌ replace |
| **RLS Policies** | Supabase Row-Level Security | Express Middleware ❌ replace |
| **Language** | TypeScript | **JavaScript (ES Modules)** ❌ converted |

---

## 🗂️ Final MERN Project Structure

```
raistore-mern/
│
├── client/                          # React Frontend (current src/)
│   ├── src/
│   │   ├── api/                     # NEW: Axios API calls (replaces Supabase client)
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── categories.js
│   │   │   ├── coupons.js
│   │   │   ├── inventory.js
│   │   │   └── wishlist.js
│   │   ├── components/              # Keep all existing components (rename .tsx → .jsx)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # NEW: replaces Supabase auth
│   │   │   └── CartContext.jsx
│   │   ├── lib/
│   │   │   ├── shopify.js           # Keep as-is
│   │   │   └── utils.js             # Keep as-is
│   │   ├── stores/
│   │   │   └── cartStore.js         # Keep as-is (Shopify)
│   │   ├── pages/                   # Keep all pages, update API calls (rename .tsx → .jsx)
│   │   └── ...
│   ├── .env
│   └── package.json
│
└── server/                          # NEW: Express + Node.js Backend (pure JavaScript)
    ├── src/
    │   ├── config/
    │   │   └── db.js                # MongoDB connection
    │   ├── models/                  # Mongoose models
    │   │   ├── User.js
    │   │   ├── Product.js
    │   │   ├── Category.js
    │   │   ├── Order.js
    │   │   ├── Inventory.js
    │   │   ├── Coupon.js
    │   │   └── Wishlist.js
    │   ├── routes/                  # Express routers
    │   │   ├── auth.routes.js
    │   │   ├── product.routes.js
    │   │   ├── category.routes.js
    │   │   ├── order.routes.js
    │   │   ├── inventory.routes.js
    │   │   ├── coupon.routes.js
    │   │   └── wishlist.routes.js
    │   ├── controllers/             # Route handlers
    │   │   ├── auth.controller.js
    │   │   ├── product.controller.js
    │   │   ├── category.controller.js
    │   │   ├── order.controller.js
    │   │   ├── inventory.controller.js
    │   │   ├── coupon.controller.js
    │   │   └── wishlist.controller.js
    │   ├── middleware/              # Auth & Role guards
    │   │   ├── auth.middleware.js
    │   │   └── admin.middleware.js
    │   ├── utils/
    │   │   └── generateToken.js
    │   └── index.js                 # Express app entry point
    ├── .env
    └── package.json
```

---

## 🚀 Phase 1 — Set Up the Monorepo

### Step 1.1 — Initialize the Monorepo

Run these commands in your terminal:

```bash
mkdir raistore-mern && cd raistore-mern
mkdir client server
git init
```

Create the root `package.json`:

```json
{
  "name": "raistore-mern",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## 🗄️ Phase 2 — Set Up MongoDB Atlas

### Step 2.1 — Create a MongoDB Atlas Account

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a **free account** → Create a **free M0 cluster**
3. Choose a region close to your users
4. Create a **database user** — note the username and password
5. Under **Network Access** → Add IP `0.0.0.0/0` (allow all) for development
6. Click **Connect** → **Connect your application** → Copy the connection string

Connection string format:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/raistore?retryWrites=true&w=majority
```

---

## ⚙️ Phase 3 — Build the Express Backend (JavaScript)

### Step 3.1 — Initialize the Server

```bash
cd server
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv cookie-parser express-rate-limit helmet nodemailer
npm install -D nodemon
```

> ✅ No TypeScript — pure JavaScript with ES Modules (`"type": "module"` in package.json)

### Step 3.2 — Server `package.json`

```json
{
  "name": "raistore-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Step 3.3 — Server `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/raistore
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### Step 3.4 — `nodemon.json` (auto-restart on changes)

```json
{
  "watch": ["src"],
  "ext": "js",
  "ignore": ["src/**/*.test.js"],
  "exec": "node src/index.js"
}
```

---

## 🗃️ Phase 4 — Create MongoDB Models (JavaScript, replacing Supabase Tables)

### Step 4.1 — `server/src/config/db.js`

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

### Step 4.2 — `server/src/models/User.js`
*(Replaces: Supabase `profiles` + `user_roles` + Supabase Auth)*

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    full_name:              { type: String, required: true, trim: true },
    email:                  { type: String, required: true, unique: true, lowercase: true },
    password:               { type: String, required: true, minlength: 6, select: false },
    avatar_url:             { type: String },
    phone:                  { type: String },
    role:                   { type: String, enum: ['admin', 'user'], default: 'user' },
    is_verified:            { type: Boolean, default: false },
    verification_token:     { type: String, select: false },
    reset_password_token:   { type: String, select: false },
    reset_password_expires: { type: Date, select: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
```

---

### Step 4.3 — `server/src/models/Category.js`
*(Replaces: Supabase `categories`)*

```javascript
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    slug:          { type: String, required: true, unique: true },
    icon:          { type: String },
    image_url:     { type: String },
    description:   { type: String },
    display_order: { type: Number, default: 0 },
    is_active:     { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export default mongoose.model('Category', CategorySchema);
```

---

### Step 4.4 — `server/src/models/Product.js`
*(Replaces: Supabase `products`)*

```javascript
import mongoose from 'mongoose';

const BADGE_VALUES = ['Best Seller', 'New', 'Sale', 'Limited', 'Trending'];

const ProductSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    slug:           { type: String, required: true, unique: true },
    brand:          { type: String, required: true },
    description:    { type: String },
    price:          { type: Number, required: true },
    original_price: { type: Number },
    category_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subcategory:    { type: String },
    images:         { type: [String], default: [] },
    colors:         { type: [String], default: [] },
    sizes:          { type: [String], default: [] },
    features:       { type: [String], default: [] },
    badge:          { type: String, enum: BADGE_VALUES },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    review_count:   { type: Number, default: 0 },
    is_featured:    { type: Boolean, default: false },
    is_active:      { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Text search index
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

export default mongoose.model('Product', ProductSchema);
```

---

### Step 4.5 — `server/src/models/Order.js`
*(Replaces: Supabase `orders` + `order_items`)*

```javascript
import mongoose from 'mongoose';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrderItemSchema = new mongoose.Schema({
  product_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name:   { type: String, required: true },
  brand:          { type: String },
  price:          { type: Number, required: true },
  quantity:       { type: Number, required: true },
  product_image:  { type: String },
  selected_color: { type: String },
  selected_size:  { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    order_number:     { type: String, unique: true, default: () => `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}` },
    user_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer_name:    { type: String, required: true },
    customer_email:   { type: String, required: true },
    items:            { type: [OrderItemSchema], required: true },
    subtotal:         { type: Number, required: true },
    shipping_cost:    { type: Number, default: 0 },
    tax:              { type: Number, default: 0 },
    discount:         { type: Number, default: 0 },
    total:            { type: Number, required: true },
    status:           { type: String, enum: ORDER_STATUSES, default: 'pending' },
    payment_status:   { type: String, default: 'pending' },
    payment_method:   { type: String },
    shipping_address: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes:            { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Order', OrderSchema);
```

---

### Step 4.6 — `server/src/models/Inventory.js`
*(Replaces: Supabase `inventory`)*

```javascript
import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    product_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku:                 { type: String },
    quantity:            { type: Number, default: 0, min: 0 },
    low_stock_threshold: { type: Number, default: 10 },
    color:               { type: String },
    size:                { type: String },
  },
  { timestamps: { updatedAt: 'updated_at' } }
);

export default mongoose.model('Inventory', InventorySchema);
```

---

### Step 4.7 — `server/src/models/Coupon.js`
*(Replaces: Supabase `coupons`)*

```javascript
import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code:             { type: String, required: true, unique: true, uppercase: true },
    description:      { type: String },
    discount_type:    { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discount_value:   { type: Number, required: true },
    min_order_amount: { type: Number, default: 0 },
    max_uses:         { type: Number },
    used_count:       { type: Number, default: 0 },
    expires_at:       { type: Date },
    is_active:        { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export default mongoose.model('Coupon', CouponSchema);
```

---

### Step 4.8 — `server/src/models/Wishlist.js`
*(Replaces: Supabase `wishlists`)*

```javascript
import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema(
  {
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

// Prevent duplicate wishlist entries
WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model('Wishlist', WishlistSchema);
```

---

## 🛡️ Phase 5 — Auth Middleware (Replaces Supabase RLS)

### Step 5.1 — `server/src/utils/generateToken.js`

```javascript
import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
```

### Step 5.2 — `server/src/middleware/auth.middleware.js`
*(Replaces: Supabase JWT verification + RLS `auth.uid()`)*

```javascript
import jwt from 'jsonwebtoken';

// Protect route — must be logged in
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional auth — attach user if token present but don't block
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    } catch { /* silent fail */ }
  }
  next();
};
```

### Step 5.3 — `server/src/middleware/admin.middleware.js`
*(Replaces: Supabase `has_role()` RLS function)*

```javascript
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

---

## 🔗 Phase 6 — Express Routes & Controllers

### Step 6.1 — `server/src/controllers/auth.controller.js`
*(Replaces: Supabase Auth — sign up, sign in, sign out, profile)*

```javascript
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
export const register = async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ full_name, email, password });
    // In production: send verification email here

    const token = generateToken(user._id.toString(), user.role);
    res.status(201).json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id.toString(), user.role);
    res.json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url, phone: user.phone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { full_name: req.body.full_name, phone: req.body.phone, avatar_url: req.body.avatar_url },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(current_password))) {
      return res.status(401).json({ message: 'Current password incorrect' });
    }
    user.password = new_password;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### Step 6.2 — `server/src/controllers/product.controller.js`
*(Replaces: Supabase products table queries)*

```javascript
import Product from '../models/Product.js';

// GET /api/products — public
export const getProducts = async (req, res) => {
  const { category, featured, badge, search, page = 1, limit = 20 } = req.query;
  const filter = { is_active: true };

  if (category) filter.category_id = category;
  if (featured === 'true') filter.is_featured = true;
  if (badge) filter.badge = badge;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category_id', 'name slug').skip(skip).limit(Number(limit)).sort('-created_at'),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// GET /api/products/:slug — public
export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, is_active: true }).populate('category_id', 'name slug');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /api/products — admin only
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id — admin only
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// DELETE /api/products/:id — admin only (soft delete)
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { is_active: false });
  res.json({ message: 'Product deactivated' });
};
```

---

### Step 6.3 — `server/src/controllers/order.controller.js`

```javascript
import Order from '../models/Order.js';

// POST /api/orders — public (guest or user)
export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      user_id: req.user?.id || undefined,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/orders/my — authenticated user
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user_id: req.user.id }).sort('-created_at');
  res.json(orders);
};

// GET /api/orders — admin only
export const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(Number(limit)).sort('-created_at'),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total });
};

// PUT /api/orders/:id/status — admin only
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};
```

---

### Step 6.4 — `server/src/routes/*.routes.js`

**`auth.routes.js`:**
```javascript
import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
export default router;
```

**`product.routes.js`:**
```javascript
import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = Router();
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
export default router;
```

**`order.routes.js`:**
```javascript
import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = Router();
router.post('/', optionalAuth, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
export default router;
```

---

### Step 6.5 — `server/src/index.js` (Main Express App)

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';

dotenv.config();
connectDB();

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/wishlists',  wishlistRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
```

---

## ⚛️ Phase 7 — Update the React Frontend (TypeScript → JavaScript)

### Step 7.1 — Set Up Client

```bash
# Copy existing src/ into client/ folder
cp -r src/ client/src/

# Rename all .tsx files to .jsx and .ts files to .js
find client/src -name "*.tsx" -exec sh -c 'mv "$1" "${1%.tsx}.jsx"' _ {} \;
find client/src -name "*.ts" -exec sh -c 'mv "$1" "${1%.ts}.js"' _ {} \;

cd client
npm install axios
npm uninstall typescript @types/react @types/react-dom @types/node
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SHOPIFY_STORE_DOMAIN=bloom-commerce-cemnh.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=f7636c4448a0d0bdeb0ca2a6376ce7cc
```

### Step 7.2 — Update `client/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 7.3 — Create `client/src/api/client.js`
*(Replaces: `src/integrations/supabase/client.ts`)*

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raistore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('raistore_token');
      localStorage.removeItem('raistore_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 7.4 — Create `client/src/context/AuthContext.jsx`
*(Replaces: Supabase Auth session management)*

```jsx
import { createContext, useContext, useState } from 'react';
import api from '@/api/client';
import { toast } from 'sonner';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('raistore_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('raistore_token'));
  const [isLoading, setIsLoading] = useState(false);

  const saveSession = (token, user) => {
    localStorage.setItem('raistore_token', token);
    localStorage.setItem('raistore_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.full_name}!`);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (full_name, email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { full_name, email, password });
      saveSession(data.token, data.user);
      toast.success('Account created!');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('raistore_token');
    localStorage.removeItem('raistore_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    const { data: updated } = await api.put('/auth/profile', data);
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('raistore_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Step 7.5 — Create API Modules

**`client/src/api/products.js`:**
```javascript
import api from './client.js';

export const getProducts = (params) =>
  api.get('/products', { params }).then(r => r.data);

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`).then(r => r.data);

export const createProduct = (data) =>
  api.post('/products', data).then(r => r.data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then(r => r.data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then(r => r.data);
```

**`client/src/api/orders.js`:**
```javascript
import api from './client.js';

export const createOrder = (data) =>
  api.post('/orders', data).then(r => r.data);

export const getMyOrders = () =>
  api.get('/orders/my').then(r => r.data);

export const getAllOrders = (params) =>
  api.get('/orders', { params }).then(r => r.data);

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then(r => r.data);
```

**`client/src/api/categories.js`:**
```javascript
import api from './client.js';

export const getCategories = () =>
  api.get('/categories').then(r => r.data);

export const createCategory = (data) =>
  api.post('/categories', data).then(r => r.data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then(r => r.data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data);
```

**`client/src/api/wishlist.js`:**
```javascript
import api from './client.js';

export const getWishlist = () =>
  api.get('/wishlists').then(r => r.data);

export const addToWishlist = (product_id) =>
  api.post('/wishlists', { product_id }).then(r => r.data);

export const removeFromWishlist = (product_id) =>
  api.delete(`/wishlists/${product_id}`).then(r => r.data);
```

### Step 7.6 — Update Admin Dashboard

Replace all Supabase client calls in `Admin.jsx`:

```javascript
// BEFORE (Supabase):
const { data } = await supabase.from('products').select('*');

// AFTER (Axios API):
import { getProducts } from '@/api/products';
const data = await getProducts();
```

### Step 7.7 — Update Navbar Auth

Replace Supabase auth in `Navbar.jsx` and `AuthModal.jsx`:

```javascript
// BEFORE (Supabase):
import { supabase } from '@/integrations/supabase/client';
const { data: { user } } = await supabase.auth.getUser();

// AFTER (AuthContext):
import { useAuth } from '@/context/AuthContext';
const { user, login, logout, register } = useAuth();
```

### Step 7.8 — Update `client/src/App.jsx`

```jsx
import { AuthProvider } from './context/AuthContext.jsx';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>                          {/* ← Add this */}
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

---

## 📦 Phase 8 — Data Migration (Supabase → MongoDB)

### Step 8.1 — Export from Supabase

Go to Lovable Cloud → Database → Tables and export each table as CSV:
- `products.csv`
- `categories.csv`
- `orders.csv`
- `inventory.csv`
- `coupons.csv`

### Step 8.2 — Write Migration Script

Create `server/scripts/migrate.js`:

```javascript
import mongoose from 'mongoose';
import { createReadStream } from 'fs';
import csv from 'csvtojson';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Migrate categories
  const categories = await csv().fromFile('./scripts/data/categories.csv');
  for (const cat of categories) {
    await Category.updateOne({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log(`✅ Migrated ${categories.length} categories`);

  // Migrate products
  const products = await csv().fromFile('./scripts/data/products.csv');
  for (const product of products) {
    product.images   = product.images   ? JSON.parse(product.images)   : [];
    product.features = product.features ? JSON.parse(product.features) : [];
    product.colors   = product.colors   ? JSON.parse(product.colors)   : [];
    product.sizes    = product.sizes    ? JSON.parse(product.sizes)    : [];
    await Product.updateOne({ slug: product.slug }, product, { upsert: true });
  }
  console.log(`✅ Migrated ${products.length} products`);

  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrate().catch(console.error);
```

```bash
npm install csvtojson
node scripts/migrate.js
```

---

## 🔒 Phase 9 — Security Hardening

### Step 9.1 — Rate Limiting (Replaces Supabase rate limits)

```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 auth attempts
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### Step 9.2 — Input Validation

```bash
npm install express-validator
```

```javascript
import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
```

---

## 🚀 Phase 10 — Deployment

### Step 10.1 — Deploy Backend (Railway / Render)

**Railway:**
1. Push server code to GitHub
2. Create new Railway project → Deploy from GitHub
3. Add environment variables from `server/.env`
4. Railway auto-detects Node.js and deploys

**Render:**
1. New Web Service → Connect GitHub repo
2. Build command: `cd server && npm install`
3. Start command: `cd server && npm start`
4. Add environment variables

### Step 10.2 — Deploy Frontend (Vercel)

```bash
cd client
npm run build
```

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Framework: **Vite**
4. Root Directory: `client`
5. Add env var: `VITE_API_URL=https://your-backend.railway.app/api`
6. Deploy ✅

### Step 10.3 — Update CORS

In `server/.env`:
```env
CLIENT_URL=https://your-app.vercel.app
```

---

## 📊 Complete API Reference (Replacing Supabase Tables)

| Supabase Table | Old Method | New MERN Endpoint |
|---|---|---|
| `products` SELECT | `supabase.from('products').select()` | `GET /api/products` |
| `products` INSERT | `supabase.from('products').insert()` | `POST /api/products` |
| `products` UPDATE | `supabase.from('products').update()` | `PUT /api/products/:id` |
| `products` DELETE | `supabase.from('products').delete()` | `DELETE /api/products/:id` |
| `orders` SELECT | `supabase.from('orders').select()` | `GET /api/orders/my` |
| `orders` INSERT | `supabase.from('orders').insert()` | `POST /api/orders` |
| `categories` SELECT | `supabase.from('categories').select()` | `GET /api/categories` |
| `inventory` SELECT | `supabase.from('inventory').select()` | `GET /api/inventory` |
| `coupons` SELECT | `supabase.from('coupons').select()` | `GET /api/coupons` |
| `profiles` SELECT | `supabase.auth.getUser()` | `GET /api/auth/me` |
| `profiles` UPDATE | `supabase.from('profiles').update()` | `PUT /api/auth/profile` |
| `wishlists` ALL | `supabase.from('wishlists')...` | `GET/POST/DELETE /api/wishlists` |
| Auth sign up | `supabase.auth.signUp()` | `POST /api/auth/register` |
| Auth sign in | `supabase.auth.signInWithPassword()` | `POST /api/auth/login` |
| Auth sign out | `supabase.auth.signOut()` | Clear localStorage token |
| RLS `has_role()` | Supabase DB function | `admin.middleware.js` |

---

## 🧪 Testing the MERN Stack

```bash
# Install testing tools
cd server && npm install -D jest supertest

# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@test.com","password":"password123"}'

# Test products endpoint
curl http://localhost:5000/api/products

# Test admin protected route
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","slug":"test-product","brand":"Test","price":99}'
```

---

## ✅ Conversion Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Express server initialized with **JavaScript (ES Modules)**
- [ ] All 7 Mongoose models created (`.js` files)
- [ ] Auth middleware (JWT protect + adminOnly) implemented
- [ ] Auth controller (register, login, getMe, updateProfile) done
- [ ] Product controller + routes done
- [ ] Order controller + routes done
- [ ] Category, Inventory, Coupon, Wishlist controllers done
- [ ] Express server boots and connects to MongoDB
- [ ] React client `.tsx` → `.jsx` and `.ts` → `.js` renamed
- [ ] Axios client (`api/client.js`) configured
- [ ] `AuthContext.jsx` created and wrapping App
- [ ] All Supabase imports removed from frontend
- [ ] Admin dashboard updated to use Axios API calls
- [ ] Navbar/AuthModal updated to use AuthContext
- [ ] Data migrated from Supabase CSV exports to MongoDB
- [ ] Rate limiting added to auth routes
- [ ] Input validation added
- [ ] Backend deployed (Railway/Render)
- [ ] Frontend deployed (Vercel)
- [ ] CORS updated to production URLs
- [ ] Shopify integration still works (no changes needed ✅)

---

## ⚠️ What DOES NOT Change

These parts of the codebase are **identical** in MERN — **no migration needed** (just rename `.ts` → `.js`):

| File | Reason |
|---|---|
| `src/lib/shopify.js` | Pure Shopify Storefront API — no Supabase |
| `src/stores/cartStore.js` | Pure Shopify cart mutations — no Supabase |
| `src/components/ShopifyCartDrawer.jsx` | Uses cart store only |
| `src/components/ShopifyProductCard.jsx` | Uses Shopify data only |
| `src/pages/ShopifyStorefront.jsx` | Shopify GraphQL only |
| `src/pages/ShopifyProductDetail.jsx` | Shopify GraphQL only |
| `tailwind.config.js` | Styling — no backend |
| `src/index.css` | Styling — no backend |
| All `src/components/ui/` | shadcn/ui — no backend |

---

© 2025 RaiStore MERN Conversion Guide
