# Qurion Tech — Full Project Documentation

> A full-featured e-commerce web application for selling electronic components. The store name, theme, logo, and all content are configurable from the admin panel without touching code.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Database Models](#3-database-models)
4. [Backend API Routes](#4-backend-api-routes)
5. [Frontend Pages & Routes](#5-frontend-pages--routes)
6. [Feature Breakdown](#6-feature-breakdown)
   - [Authentication & Users](#authentication--users)
   - [Products & Catalog](#products--catalog)
   - [Flash Sales](#flash-sales)
   - [Product Variants](#product-variants)
   - [Cart & Checkout](#cart--checkout)
   - [Orders](#orders)
   - [Wishlist](#wishlist)
   - [Reviews & Ratings](#reviews--ratings)
   - [Loyalty Wallet & Points](#loyalty-wallet--points)
   - [Referral System](#referral-system)
   - [Coupons](#coupons)
   - [Blog & Content](#blog--content)
   - [Admin Panel](#admin-panel)
   - [Staff & Roles](#staff--roles)
   - [Payments — PhonePe](#payments--phonepe)
   - [Shipping — Shiprocket](#shipping--shiprocket)
   - [Email — Resend](#email--resend)
   - [SEO](#seo)
   - [Theme & Settings](#theme--settings)
   - [CSV Product Import](#csv-product-import)
7. [Environment Variables](#7-environment-variables)
8. [Local Development Setup](#8-local-development-setup)
9. [Deployment](#9-deployment)
10. [Remaining / Pending Work](#10-remaining--pending-work)
11. [Code Review — Bugs Fixed](#11-code-review--bugs-fixed)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Routing** | React Router v6 (HashRouter — `/#/path`) |
| **Backend** | Node.js, Express, TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JWT (localStorage) + bcrypt |
| **Payments** | PhonePe Payment Gateway |
| **Shipping** | Shiprocket API |
| **Email** | Resend (transactional emails) |
| **Image uploads** | Multer + Sharp (resize/compress) |
| **Logging** | Pino + optional Sentry |
| **Containerization** | Docker + Docker Compose |
| **CI** | GitHub Actions (type-check, lint) |

---

## 2. Project Structure

```
shop/
├── server/                       # Express backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (source of truth)
│   │   └── migrations/           # SQL migration history
│   │       ├── 20260615000000_add_product_variants/
│   │       ├── 20260615120000_add_staff_roles/
│   │       ├── 20260615180000_add_flash_sale/
│   │       └── 20260615200000_add_loyalty_wallet/
│   ├── src/
│   │   ├── controllers/          # Express route handlers
│   │   │   ├── adminController.ts
│   │   │   ├── authController.ts
│   │   │   ├── cartController.ts
│   │   │   ├── csvImportController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── productController.ts
│   │   │   └── settingController.ts
│   │   ├── services/             # Business logic layer
│   │   │   ├── adminService.ts
│   │   │   ├── authService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── productService.ts
│   │   │   └── walletService.ts
│   │   ├── routes/               # Express routers
│   │   │   ├── adminRoutes.ts
│   │   │   ├── cartRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   └── walletRoutes.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts # JWT verify, role/permission guards
│   │   ├── config.ts             # Env var access
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── server.ts             # Express app bootstrap
│   ├── uploads/products/         # Uploaded product images (served statically)
│   └── Dockerfile
│
├── web/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # Admin panel modules
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── types.ts      # AdminView union type
│   │   │   │   ├── views.tsx     # All admin panel views
│   │   │   │   ├── forms.tsx     # Reusable admin forms
│   │   │   │   └── shared.tsx    # Shared admin UI primitives
│   │   │   ├── UIElements/       # Shared UI (Button, etc.)
│   │   │   ├── AccountView.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── CartView.tsx
│   │   │   ├── CategoryView.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ImageZoom.tsx
│   │   │   ├── LoginView.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── RegisterView.tsx
│   │   │   └── WishlistView.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # User auth state, login/register/logout
│   │   │   └── CartContext.tsx   # Cart state, wallet, checkout
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useCart.ts
│   │   ├── services/
│   │   │   ├── api.ts            # All public + user API calls
│   │   │   └── adminApi.ts       # Admin-only API calls
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   ├── utils/imageUtils.ts   # Image URL helper
│   │   └── App.tsx               # Root component, routing, page rendering
│   ├── public/
│   └── Dockerfile
│
├── docker-compose.yml            # Full-stack local orchestration
├── render.yaml                   # Render.com deployment config
├── DOCUMENTATION.md              # Extended documentation
└── README.md                     # This file
```

---

## 3. Database Models

### User
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| email | String | Unique |
| name | String? | Display name |
| passwordHash | String | bcrypt |
| isAdmin | Boolean | Supersedes all permission checks |
| role | String | `CUSTOMER` / `STAFF` / `ADMIN` |
| permissions | Json? | Granular staff permissions object |
| isVerified | Boolean | Email verification status |
| walletBalance | Int | Points balance (1 pt = ₹1) |
| referralCode | String? | Unique shareable code (lazy-generated on first /auth/me call) |
| referredBy | String? | Referrer's user ID stored at signup; cleared after referrer bonus fires |

### Address
| Field | Type | Notes |
|---|---|---|
| type | String | `HOME`, `WORK`, etc. |
| street, city, state, pincode, country, phone | String | Full address fields |
| isDefault | Boolean | One default per user |

### Product
| Field | Type | Notes |
|---|---|---|
| name, slug | String | slug is URL-safe unique identifier |
| price | Float | Current selling price |
| originalPrice | Float? | Shown as strikethrough if set |
| salePrice | Float? | Flash sale price (overrides price when active) |
| saleEndsAt | DateTime? | Flash sale expiry; sale auto-deactivates after this time |
| imageUrl | String | Primary image |
| images | String[] | Gallery images |
| sku | String? | Unique stock-keeping unit |
| specifications | Json? | Key-value spec table |
| stock | Int | Inventory count |
| metaTitle, metaDescription | String? | SEO override fields |
| categoryId | FK | Required; `onDelete: Restrict` |

### ProductVariant
Each product can have multiple variants (e.g. different resistor values, capacitor tolerances, pack sizes).

| Field | Notes |
|---|---|
| name | Variant label (e.g. "10kΩ", "Pack of 50") |
| price, originalPrice | Override base product price |
| stock | Independent stock per variant |
| sku | Optional per-variant SKU |
| imageUrl | Optional variant-specific image |

### Order
| Field | Notes |
|---|---|
| status | `PENDING` → `PENDING_PAYMENT` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED` |
| paymentStatus | `PENDING` / `PAID` / `FAILED` |
| paymentId | PhonePe transaction ID (unique) |
| shippingAddress, city, state, pincode, phone | Snapshot of delivery address at order time |
| shiprocketOrderId, shiprocketShipmentId, awbCode | Shiprocket integration fields |
| discountAmount, couponCode | Coupon applied at checkout |
| pointsEarned | Loyalty points credited on this order |
| pointsRedeemed | Points used to reduce this order's total |
| walletDiscount | ₹ value deducted from total via wallet points |

### Other Models

| Model | Description |
|---|---|
| **Cart / CartItem** | Persistent server-side cart per user; one cart per user; supports variants and applied coupon |
| **Coupon** | Percentage or fixed discount; optional expiry, global usage limit, per-user usage limit, minimum cart value |
| **CouponUsage** | One row per `(couponId, userId)` per use; enforces per-user limits and tracks usage accurately on cancel/refund |
| **Return** | Customer return request against a delivered+paid order; status `PENDING` → `APPROVED` / `REJECTED`; optional wallet refund on approval |
| **Wishlist / WishlistItem** | One wishlist per user; public share link via URL hash; unique per user+product |
| **Review** | One review per user per product (DB-enforced unique); star rating + text comment |
| **BlogPost** | Type: `BLOG` or `TUTORIAL`; status: `DRAFT` / `PUBLISHED` |
| **Brand** | Logo, optional website URL, display order |
| **HomeSlide** | Hero carousel slides; title, image, optional link, display order |
| **Video** | YouTube video embeds; type `FULL` or `SHORT`; category and order |
| **Faq** | Questions grouped by category with display order |
| **WalletTransaction** | Full double-entry ledger for points; types: `CREDIT_ORDER`, `CREDIT_REFERRAL`, `CREDIT_ADMIN`, `DEBIT_ORDER`, `DEBIT_ADMIN` |
| **StockNotification** | Email subscriptions for out-of-stock products; unique per email+product pair |
| **NewsletterSubscriber** | Captured emails from footer newsletter form |
| **Setting** | Key-value store for all admin-configurable settings |
| **EmailVerificationToken** | Time-limited token for verifying new email addresses |
| **PasswordResetToken** | Time-limited single-use token for password reset flow |

---

## 4. Backend API Routes

Base URL: `/api`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register; accepts optional `referralCode` |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | ✅ | Get current user profile (lazy-generates referral code for existing users) |
| PUT | `/profile` | ✅ | Update name / email |
| PUT | `/password` | ✅ | Change password (requires current password) |
| POST | `/forgot-password` | — | Send password reset link via Resend |
| POST | `/reset-password` | — | Reset password with token from email |
| POST | `/send-verification` | ✅ | Resend verification email |
| POST | `/verify-email` | — | Mark email verified with token |

### Products — `/api/products`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List products (search, category filter, sort, paginate) |
| GET | `/slug/:slug` | Get product by slug |
| GET | `/:id` | Get product by ID |
| GET | `/:id/related` | Related products in same category |
| POST | `/:id/notify` | Subscribe to back-in-stock email notification |
| POST | `/serviceability` | Check Shiprocket pincode delivery availability |

### Cart — `/api/cart` (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get cart with items, applied coupon, product details |
| POST | `/add` | Add item; supports `variantId` and `variantName` |
| PUT | `/update/:cartItemId` | Update item quantity |
| DELETE | `/remove/:cartItemId` | Remove item |
| POST | `/apply-coupon` | Apply coupon code |
| DELETE | `/remove-coupon` | Remove applied coupon |

### Orders — `/api/orders` (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get user's full order history |
| POST | `/initiate-phonepe` | Create pending order + initiate PhonePe payment; accepts `pointsToRedeem` |
| GET | `/phonepe-status/:transactionId` | Poll payment status; confirms order and awards points on PAID |
| POST | `/:id/cancel` | Cancel an order (PROCESSING status only) |
| POST | `/returns` | Submit a return request (DELIVERED + PAID orders only) |
| GET | `/returns` | Get the current user's return requests |

### Admin Returns — `/api/admin/returns` (auth required, `orders` permission)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all return requests with user and order details |
| PUT | `/:id` | Approve or reject a return; optionally credit wallet |

### Wallet — `/api/wallet` (auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/` | Get current wallet balance |
| GET | `/history?skip=0&take=50` | Get paginated wallet transaction history (max 200 per page) |

### Public Routes
| Route prefix | Description |
|---|---|
| `/api/categories` | Category listing |
| `/api/slides` | Hero slide listing |
| `/api/wishlist` | Wishlist CRUD (auth required) |
| `/api/addresses` | Address book CRUD (auth required) |
| `/api/reviews` | Product reviews; read public, write requires auth |
| `/api/blogs` | Blog listing (filter by type: BLOG / TUTORIAL) |
| `/api/brands` | Brand listing |
| `/api/videos` | Video listing (filter by type) |
| `/api/faqs` | FAQ listing |
| `/api/coupons/active` | Public list of currently active coupons |
| `/api/settings` | Public store settings (name, logo, theme, etc.) |
| `/api/newsletter` | Newsletter subscribe |
| `/api/sitemap.xml` | Auto-generated XML sitemap |
| `/api/upload` | Image upload endpoint (admin auth required) |

### Admin API — `/api/admin` (staff/admin JWT required)

| Resource | Endpoints | Required Permission |
|---|---|---|
| Dashboard stats | `GET /stats?period=today\|week\|month\|all` | Any staff |
| Users | `GET /users`, `PUT /users/:id`, `DELETE /users/:id` | `users` |
| User wallet | `POST /users/:id/wallet` (adjust), `GET /users/:id/wallet-history` | `users` |
| Staff management | `GET /staff`, `POST /staff`, `PUT /staff/:id`, `DELETE /staff/:id` | Admin only |
| Products | Full CRUD | `products` |
| Product variants | Full CRUD under `/products/:id/variants` | `products` |
| CSV import | `POST /products/import-csv` | `products` |
| Low stock alert | `GET /products/low-stock?threshold=N` | `products` |
| Categories | Full CRUD | `categories` |
| Orders | `GET /orders`, `PUT /orders/:id` (status update) | `orders` |
| Coupons | Full CRUD | `coupons` |
| Home slides | Full CRUD | `slides` |
| Brands | Full CRUD | `slides` |
| Blog posts | Full CRUD | `blog` |
| Videos | Full CRUD | `blog` |
| FAQs | Full CRUD | `blog` |
| Newsletter subscribers | `GET /newsletter`, `DELETE /newsletter/:id` | `users` |
| Stock notifications | `GET /stock-notifications` | `products` |
| Settings | `GET /settings` (staff), `PUT /settings` (admin only) | `settings` |

---

## 5. Frontend Pages & Routes

All routes use `HashRouter` (`/#/path`). Route definitions are in `web/src/App.tsx`.

| Route | Component | Description |
|---|---|---|
| `#/` | Home | Hero slider, flash sale banner, featured products, categories, brands, blog preview |
| `#/products` | ProductsPage | Full catalog with search, category filter, sort, pagination |
| `#/product/:slug` | ProductDetail | Gallery with zoom, variant selector, add to cart/wishlist, specs table, reviews, related products, back-in-stock subscribe |
| `#/categories` | CategoriesPage | All category cards |
| `#/category/:slug` | CategoryView | Products filtered by category |
| `#/cart` | CartView | Cart items, coupon picker, wallet points redemption, order summary |
| `#/checkout` | CheckoutView | Address book selection / add new address, confirm and trigger PhonePe payment |
| `#/wishlist` | WishlistView | Saved items + shareable public link |
| `#/wishlist/shared` | SharedWishlistPage | Public shared wishlist view (no auth required) |
| `#/login` | LoginView | Login form |
| `#/register` | RegisterView | Registration form; referral code input pre-filled from `?ref=CODE`; amber bonus banner when code entered |
| `#/forgot-password` | ForgotPasswordView | Request password reset email |
| `#/reset-password` | ResetPasswordView | Set new password via emailed token |
| `#/account` | AccountView | Tabbed dashboard: Profile, Orders, Addresses, Wallet & Rewards, Reviews |
| `#/payment-status/:id` | PaymentStatusPage | Post-payment confirmation / failure screen |
| `#/blogs` | BlogListPage | Blog posts and tutorials |
| `#/brands` | BrandsListPage | Brand showcase page |
| `#/faq` | FaqPage | Frequently asked questions, grouped by category |
| `#/legal/:slug` | LegalPage | Privacy policy, terms of service, etc. (content from Settings) |
| `#/admin` | AdminDashboard | Full admin panel; protected, staff/admin only |

---

## 6. Feature Breakdown

### Authentication & Users

- **Registration** with name, email, password; optional referral code via `?ref=CODE` URL param or visible manual input field on the form
- **Login** returns a JWT stored in `localStorage`; auto-loaded on app start via `AuthContext`
- **Email verification** — opt-in (Reddit-style); new accounts are functional immediately; unverified users see a dismissible yellow banner prompting them to verify
- **Password reset** — sends a time-limited single-use link via Resend; token verified on `/reset-password`
- **Profile management** — update display name and email; change password (requires current password)
- **Address book** — add, edit, delete multiple saved addresses per user; one can be set as default; used as address picker at checkout
- **Role system** — three tiers:
  - `CUSTOMER` — standard shopper
  - `STAFF` — limited admin access based on permissions object
  - `ADMIN` — full access to everything (equivalent to `isAdmin: true`)

### Products & Catalog

- **Full catalog** at `/products` with:
  - Server-side text search (name, description)
  - Filter by category
  - Sort by price (asc/desc), name (asc/desc), newest
  - Pagination (configurable page size)
- **Product detail page** with:
  - Primary image + scrollable gallery (drag-to-reorder, multi-upload, set-as-primary in admin)
  - Image zoom on hover (`ImageZoom` component)
  - Variant selector (if variants exist)
  - Stock badge (In Stock / Low Stock / Out of Stock)
  - Specifications table (from `specifications` JSON field)
  - Related products carousel (same category)
  - Add to cart / Add to wishlist
  - Back-in-stock email subscription for out-of-stock items
  - Customer reviews section

### Flash Sales

- Products can have a `salePrice` and `saleEndsAt` set from the admin panel
- When active, `salePrice` overrides the regular `price` in cart calculations
- A countdown timer shows the time remaining on the product card and detail page
- Flash sale badge shown on product cards and homepage banner
- Flash sale automatically expires after `saleEndsAt` — no manual reset needed

### Product Variants

- Any product can have multiple variants (e.g. "10kΩ", "100kΩ" or "Pack of 10", "Pack of 50")
- Each variant independently tracks: `name`, `price`, `originalPrice`, `stock`, `sku`, `imageUrl`
- Variant selected in the UI is attached to cart items and order items (`variantId`, `variantName`)
- Cart price uses variant price when a variant is selected
- Admin panel has a dedicated variant editor per product

### Cart & Checkout

- **Persistent server-side cart** for logged-in users; one cart per user
- **Guest cart** stored in `localStorage`; automatically merged into server cart on login
- **Coupon picker** — expandable list of active coupons with eligibility check; manual code entry also available
- **Wallet points redemption** — amber panel in cart; user inputs how many points to redeem; "Use Max" button; capped at 50% of order value and user's actual balance; 1 pt = ₹1
- **Order summary** shows subtotal, coupon discount, wallet discount, shipping (free), and final total
- **Checkout flow**:
  1. User selects or adds a shipping address
  2. App calls `POST /orders/initiate-phonepe` with shipping details and `pointsToRedeem`
  3. Backend creates `PENDING_PAYMENT` order atomically with wallet debit, returns PhonePe payment URL
  4. User is redirected to PhonePe's hosted payment page
  5. PhonePe redirects back to `/payment-status/:transactionId`
  6. Frontend polls `GET /orders/phonepe-status/:transactionId`
  7. On `PAID`, backend confirms order, awards loyalty points, fires referrer bonus if applicable

### Orders

- **Order history** in `/account` — all past orders with status, items, totals, and wallet info
- **Status flow**: `PENDING` → `PENDING_PAYMENT` → `PROCESSING` → `SHIPPED` → `DELIVERED`
- **Order cancellation** — user can cancel from account page when order is in `PROCESSING` status; redeemed wallet points are refunded automatically
- **Admin order management** — admin can update order status; Shiprocket fields populated when shipped
- Each order records a full snapshot: item names, prices, variants, shipping address, coupon, wallet discount

### Wishlist

- One wishlist per user; add/remove products
- **Public share link** — unique URL for sharing wishlist with anyone (no auth required to view)
- Wishlist icon in header shows count badge
- Add-to-cart from wishlist page

### Reviews & Ratings

- One review per user per product (enforced at DB level with unique constraint)
- Star rating (1–5) + text comment
- **Purchase eligibility check** — review form only shown to users who have bought the product
- Average rating and review count shown on product cards and detail page
- User can edit or delete their own review from the account page

### Loyalty Wallet & Points

Points system where every purchase earns redeemable points.

**Earning points:**
- Points are awarded when an order is marked `DELIVERED` by admin
- Formula: `floor(orderTotal × pointsEarnRate / 100)` where `pointsEarnRate` is an admin setting (e.g. 5 = 5% back)
- Points recorded as a `CREDIT_ORDER` wallet transaction

**Redeeming points:**
- User selects how many points to redeem from the cart page
- 1 point = ₹1 discount off the order total
- Maximum per order: `floor(orderTotal × pointsRedeemMaxPercent / 100)` (admin-configurable; default 50%)
- Wallet debit is atomic with order creation — rolled back if the order fails to save
- Recorded as `DEBIT_ORDER` wallet transaction linked to the real Order ID

**Transaction types:**
| Type | Description |
|---|---|
| `CREDIT_ORDER` | Points earned from a completed purchase |
| `CREDIT_REFERRAL` | Bonus points from referral (welcome or referrer bonus) |
| `CREDIT_ADMIN` | Manual credit by admin (also used for wallet refunds on cancellation/return) |
| `DEBIT_ORDER` | Points redeemed at checkout |
| `DEBIT_ADMIN` | Manual debit by admin |

**Admin wallet management:**
- Admin Wallet & Points panel shows all users with their balances
- Admin can manually credit or debit any user's wallet with a reason note
- Full paginated transaction history per user visible in admin panel

**User wallet view (Account → Wallet & Rewards):**
- Current balance shown as amber gradient card
- Paginated transaction history with type badges and timestamps
- Referral code and sharing tools (see Referral System)

**Admin settings keys:**
- `pointsEarnRate` — % of order value earned as points (default: 5)
- `pointsRedeemMaxPercent` — max % of order redeemable with points (default: 50)
- `referralBonusPoints` — points for welcome bonus and referrer bonus (default: 100)

### Referral System

Each user gets a unique 6-character alphanumeric referral code. For users who registered before the feature was added, the code is lazily generated on their first `/auth/me` call after deployment.

**Flow:**
1. User shares their code or link (`https://yourstore.com/#/register?ref=ABC123`)
2. New user visits the link — referral code is pre-filled in the register form (user can edit it)
3. On successful registration with a valid code:
   - New user **immediately** receives `referralBonusPoints` as a `CREDIT_REFERRAL` welcome bonus
   - `referredBy` field is stored on their account
4. When the referred user completes their **first paid order**:
   - Referrer receives `referralBonusPoints` as a `CREDIT_REFERRAL` bonus
   - `referredBy` is cleared (so the referrer bonus only fires once per referred user)

**UI:**
- Visible referral code text input on register form (with gift icon)
- Amber banner shows bonus amount when a valid code is entered
- Account → Wallet tab shows user's own code, one-click copy button, shareable link, and how-it-works explanation

### Coupons

- PERCENTAGE (e.g. 15% off) or FIXED (e.g. ₹100 off) discount types
- Optional: expiry date, global usage limit, **per-user usage limit**, minimum cart value
- Per-user limit enforced via `CouponUsage` table — one row created per use, deleted on order cancellation; prevents a customer from using the same code more than `perUserLimit` times regardless of the global cap
- Active coupons shown in cart as a clickable list with eligibility enforcement
- Manual code entry also supported
- Applied coupon stored on cart; coupon code and discount amount saved on the order record

### Order Returns & Refunds

- Customers can submit a return request from **My Orders** on any `DELIVERED` + `PAID` order
- One return request allowed per order
- Request includes a free-text reason; admin sees all requests in the **Returns** panel (sidebar, under Orders permission)
- Admin can expand each request to add a note, choose whether to credit the order amount to the customer's wallet, then **Approve** or **Reject**
- Approving with wallet refund enabled credits the full order total to the customer's wallet via `creditWallet`
- Return status badge (`PENDING` / `APPROVED` / `REJECTED`) is shown on the order in the customer's account page, along with the admin note

### Blog & Content

- **Blog posts** — title, slug, excerpt, full HTML content, cover image, category, type (BLOG or TUTORIAL), status (DRAFT / PUBLISHED)
- **Videos** — YouTube embed IDs; type FULL or SHORT; display order; category
- **Brands** — logo images with optional website links; display order
- **FAQs** — questions grouped by category with display order; shown on `/faq` page
- **Home slides** — hero carousel with title, image, optional CTA link, display order
- **Legal pages** — privacy policy, terms of service, etc. stored as Setting keys; rendered at `/#/legal/:slug`
- **Newsletter** — footer subscription form saves emails to `NewsletterSubscriber`; admin can view and manage subscribers

### Admin Panel

Accessed at `/#/admin`. Requires a valid JWT from a `STAFF` or `ADMIN` user.

**Sidebar navigation views:**
| View | Description | Permission Required |
|---|---|---|
| Dashboard | Stats cards (users, orders, products, categories) with period filter (today / week / month / all) | Any staff |
| Orders | Full order list with status update dropdown | `orders` |
| Products | Product list, create/edit form with bulk gallery manager, variant editor | `products` |
| Categories | Category CRUD with image and SEO fields | `categories` |
| Coupons | Coupon CRUD with type, value, global limit, per-user limit, expiry | `coupons` |
| Returns | Return request list; approve/reject with optional wallet refund | `orders` |
| Slides | Hero carousel slide management | `slides` |
| Brands | Brand logo management | `slides` |
| Blog | Blog post and tutorial CRUD | `blog` |
| Videos | YouTube video management | `blog` |
| FAQs | FAQ management grouped by category | `blog` |
| Staff | Staff user management — create/edit/delete staff and set permissions | Admin only |
| Users | Customer list with wallet balance; manual wallet credit/debit | `users` |
| Wallet & Points | Points ledger overview; per-user transaction history; admin credit/debit | `users` |
| Newsletter | Subscriber list with delete | `users` |
| Settings | Store-wide key-value settings editor | `settings` (read any staff, write admin only) |

### Staff & Roles

- **Admin** (`isAdmin: true` or `role: ADMIN`) — full access to all admin panel sections and all API admin routes
- **Staff** (`role: STAFF`) — access controlled by `permissions` JSON object per section:
  ```json
  {
    "orders": true,
    "products": true,
    "categories": false,
    "users": false,
    "coupons": true,
    "settings": false,
    "blog": false,
    "slides": false
  }
  ```
- Sidebar nav items are hidden for permissions the staff member doesn't have
- API routes enforce the same permission checks server-side via `hasPermission()` middleware (not just UI-level)
- Admin can create, edit, reset passwords for, and delete staff accounts from the Staff view

### Payments — PhonePe

- PhonePe is the only supported payment method
- Integration uses PhonePe's hosted checkout (redirect flow):
  1. Backend creates the order and debits wallet points atomically
  2. Calls PhonePe API with the order's exact total amount
  3. Returns a redirect URL to the frontend
  4. User completes payment on PhonePe's page
  5. PhonePe redirects back to the app
  6. Frontend polls the backend status endpoint
  7. Backend verifies payment with PhonePe API, updates order, awards points
- Orders that are never paid remain in `PENDING_PAYMENT` status indefinitely
- `pointsToRedeem` is passed at checkout initiation; wallet is debited atomically with order creation

### Shipping — Shiprocket

- **Serviceability check** — on product detail page, user enters pincode to check if delivery is available via Shiprocket
- After an order is placed, admin manually creates the shipment in Shiprocket's dashboard and then updates the order record with:
  - `shiprocketOrderId`
  - `shiprocketShipmentId`
  - `awbCode` (airway bill / tracking number)
- Customer can see the AWB code in their order history for manual tracking

### Email — Resend

Used for transactional emails only:
- **Email verification** — sent on registration; verification link expires in 24 hours
- **Password reset** — sent on forgot-password request; link expires in 1 hour and is single-use
- **Back-in-stock notifications** — sent when admin marks product stock as available (manually triggered)

Requires `RESEND_API_KEY` and a verified sender domain configured in Resend dashboard.

### SEO

- **Per-product SEO** — `metaTitle` and `metaDescription` fields override defaults
- **Per-category SEO** — same `metaTitle` and `metaDescription` fields
- **XML Sitemap** — auto-generated at `/api/sitemap.xml`; includes all published products and active categories
- **Canonical URLs** — all product and category links use slugs
- **Analytics** — Google Analytics 4 (`googleAnalyticsId` setting) and Meta Pixel (`metaPixelId` setting) injected via Settings; no code change required

### Theme & Settings

All settings stored in the `Setting` model as key-value pairs; admin can change them live from the Settings view.

| Key | Description |
|---|---|
| `storeName` | Store display name shown in header and emails |
| `storeLogo` | Store logo URL |
| `themeColor` | Primary brand color (hex, e.g. `#2563eb`) — applied as CSS variable |
| `taxRate` | Tax percentage applied at checkout |
| `announcementBar` | Text for the top announcement banner |
| `announcementBarEnabled` | `true` / `false` — toggle the banner |
| `metaTitle` | Default site meta title |
| `metaDescription` | Default site meta description |
| `googleAnalyticsId` | GA4 measurement ID (e.g. `G-XXXXXXX`) |
| `metaPixelId` | Meta (Facebook) Pixel ID |
| `pointsEarnRate` | % of order total earned as loyalty points |
| `pointsRedeemMaxPercent` | Max % of order value redeemable with points |
| `referralBonusPoints` | Points awarded for welcome bonus and referrer bonus |
| Legal content keys | `privacyPolicy`, `termsOfService`, etc. — rendered at `/#/legal/:slug` |

### CSV Product Import

- Admin can bulk-import or bulk-update products by uploading a CSV file from the Products admin view
- Expected CSV columns: `name`, `slug`, `description`, `price`, `originalPrice`, `stock`, `sku`, `category`, `imageUrl`, `specifications`
- Products matched by `slug`: existing slugs are updated, new slugs are inserted
- Invalid or malformed rows are skipped; response includes a summary of successes and errors

---

## 7. Environment Variables

### Backend (`server/.env`)

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"

# JWT
JWT_SECRET="your-secret-key-here"

# PhonePe
PHONEPE_MERCHANT_ID="your-merchant-id"
PHONEPE_SALT_KEY="your-salt-key"
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL="https://api.phonepe.com/apis/hermes"
PHONEPE_CALLBACK_URL="https://yourdomain.com/api/orders/phonepe-callback"
PHONEPE_REDIRECT_URL="https://yourdomain.com/#/payment-status"

# Shiprocket
SHIPROCKET_EMAIL="your-shiprocket-email"
SHIPROCKET_PASSWORD="your-shiprocket-password"

# Resend (email)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Sentry (optional)
SENTRY_DSN=""

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"
```

### Frontend (`web/.env`)

```env
REACT_APP_API_URL=https://yourdomain.com/api
```

In local dev, `REACT_APP_API_URL` is not needed — the frontend auto-detects `localhost` and uses `http://localhost:5000/api`.

---

## 8. Local Development Setup

### Prerequisites
- Docker Desktop (running)
- Node.js 18+

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd shop

# 2. Start only the database
docker compose up -d db

# 3. Backend
cd server
cp .env.example .env       # fill in JWT_SECRET and DATABASE_URL at minimum
npm install
npx prisma migrate deploy  # apply all migrations
npm run dev                # starts on http://localhost:5000

# 4. Frontend (new terminal)
cd web
npm install
npm start                  # starts on http://localhost:3000
```

### Default dev credentials (after seeding)
- **Admin**: `admin@circuithub.in` / `admin123`
- **Customer**: `customer@test.com` / `test123`

### Notes
- Product images in dev use `placehold.co` placeholder URLs when no real images are uploaded
- PhonePe and Shiprocket calls require real credentials and won't work in local dev without them; the order initiation will fail gracefully

### Full Docker stack
```bash
docker compose up --build
```
Starts all three services: `db` (PostgreSQL on 5432), `server` (on 5000), `web` (on 3000). The server container runs `npx prisma migrate deploy && node dist/server.js` on startup so all migrations are applied automatically.

---

## 9. Deployment

### Render (recommended)
`render.yaml` in the repo root defines:
- `shop-backend` — Node.js web service; build: `npm install && npm run build`; start: `npx prisma migrate deploy && node dist/server.js`
- `shop-frontend` — Static site; build: `npm install && npm run build`; publish dir: `build`
- `shop-db` — Managed PostgreSQL

Set all backend env vars in the Render dashboard under the service's Environment section.

### VPS / Self-hosted
1. Build images: `docker compose -f docker-compose.prod.yml build`
2. Push to a container registry and pull on the server
3. Set env vars via Docker secrets or `.env` file on the server
4. Migrations run automatically on container start

### CI
GitHub Actions runs on every push to `main`:
- TypeScript type check (`tsc --noEmit`)
- ESLint

---

## 10. Remaining / Pending Work

| Feature | Status | Notes |
|---|---|---|
| **Password reset emails** | ✅ Done | Full flow implemented: backend routes + token lifecycle + `ForgotPasswordView` / `ResetPasswordView`; `RESEND_API_KEY` configured; email send failures are caught silently so the endpoint always returns 200 |
| **Order returns / refunds** | ✅ Done | `Return` model + `CouponUsage`-style migration; customer request from My Orders; admin Returns panel with approve/reject + optional wallet refund |
| **React Router migration** | ✅ Done | App fully uses React Router v6 (`HashRouter`, `Routes`, `Route`, `useNavigate`, `Link`, `useSearchParams`) |
| **Coupon per-user usage limit** | ✅ Done | `perUserLimit` field on `Coupon`; `CouponUsage` table tracks per-user redemptions; enforced at `applyCoupon` time; usage record created on payment confirmed and removed on cancellation |
| **Bulk gallery image management** | ✅ Done | `GalleryManager` component: multi-file select/drop (sequential upload with progress), drag-to-reorder thumbnails, "set as primary" button on hover, remove with automatic primary promotion |
| **Order tracking page** | Not started | `awbCode` exists on orders; needs a dedicated tracking UI calling Shiprocket's tracking API |
| **COD (Cash on Delivery)** | Not started | PhonePe is the only payment method; COD would need a separate order confirmation flow without redirect |
| **Back-in-stock email trigger** | Manual | `StockNotification` model and subscribers exist; admin must manually trigger notification emails when stock is updated |

---

## 11. Code Review — Bugs Fixed

High-effort review performed on 2026-06-16 covering all uncommitted changes (wallet, variants, returns, staff roles, flash sale, coupon per-user limit). 9 findings; 8 fixed, 1 confirmed as already correct.

| # | Severity | File | Finding | Status |
|---|---|---|---|---|
| 1 | Critical | `orderService.ts` | Wallet debit in `createPendingOrder` was not atomic with order creation — if `order.create` threw, the points deduction was already committed and permanent | ✅ Fixed — wallet debit moved inside the same `prisma.$transaction` as the order; both roll back together on failure |
| 2 | Critical | `orderService.ts` | `cancelUserOrder` never refunded wallet points redeemed at checkout — cancelled orders permanently burned the user's balance | ✅ Fixed — step 4 added inside the cancellation transaction: credits `order.pointsRedeemed` back and writes a `CREDIT_ADMIN` wallet transaction |
| 3 | Critical | `orderService.ts` | `calculateCartTotal` was called twice per checkout; PhonePe received the total from call 1 while the order was created from call 2 — cart changes between the two calls caused a payment/order amount mismatch | ✅ Fixed — `initiatePhonePePayment` now creates the order first and derives `amountInPaise` from `order.totalAmount`; single source of truth |
| 4 | High | `orderService.ts` | `createPendingOrder` recalculated the coupon discount using `item.product.price`, ignoring variant prices — the stored `discountAmount` on the order was wrong whenever a cart contained variant-priced items | ✅ Fixed — `calculateCartTotal` now returns `discountAmount` (already computed with variant-aware subtotal); `createPendingOrder` consumes it directly |
| 5 | High | `authMiddleware.ts` | `staff` middleware appeared to grant blanket access with no per-section permission checks | ✅ Not a bug — `adminRoutes.ts` already wraps every individual route with `hasPermission('xxx')`; `staff` is only the entry gate |
| 6 | High | `orderService.ts` | `DEBIT_ORDER` wallet transaction stored `merchantTransactionId` (e.g. `"ORD1718…"`) as `orderId` instead of the real Prisma Order cuid — downstream queries by `order.id` silently found zero debit records | ✅ Fixed — within the transaction the order is now created first; its cuid is passed as `orderId` to `walletTransaction.create` |
| 7 | Medium | `cartService.ts` | Removing `@@unique([cartId, productId])` left `addItem` with an unprotected read-then-write; concurrent requests for the same product+variant could both pass the existence check and insert duplicate `CartItem` rows | ✅ Fixed — `addItem` now runs inside a `Serializable` transaction; concurrent conflicting requests are serialised at the DB level |
| 8 | Medium | `authService.ts` | Referral code generation had no collision handling — a duplicate 6-char code caused `prisma.user.create` to throw an unhandled P2002, crashing registration with a 500 | ✅ Fixed — extracted `generateUniqueReferralCode()` helper that pre-checks the DB and retries up to 5 times; applied to both `register` and the lazy-generation path in `getProfile` |
| 9 | Low | `walletService.ts` | `getWalletHistory` hardcoded `take: 50` with no pagination — users and admins silently saw only the 50 most recent transactions | ✅ Fixed — function accepts `skip`/`take` params (defaults 0/50, max 200); both `/wallet/history` and `GET /admin/users/:id/wallet-history` expose `?skip=` and `?take=` query params |
