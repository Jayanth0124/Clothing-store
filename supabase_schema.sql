-- =====================================================================================
-- VITO GINGLIES | MASTER SUPABASE SCHEMA
-- Copy and paste this entire script into the Supabase SQL Editor to initialize the DB.
-- =====================================================================================

-- 1. SITE SETTINGS TABLE
-- Stores global configurations, contact info, and FormSubmit routing.
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    store_name TEXT DEFAULT 'Vito Ginglies',
    store_email TEXT,
    footer_address TEXT,
    footer_phone TEXT,
    footer_hours TEXT,
    contact_text TEXT,
    formsubmit_email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inject the default settings row (ID 1 is required for the admin panel logic)
INSERT INTO public.site_settings (id, store_name, contact_text) 
VALUES (1, 'Vito Ginglies', 'Reach out for bespoke inquiries or order assistance.')
ON CONFLICT (id) DO NOTHING;


-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. PRODUCTS TABLE
-- image column accepts comma-separated URLs for the touch-swipe gallery
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image TEXT NOT NULL, 
    sizes TEXT[] DEFAULT '{"Standard"}',
    colors TEXT[] DEFAULT '{"Default"}',
    status TEXT DEFAULT 'Published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 4. PRODUCT VARIANTS TABLE
-- Links to Products. ON DELETE CASCADE ensures deleting a product deletes its variants.
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 5. COUPONS & PROMO CODES
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    value NUMERIC NOT NULL, -- Percentage discount (e.g., 20 for 20%)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 6. SHIPPING ZONES
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_name TEXT NOT NULL,
    rate NUMERIC NOT NULL, -- 0 for Free Shipping
    estimated_days TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 7. ORDERS TABLE
-- Tracks the lifetime value of customers based on customer_email
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- References the Supabase Auth User ID
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending', -- States: Paid, Processing, Delivered, Cancelled, Refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 8. RETURNS & EXCHANGES
-- ON DELETE CASCADE ensures that if an order is deleted, the ghost return is also deleted.
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    type TEXT DEFAULT 'Return',
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Requested', -- States: Requested, Approved, Rejected, Refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 9. CUSTOMER REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- States: Pending, Approved, Rejected
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Force cache reload for the API to instantly recognize all tables
NOTIFY pgrst, 'reload schema';