# Supabase CLI Guide

This project is pre-configured with Supabase. You can use Supabase CLI to manage the database.

---

## 🚀 Quick Start (No CLI Required)

The `.env` file already has all credentials. Just run:

```bash
bun install
bun run dev
```

No Supabase CLI needed for development!

---

## 📦 Using Supabase CLI (Optional)

### Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm
npm install -g supabase

# bun
bun install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link to Existing Project

This project is already linked to Supabase project `uosbndvnjposzpbtvhvq`:

```bash
# Link to the existing project
supabase link --project-ref uosbndvnjposzpbtvhvq

# You'll need your database password (from .env)
# Password: oMuu7ZXlsMSxTJK9
```

### Push Schema Changes

If you modify `supabase/migrations/`:

```bash
# Push migrations to Supabase
supabase db push
```

### Pull Remote Schema

If you made changes in Supabase Dashboard:

```bash
# Pull remote schema to local
supabase db pull
```

### Generate Types

Generate TypeScript types from database:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

### Open Supabase Studio

```bash
supabase studio
```

---

## 🗄️ Database Management

### View Current Schema

```bash
# View migrations
ls supabase/migrations/

# Check current migration status
supabase db diff
```

### Create New Migration

```bash
# Create a new migration
supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then push to remote
supabase db push
```

### Reset Local Database

```bash
supabase db reset
```

---

## 📋 Project Configuration

| Property | Value |
|----------|-------|
| **Project Ref** | `uosbndvnjposzpbtvhvq` |
| **Region** | Singapore (ap-southeast-1) |
| **Dashboard** | https://supabase.com/dashboard/project/uosbndvnjposzpbtvhvq |

---

## ⚠️ Important Notes

1. **Don't create a new project** - This project already exists on Supabase
2. **Database password is in .env** - Use it when linking
3. **Migrations are in `supabase/migrations/`** - Don't modify directly in dashboard
4. **Use `supabase db push`** - To apply local migrations to remote

---

## 🔗 Useful Commands

| Command | Description |
|---------|-------------|
| `supabase login` | Login to Supabase |
| `supabase link --project-ref <ref>` | Link to existing project |
| `supabase db push` | Push migrations to remote |
| `supabase db pull` | Pull remote schema to local |
| `supabase db diff` | Show schema differences |
| `supabase migration new <name>` | Create new migration |
| `supabase gen types typescript --linked` | Generate TypeScript types |
| `supabase studio` | Open local Supabase Studio |
| `supabase functions serve` | Serve Edge Functions locally |

---

## 🌐 Direct Database Access

If you need direct PostgreSQL access:

```bash
# Connection string (from .env)
postgresql://postgres.uosbndvnjposzpbtvhvq:oMuu7ZXlsMSxTJK9@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Or use the Supabase dashboard SQL Editor for direct queries.
