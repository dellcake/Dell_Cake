-- Supabase SQL Schema for Dell Cake

-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'کاربر جدید'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email = 'sobhanrahimisrj@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
    details JSONB,
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

-- 6. Blog Posts
CREATE TABLE IF NOT EXISTS public.blog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    author_name TEXT DEFAULT 'مدیریت دل‌کیک',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Contact Messages
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

-- 8. User Course Enrollments
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Row Level Security (RLS) Policies

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com'
);

-- Site Settings Policies
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins have full access to site settings" ON public.site_settings
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- Courses Policies
CREATE POLICY "Anyone can read published courses" ON public.courses FOR SELECT USING (status = 'published');
CREATE POLICY "Admins have full access to courses" ON public.courses
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- Orders Policies
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to orders" ON public.orders
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- Gallery Policies
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins have full access to gallery" ON public.gallery
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- Blog Policies
CREATE POLICY "Anyone can read published blog posts" ON public.blog FOR SELECT USING (status = 'published');
CREATE POLICY "Admins have full access to blog" ON public.blog
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- Contact Messages Policies
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to contact messages" ON public.contact_messages
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');

-- User Courses Policies
CREATE POLICY "Users can see their own enrollments" ON public.user_courses
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to user courses" ON public.user_courses
FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR auth.jwt() ->> 'email' = 'sobhanrahimisrj@gmail.com');
