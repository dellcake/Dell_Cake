-- Migration SQL: Add missing columns and clean up outdated constraints on courses table to sync with supabase_schema.sql
-- Run this in the Supabase SQL Editor to update your remote database schema.

-- 1. Add missing columns to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sessions_count INTEGER DEFAULT 1;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT 'مدیر دل‌کیک';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 2. Drop outdated CHECK constraints (especially courses_category_check) to support dynamic categories from course_categories table
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_category_check;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_status_check;

-- 3. Re-add status constraint matching the latest schema
ALTER TABLE public.courses ADD CONSTRAINT courses_status_check CHECK (status IN ('published', 'draft', 'archived'));

-- 4. Notify PostgREST to reload the schema cache so client-side queries recognize the changes immediately
NOTIFY pgrst, 'reload schema';
