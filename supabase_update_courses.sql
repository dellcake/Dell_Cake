-- Migration SQL: Add missing columns to courses table to sync with supabase_schema.sql
-- Run this in the Supabase SQL Editor to update your remote database schema.

-- 1. Add missing columns to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sessions_count INTEGER DEFAULT 1;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT 'مدیر دل‌کیک';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 2. Notify PostgREST to reload the schema cache so client-side queries recognize the new columns immediately
NOTIFY pgrst, 'reload schema';
