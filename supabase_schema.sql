-- Supabase SQL Schema for Dell Cake

-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES ('site_config', '{
    "siteName": "دل‌کیک",
    "heroTitle": "دل‌کیک",
    "heroSlogan": "هنر شیرینی‌پزی، طعم عشق و خلق لحظه‌های ماندگار",
    "heroDescription": "سفارش کیک‌های خاص، شیرینی‌های خانگی و آموزش تخصصی شیرینی‌پزی با عشق، خلاقیت و طراحی اختصاصی برای شیرین‌تر کردن لحظه‌های خاص زندگی شما 💕",
    "phone": "09102768171",
    "instagram": "",
    "telegram": "",
    "bale": "",
    "logoUrl": "",
    "seoTitle": "دل‌کیک | سفارش کیک و آموزش شیرینی‌پزی",
    "seoDescription": "",
    "seoKeywords": ""
}'::jsonb) ON CONFLICT (key) DO NOTHING;

-- 3. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('cake', 'pastry', 'dessert')),
    price NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    duration TEXT,
    image_url TEXT,
    description TEXT,
    package_content TEXT[], -- Array of strings
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL, -- Nullable for guest orders if needed
    customer_name TEXT,
    phone TEXT,
    product_name TEXT,
    price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'preparing', 'ready', 'completed', 'cancelled')),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    category TEXT CHECK (category IN ('cake', 'pastry', 'cafe-cake', 'cupcake', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies

-- Profiles: Users can view and edit their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Site Settings: Everyone can read, only admins can write
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);

-- Courses: Everyone can read published, only admins can manage
CREATE POLICY "Anyone can read published courses" ON public.courses FOR SELECT USING (status = 'published');

-- Orders: Users can see their own orders, admins see all
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Gallery: Everyone can read, only admins can manage
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);

-- Admin Access: (We will define a way to identify admins, e.g., by email or a special metadata/role)
-- For now, we'll assume the admin email sobhanrahimisrj@gmail.com is handled in app logic or custom claims.
-- A simple way is to check the user's email in policies if possible, or use a separate admin role.

-- To enable full admin access (example):
-- CREATE POLICY "Admins can do everything on courses" ON public.courses FOR ALL USING (auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');
-- Note: Supabase policies are very flexible.
