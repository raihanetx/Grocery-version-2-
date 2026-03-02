# Grocery E-commerce Application - Version 2

> ⚠️ **IMPORTANT**: This project uses **SUPABASE** (PostgreSQL). It is NOT configured for SQLite or any other database. The `.env` file is already configured with live credentials.

---

## 🚀 Quick Start (2 steps!)

```bash
# 1. Install dependencies
bun install

# 2. Start development
bun run dev
```

**That's it!** The database is already set up on Supabase. No additional configuration needed.

---

## 📋 Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Frontend Framework |
| TypeScript | Language |
| Supabase | PostgreSQL Database |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |

---

## 🗄️ Database Information

### Supabase Configuration

| Property | Value |
|----------|-------|
| **Project URL** | https://uosbndvnjposzpbtvhvq.supabase.co |
| **Project Ref** | `uosbndvnjposzpbtvhvq` |
| **Region** | Singapore (ap-southeast-1) |
| **Database Type** | PostgreSQL |

### Database Tables

| Table | Description |
|-------|-------------|
| `categories` | Product categories |
| `products` | Product inventory |
| `product_varieties` | Product variants (sizes) |
| `product_images` | Product images |
| `product_faqs` | Product FAQs |
| `customers` | Customer information |
| `orders` | Customer orders |
| `order_items` | Items in each order |
| `coupons` | Discount coupons |
| `reviews` | Product reviews |
| `inventory_logs` | Inventory change history |
| `abandoned_carts` | Abandoned shopping carts |
| `cart_items` | Shopping cart items |
| `admin_users` | Admin accounts |
| `settings` | Store settings |

---

## 🔧 Supabase CLI (Optional)

If you need to manage the database schema:

### Install CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop install supabase

# npm/bun
bun install -g supabase
```

### Link to Project

```bash
# Login to Supabase
supabase login

# Link to existing project
supabase link --project-ref uosbndvnjposzpbtvhvq
# Password: oMuu7ZXlsMSxTJK9 (from .env)
```

### Common Commands

| Command | Description |
|---------|-------------|
| `supabase db push` | Push local migrations to remote |
| `supabase db pull` | Pull remote schema to local |
| `supabase migration new <name>` | Create new migration |
| `supabase gen types typescript --linked` | Generate TypeScript types |
| `supabase studio` | Open Supabase Studio |

📖 See `SUPABASE_CLI.md` for detailed instructions.

---

## 📁 Project Structure

```
├── .env                    # ✅ Pre-configured Supabase credentials
├── AI.md                   # Instructions for AI assistants
├── SUPABASE_CLI.md        # Supabase CLI guide
├── SETUP.md               # This file
├── .cursorrules           # Rules for Cursor AI
├── supabase/
│   ├── config.toml        # Supabase CLI configuration
│   ├── seed.sql           # Database seed data
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── api/           # API routes (using Supabase)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/         # Admin dashboard
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout flow
│   │   ├── layout/        # Header, Navigation
│   │   ├── orders/        # Order management
│   │   ├── shop/          # Product display
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts
│   ├── lib/
│   │   ├── db.ts          # Supabase client
│   │   └── supabase/      # Supabase utilities
│   └── types/             # TypeScript types
└── package.json
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint |

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET, POST | Categories |
| `/api/categories/[id]` | GET, PUT, DELETE | Single category |
| `/api/products` | GET, POST | Products |
| `/api/products/[id]` | GET, PUT, DELETE | Single product |
| `/api/orders` | GET, POST | Orders |
| `/api/orders/[id]` | GET, PUT, DELETE | Single order |
| `/api/customers` | GET, POST | Customers |
| `/api/customers/[id]` | GET, PUT, DELETE | Single customer |
| `/api/coupons` | GET, POST | Coupons |
| `/api/coupons/validate` | POST | Validate coupon |
| `/api/settings` | GET, PUT | Store settings |
| `/api/inventory` | GET, POST | Inventory logs |
| `/api/reviews` | GET, POST | Reviews |
| `/api/abandoned` | GET, POST | Abandoned carts |

---

## 🔐 Environment Variables

The `.env` file is already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uosbndvnjposzpbtvhvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://postgres.uosbndvnjposzpbtvhvq:***@...
```

---

## 📱 Features

### Customer Features
- Browse products by category
- Search products
- Add to cart / Remove from cart
- Apply discount coupons
- Checkout with delivery details
- Track order status

### Admin Features
- Product management (CRUD)
- Category management
- Order management
- Customer management
- Coupon management
- Inventory tracking
- Settings configuration

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Deploy (env variables are already in `.env`)

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- Render
- Docker

---

## 🆘 Troubleshooting

### Database Connection Issues

1. Verify `.env` file exists with correct credentials
2. Check Supabase project is active at https://supabase.com/dashboard
3. Verify `src/lib/db.ts` is using Supabase client

### Installation Issues

```bash
# Clear and reinstall
rm -rf node_modules bun.lock
bun install
```

### Supabase CLI Issues

```bash
# Re-link project
supabase link --project-ref uosbndvnjposzpbtvhvq
```

---

## 📄 License

MIT License

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**
