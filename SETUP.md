# Grocery E-commerce Application - Version 2

A modern, full-featured grocery e-commerce application built with Next.js 16, Supabase, and TypeScript.

## 🚀 Features

- **Modern UI** - Beautiful, responsive design with shadcn/ui components
- **Product Management** - Categories, products, inventory tracking
- **Shopping Cart** - Add, remove, update quantities
- **Checkout** - Complete checkout process with order tracking
- **Admin Dashboard** - Manage products, orders, customers, and settings
- **Supabase Integration** - Real-time database with PostgreSQL
- **Authentication** - Secure user authentication with NextAuth.js

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier available)
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/raihanetx/Grocery-version-2-.git
cd Grocery-version-2-
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Project Settings > API to get your credentials
3. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Database Schema

Option A: Using Supabase SQL Editor
1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/seed.sql`
3. Paste and run the SQL

Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

### 5. Run the Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── prisma/                 # Prisma schema (if needed)
├── public/                 # Static assets
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── coupons/
│   │   │   ├── reviews/
│   │   │   ├── inventory/
│   │   │   ├── settings/
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/         # Admin dashboard components
│   │   ├── cart/          # Shopping cart components
│   │   ├── checkout/      # Checkout components
│   │   ├── layout/        # Layout components (Header, BottomNav)
│   │   ├── orders/        # Order components
│   │   ├── shop/          # Shop/Product components
│   │   └── ui/            # shadcn/ui components
│   ├── contexts/          # React contexts
│   ├── lib/
│   │   ├── db.ts          # Supabase client
│   │   └── supabase/      # Supabase utilities
│   └── types/             # TypeScript types
├── supabase/
│   ├── config.toml        # Supabase CLI configuration
│   └── seed.sql           # Database schema and seed data
├── .env                   # Environment variables
├── .env.example           # Example environment file
└── package.json
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema changes |
| `bun run db:studio` | Open Prisma Studio |

## 🗄️ Database Tables

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

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `NEXTAUTH_URL` | Your app URL |
| `DATABASE_URL` | PostgreSQL connection string |

## 📱 Features Overview

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

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Docker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
