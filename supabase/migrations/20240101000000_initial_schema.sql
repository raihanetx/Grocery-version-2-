-- Initial migration for Grocery E-commerce Database
-- Run this migration to set up the complete database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  icon TEXT,
  type TEXT DEFAULT 'icon',
  parent_id TEXT REFERENCES categories(id),
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_desc TEXT,
  long_desc TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  sku TEXT UNIQUE,
  barcode TEXT,
  quantity INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category_id TEXT REFERENCES categories(id),
  image TEXT,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_offer BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  weight DECIMAL(10, 2),
  weight_unit TEXT DEFAULT 'kg',
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Varieties (for different sizes/variants)
CREATE TABLE IF NOT EXISTS product_varieties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  discount TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product FAQs
CREATE TABLE IF NOT EXISTS product_faqs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  website_name TEXT DEFAULT 'GroceryHub',
  slogan TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  banner_images TEXT,
  inside_dhaka_delivery DECIMAL(10, 2) DEFAULT 60,
  outside_dhaka_delivery DECIMAL(10, 2) DEFAULT 120,
  free_delivery_min DECIMAL(10, 2) DEFAULT 1000,
  universal_delivery DECIMAL(10, 2) DEFAULT 0,
  use_universal_delivery BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  phone_number TEXT,
  facebook_url TEXT,
  messenger_username TEXT,
  about_us TEXT,
  terms_conditions TEXT,
  refund_policy TEXT,
  privacy_policy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method TEXT DEFAULT 'Cash on Delivery',
  status TEXT DEFAULT 'pending',
  courier_status TEXT,
  canceled_by TEXT,
  consignment_id TEXT,
  tracking_code TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  coupon_discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  product_name TEXT NOT NULL,
  variety_name TEXT,
  variety_id TEXT,
  quantity INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  offer_discount DECIMAL(10, 2) DEFAULT 0,
  coupon_discount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value DECIMAL(10, 2) NOT NULL,
  scope TEXT DEFAULT 'all',
  min_order DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expiry TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon Products Relation
CREATE TABLE IF NOT EXISTS coupon_products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  coupon_id TEXT REFERENCES coupons(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, product_id)
);

-- Coupon Categories Relation
CREATE TABLE IF NOT EXISTS coupon_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  coupon_id TEXT REFERENCES coupons(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, category_name)
);

-- Order Coupons Relation
CREATE TABLE IF NOT EXISTS order_coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  coupon_id TEXT REFERENCES coupons(id),
  code TEXT NOT NULL,
  discount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  variety_id TEXT,
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abandoned Carts Table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  cart_data JSONB NOT NULL,
  visit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_visits INTEGER DEFAULT 1,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abandoned History
CREATE TABLE IF NOT EXISTS abandoned_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  abandoned_checkout_id TEXT REFERENCES abandoned_carts(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'abandoned',
  total DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abandoned Products
CREATE TABLE IF NOT EXISTS abandoned_products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  abandoned_history_id TEXT REFERENCES abandoned_history(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variety_label TEXT,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT REFERENCES customers(id),
  product_id TEXT REFERENCES products(id),
  variety_id TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_varieties_product ON product_varieties(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_faqs_product ON product_faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_history_checkout ON abandoned_history(abandoned_checkout_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_products_history ON abandoned_products(abandoned_history_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_coupon_products_coupon ON coupon_products(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_categories_coupon ON coupon_categories(coupon_id);
CREATE INDEX IF NOT EXISTS idx_order_coupons_order ON order_coupons(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_varieties_updated_at ON product_varieties;
CREATE TRIGGER update_product_varieties_updated_at BEFORE UPDATE ON product_varieties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_faqs_updated_at ON product_faqs;
CREATE TRIGGER update_product_faqs_updated_at BEFORE UPDATE ON product_faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_abandoned_carts_updated_at ON abandoned_carts;
CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON abandoned_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
