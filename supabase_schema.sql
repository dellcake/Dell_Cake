-- ==========================================
-- Professional Supabase SQL Schema for Dell Cake
-- Optimized for Users, Orders, Courses and Security
-- ==========================================

-- 1. EXTENSIONS
-- Using gen_random_uuid() (built-in since PG 13) instead of uuid-ossp for better compatibility
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNCTIONS (Define early as they are used in RLS)
-- Shared Admin Check Function
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

-- 3. TABLES (Ordered by dependency)

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

-- Course Categories
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
    category TEXT, -- Slug reference
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

-- Order Items: Line items for each order
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

-- Payments: Transactions
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

-- Favorites: User's saved items
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

-- Notifications: User alerts
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog(slug);

-- 5. RLS SECURITY

-- Enable RLS on all tables
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

-- DROP OLD POLICIES (to ensure clean slate)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Profiles: Own data or Admin
CREATE POLICY "Profiles access" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id OR is_admin());

-- Courses: Everyone can see published, Admin all
CREATE POLICY "Courses access select" ON public.courses FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Courses access admin" ON public.courses FOR ALL TO authenticated USING (is_admin());

-- Products: Everyone can view, Admin all
CREATE POLICY "Products access select" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active' OR is_admin());
CREATE POLICY "Products access admin" ON public.products FOR ALL TO authenticated USING (is_admin());

-- Orders: Anyone can insert (guest checkout), View/Edit restricted to Own or Admin
CREATE POLICY "Orders insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Orders select" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Orders update" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());
CREATE POLICY "Orders delete" ON public.orders FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin());

-- Order Items: Anyone can insert, View/Edit restricted to linked order owners or Admin
CREATE POLICY "Order items insert" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Order items select" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));
CREATE POLICY "Order items update" ON public.order_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));
CREATE POLICY "Order items delete" ON public.order_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));

-- Payments: Own payments or Admin
CREATE POLICY "Payments access" ON public.payments FOR ALL TO authenticated USING (user_id = auth.uid() OR is_admin());

-- User Courses: Own enrollments or Admin
CREATE POLICY "User courses access" ON public.user_courses FOR ALL TO authenticated USING (user_id = auth.uid() OR is_admin());

-- Favorites: Own favorites
CREATE POLICY "Favorites access" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid());

-- Notifications: Own notifications
CREATE POLICY "Notifications access" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- Contact Messages: Insert anyone, View Admin
CREATE POLICY "Contact messages insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Contact messages admin" ON public.contact_messages FOR ALL TO authenticated USING (is_admin());

-- Site Settings: View everyone, Edit Admin
CREATE POLICY "Site settings select" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Site settings admin" ON public.site_settings FOR ALL TO authenticated USING (is_admin());

-- Course Categories: Everyone view, Admin all
CREATE POLICY "Course categories select" ON public.course_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Course categories admin" ON public.course_categories FOR ALL TO authenticated USING (is_admin());

-- Gallery Categories: Everyone view, Admin all
CREATE POLICY "Gallery categories select" ON public.gallery_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Gallery categories admin" ON public.gallery_categories FOR ALL TO authenticated USING (is_admin());

-- Gallery: Everyone view published, Admin all
CREATE POLICY "Gallery select" ON public.gallery FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Gallery admin" ON public.gallery FOR ALL TO authenticated USING (is_admin());

-- Blog: Everyone view published, Admin all
CREATE POLICY "Blog select" ON public.blog FOR SELECT TO anon, authenticated USING (status = 'published' OR is_admin());
CREATE POLICY "Blog admin" ON public.blog FOR ALL TO authenticated USING (is_admin());

-- 6. TRIGGERS & FUNCTIONS

-- Sync profiles with Auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'کاربر جدید'),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email = 'dellcake.orders@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_categories_updated_at ON public.course_categories;
CREATE TRIGGER update_course_categories_updated_at BEFORE UPDATE ON public.course_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_updated_at ON public.blog;
CREATE TRIGGER update_blog_updated_at BEFORE UPDATE ON public.blog FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_updated_at ON public.gallery;
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_categories_updated_at ON public.gallery_categories;
CREATE TRIGGER update_gallery_categories_updated_at BEFORE UPDATE ON public.gallery_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('gallery', 'gallery', true),
  ('products', 'products', true),
  ('courses', 'courses', true),
  ('blog', 'blog', true),
  ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
CREATE POLICY "Public view" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id IN ('profiles', 'gallery', 'courses', 'products', 'blog'));
CREATE POLICY "Avatar upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admin storage all" ON storage.objects FOR ALL TO authenticated USING (is_admin());

-- 8. REALTIME (Optional)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 9. FINAL ADMIN FIX
-- Ensure the main admin has the correct role if already exists
UPDATE public.profiles SET role = 'admin' WHERE email = 'dellcake.orders@gmail.com';

-- Grant access to public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
