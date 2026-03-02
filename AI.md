# ⚠️ IMPORTANT INSTRUCTIONS FOR AI ASSISTANTS

## 🔴 CRITICAL: READ THIS FIRST

### This project uses SUPABASE - NOT SQLite or any other database

**DO NOT:**
- ❌ Create a new SQLite database
- ❌ Set up Prisma with SQLite
- ❌ Create local database files
- ❌ Modify the database schema without permission
- ❌ Run `prisma migrate` or `prisma db push`
- ❌ Create a new Supabase project

**DO:**
- ✅ Use the existing Supabase configuration
- ✅ Use `@supabase/supabase-js` client from `src/lib/db.ts`
- ✅ The `.env` file already has all credentials configured
- ✅ Database tables are already created in Supabase
- ✅ Use Supabase CLI to manage schema if needed (see SUPABASE_CLI.md)

---

## Database Configuration

This project is pre-configured with Supabase PostgreSQL:

```typescript
// src/lib/db.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const db = createClient(supabaseUrl, supabaseServiceKey)
```

### Environment Variables (Already Configured)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uosbndvnjposzpbtvhvq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (see .env) |
| `SUPABASE_SERVICE_ROLE_KEY` | (see .env) |
| `DATABASE_URL` | `postgresql://postgres.uosbndvnjposzpbtvhvq:***@...` |

---

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Start development server (env is already configured!)
bun run dev
```

That's it! No database setup needed.

---

## Supabase CLI (Optional)

If you need to modify the database schema:

```bash
# Install Supabase CLI
bun install -g supabase

# Login
supabase login

# Link to existing project
supabase link --project-ref uosbndvnjposzpbtvhvq

# Create migration
supabase migration new your_migration_name

# Push to remote
supabase db push
```

See `SUPABASE_CLI.md` for detailed instructions.

---

## Database Schema

The following tables exist in Supabase:

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
| `order_coupons` | Coupons applied to orders |
| `coupons` | Discount coupons |
| `coupon_products` | Coupon-product relations |
| `coupon_categories` | Coupon-category relations |
| `reviews` | Product reviews |
| `inventory_logs` | Inventory change history |
| `abandoned_carts` | Abandoned shopping carts |
| `abandoned_history` | Abandoned cart history |
| `abandoned_products` | Products in abandoned carts |
| `cart_items` | Shopping cart items |
| `admin_users` | Admin user accounts |
| `settings` | Store settings |

---

## API Routes

All API routes use Supabase client:

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/categories` | GET, POST | Categories CRUD |
| `/api/categories/[id]` | GET, PUT, DELETE | Single category |
| `/api/products` | GET, POST | Products CRUD |
| `/api/products/[id]` | GET, PUT, DELETE | Single product |
| `/api/orders` | GET, POST | Orders CRUD |
| `/api/orders/[id]` | GET, PUT, DELETE | Single order |
| `/api/customers` | GET, POST | Customers CRUD |
| `/api/customers/[id]` | GET, PUT, DELETE | Single customer |
| `/api/coupons` | GET, POST | Coupons CRUD |
| `/api/coupons/validate` | POST | Validate coupon code |
| `/api/settings` | GET, PUT | Store settings |
| `/api/inventory` | GET, POST | Inventory logs |
| `/api/reviews` | GET, POST | Reviews CRUD |
| `/api/abandoned` | GET, POST | Abandoned carts |
| `/api/webhooks/steadfast` | POST | Courier webhook |

---

## Example Queries

```typescript
import { db } from '@/lib/db'

// Get all active products
const { data, error } = await db
  .from('products')
  .select(`
    *,
    category:categories(name),
    varieties:product_varieties(*)
  `)
  .eq('is_active', true)

// Create order
const { data, error } = await db
  .from('orders')
  .insert({
    order_number: 'ORD-001',
    customer_name: 'John Doe',
    customer_phone: '+8801712345678',
    customer_address: 'Dhaka, Bangladesh',
    subtotal: 500,
    delivery_charge: 60,
    total: 560
  })
  .select()
  .single()

// Get settings
const { data, error } = await db
  .from('settings')
  .select('*')
  .single()

// Update settings
const { data, error } = await db
  .from('settings')
  .update({ 
    website_name: 'My Store',
    phone_number: '+8801712345678'
  })
  .eq('id', 'settings_id')
```

---

## Supabase Dashboard

Access the database directly:
- **URL**: https://supabase.com/dashboard/project/uosbndvnjposzpbtvhvq
- **Region**: Singapore (ap-southeast-1)
- **Project Ref**: `uosbndvnjposzpbtvhvq`

---

## ⚠️ REMINDER

**This project is 100% configured and ready to use with Supabase.**

1. **Do NOT create or configure any other database**
2. **Do NOT run Prisma commands** (Prisma is removed from this project)
3. **Just run `bun install` and `bun run dev`**
4. **Use Supabase CLI for schema changes if needed**
