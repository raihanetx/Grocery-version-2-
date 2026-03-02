# ⚠️ IMPORTANT INSTRUCTIONS FOR AI ASSISTANTS

## 🔴 CRITICAL: READ THIS FIRST

### This project uses SUPABASE - NOT SQLite or any other database

**DO NOT:**
- ❌ Create a new SQLite database
- ❌ Set up Prisma with SQLite
- ❌ Create local database files
- ❌ Modify the database schema without permission

**DO:**
- ✅ Use the existing Supabase configuration
- ✅ Use `@supabase/supabase-js` client from `src/lib/db.ts`
- ✅ The `.env` file already has all credentials configured
- ✅ Database tables are already created in Supabase

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

## Database Schema

The following tables exist in Supabase:

- `categories` - Product categories
- `products` - Product inventory
- `customers` - Customer information
- `orders` - Customer orders
- `order_items` - Items in each order
- `coupons` - Discount coupons
- `reviews` - Product reviews
- `inventory_logs` - Inventory change history
- `abandoned_carts` - Abandoned shopping carts
- `settings` - Store settings

---

## API Routes

All API routes use Supabase client:

- `/api/categories` - Categories CRUD
- `/api/products` - Products CRUD
- `/api/orders` - Orders CRUD
- `/api/customers` - Customers CRUD
- `/api/coupons` - Coupons CRUD
- `/api/reviews` - Reviews CRUD
- `/api/inventory` - Inventory management
- `/api/settings` - Store settings
- `/api/abandoned` - Abandoned carts
- `/api/webhooks/steadfast` - Steadfast courier webhook

---

## Example Query

```typescript
import { db } from '@/lib/db'

// Get all products
const { data, error } = await db
  .from('products')
  .select('*')
  .eq('is_active', true)

// Create order
const { data, error } = await db
  .from('orders')
  .insert({
    order_number: 'ORD-001',
    customer_name: 'John Doe',
    total: 500
  })
```

---

## Supabase Dashboard

Access the database directly:
- **URL**: https://supabase.com/dashboard/project/uosbndvnjposzpbtvhvq
- **Region**: Singapore (ap-southeast-1)

---

## ⚠️ REMINDER

**This project is 100% configured and ready to use with Supabase.**

Do NOT create or configure any other database. Just run `bun install` and `bun run dev`.
