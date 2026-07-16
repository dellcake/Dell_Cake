-- Professional Supabase SQL Schema for Dell Cake
-- Optimized for Users, Orders, Courses and Security

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SHARED FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TABLES

-- Profiles: Extended user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Course Categories (Academy)
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery Categories
CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Courses: Educational content
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT, -- Slug of course_categories
    price NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    level TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    duration TEXT,
    sessions_count INTEGER DEFAULT 1,
    teacher_name TEXT DEFAULT 'مدیر دل‌کیک',
    display_order INTEGER DEFAULT 0,
    image_url TEXT,
    video_url TEXT,
    description TEXT,
    short_description TEXT,
    package_content TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products: Physical items
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    description TEXT,
    image_url TEXT,
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders: Customer orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    customer_name TEXT,
    phone TEXT,
    product_name TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'preparing', 'ready', 'completed', 'cancelled')),
    address TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    method TEXT CHECK (method IN ('online', 'card', 'cash')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Course Enrollments
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses ON DELETE CASCADE,
    product_id UUID REFERENCES public.products ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (
        (course_id IS NOT NULL AND product_id IS NULL) OR
        (course_id IS NULL AND product_id IS NOT NULL)
    ),
    UNIQUE(user_id, course_id, product_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    watermark_enabled BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog
CREATE TABLE IF NOT EXISTS public.blog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'published',
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog(slug);

-- 5. RLS SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;

-- CLEANUP OLD POLICIES
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 5.1 Profiles
CREATE POLICY "Profiles access" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id OR is_admin());

-- 5.2 Courses
CREATE POLICY "Courses select" ON public.courses FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Courses admin" ON public.courses FOR ALL TO authenticated USING (is_admin());

-- 5.3 Products
CREATE POLICY "Products select" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active' OR is_admin());
CREATE POLICY "Products admin" ON public.products FOR ALL TO authenticated USING (is_admin());

-- 5.4 Orders
CREATE POLICY "Orders insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Orders select" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Orders update" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY "Orders delete" ON public.orders FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin());

-- 5.5 Order Items
CREATE POLICY "Order items insert" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Order items select" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));
CREATE POLICY "Order items update" ON public.order_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));
CREATE POLICY "Order items delete" ON public.order_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));

-- 5.6 Categories
CREATE POLICY "Course categories select" ON public.course_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Course categories admin" ON public.course_categories FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Gallery categories select" ON public.gallery_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Gallery categories admin" ON public.gallery_categories FOR ALL TO authenticated USING (is_admin());

-- 5.7 Gallery & Blog
CREATE POLICY "Gallery select" ON public.gallery FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Gallery admin" ON public.gallery FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Blog select" ON public.blog FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Blog admin" ON public.blog FOR ALL TO authenticated USING (is_admin());

-- 5.8 Others
CREATE POLICY "Payments access" ON public.payments FOR ALL TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "User courses access" ON public.user_courses FOR ALL TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Favorites access" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notifications access" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Contact messages insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Contact messages admin" ON public.contact_messages FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Site settings select" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Site settings admin" ON public.site_settings FOR ALL TO authenticated USING (is_admin());

-- 6. TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger Helper for tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'courses', 'course_categories', 'gallery', 'gallery_categories', 'products', 'orders', 'blog'))
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- Auth Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'کاربر جدید'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = 'dellcake.orders@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true), ('products', 'products', true), ('courses', 'courses', true), ('blog', 'blog', true), ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Storage public view" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id IN ('profiles', 'gallery', 'courses', 'products', 'blog'));
CREATE POLICY "Admin storage all" ON storage.objects FOR ALL TO authenticated USING (is_admin());

-- 8. FINAL FIXES
UPDATE public.profiles SET role = 'admin' WHERE email = 'dellcake.orders@gmail.com';
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
