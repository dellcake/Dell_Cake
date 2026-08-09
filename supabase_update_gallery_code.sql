-- Migration SQL: Add self-incrementing, unique sequential code to gallery table
-- Run this in the Supabase SQL Editor to update your remote database schema.

-- 1. Create a sequence for the gallery codes starting from 1
CREATE SEQUENCE IF NOT EXISTS public.gallery_code_seq START WITH 1;

-- 2. Add the code column to the gallery table as nullable first
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS code INTEGER;

-- 3. Backfill existing records sequentially starting from 1 based on created_at ascending
WITH updated AS (
    SELECT id, row_number() OVER (ORDER BY created_at ASC) as rnum
    FROM public.gallery
)
UPDATE public.gallery g
SET code = u.rnum
FROM updated u
WHERE g.id = u.id AND g.code IS NULL;

-- 4. Set the sequence to start from the next number after the maximum backfilled code (or 1 if empty)
SELECT setval('public.gallery_code_seq', COALESCE((SELECT MAX(code) FROM public.gallery), 0) + 1, false);

-- 5. Add unique constraint and set the default value of the code column to use the sequence
ALTER TABLE public.gallery ALTER COLUMN code SET DEFAULT nextval('public.gallery_code_seq');
ALTER TABLE public.gallery ALTER COLUMN code SET NOT NULL;
ALTER TABLE public.gallery ADD CONSTRAINT gallery_code_unique UNIQUE (code);

-- 6. Notify PostgREST to reload the schema cache so client-side queries recognize the changes immediately
NOTIFY pgrst, 'reload schema';
