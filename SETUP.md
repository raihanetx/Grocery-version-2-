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
| **Region** | Singapore (ap-southeast-1) |
| **Database Type** | PostgreSQL |

### Tables

| Table | Description |
|-------|-------------|
| `categories` | Product categories |
| `products` | Product inventory |
| `customers` | Customer information |
| `orders` | Customer orders |
| `order_items` | Items in each order |
| `coupons` | Discount coupons |
| `reviews` | Product reviews |
| `inventory_logs` | Inventory change history |
| `abandoned_carts` | Abandoned shopping carts |
| `settings` | Store settings |

---

## 📁 Project Structure

```
├── .env                    # ✅ Pre-configured Supabase credentials
├── AI.md                   # Instructions for AI assistants
├── SETUP.md               # This file
├── supabase/
│   ├── config.toml        # Supabase CLI configuration
│   └── seed.sql           # Database schema
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

---

## 🔐 Environment Variables

The `.env` file is already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uosbndvnjposzpbtvhvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
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
# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install
```

---

## 📄 License

MIT License

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**
