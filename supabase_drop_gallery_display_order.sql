-- Migration SQL: Drop 'display_order' column from 'gallery' table
-- Run this in the Supabase SQL Editor to clean up your remote database schema.

-- 1. Safely drop the display_order column from the gallery table
ALTER TABLE public.gallery DROP COLUMN IF EXISTS display_order;

-- 2. Notify PostgREST to reload the schema cache so client-side queries recognize the changes immediately
NOTIFY pgrst, 'reload schema';
