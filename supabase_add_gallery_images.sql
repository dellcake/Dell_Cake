-- Migration SQL: Multi-Image Gallery Support
-- Run this in the Supabase SQL Editor to enable multiple images per portfolio item.

-- 1. Create the gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID REFERENCES public.gallery(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON public.gallery_images(gallery_id);

-- 3. Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Gallery images select" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery images admin" ON public.gallery_images;

CREATE POLICY "Gallery images select" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Gallery images admin" ON public.gallery_images FOR ALL TO authenticated USING (is_admin());

-- 5. Grants
GRANT ALL ON TABLE public.gallery_images TO anon, authenticated, service_role;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
