-- Migration SQL: Switch gallery code generation from sequence-based to MAX(code) + 1
-- Run this in the Supabase SQL Editor to update your remote database schema.

-- 1. Remove the default sequence constraint from the code column
ALTER TABLE public.gallery ALTER COLUMN code DROP DEFAULT;

-- 2. Drop the old sequence safely (since it is no longer needed)
DROP SEQUENCE IF EXISTS public.gallery_code_seq;

-- 3. Create a highly concurrency-safe PL/pgSQL trigger function
-- Using LOCK TABLE in EXCLUSIVE mode ensures that concurrent inserts are executed
-- sequentially, preventing race conditions or duplicate code generation.
CREATE OR REPLACE FUNCTION public.set_next_gallery_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Obtain an exclusive lock on the gallery table for the duration of this transaction.
    -- This guarantees that only one transaction can compute MAX(code) at a time,
    -- eliminating concurrent insertion race conditions entirely.
    LOCK TABLE public.gallery IN EXCLUSIVE MODE;

    IF NEW.code IS NULL THEN
        NEW.code := COALESCE((SELECT MAX(code) FROM public.gallery), 0) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop the existing trigger if it exists and attach our new one
DROP TRIGGER IF EXISTS trg_set_next_gallery_code ON public.gallery;
CREATE TRIGGER trg_set_next_gallery_code
BEFORE INSERT ON public.gallery
FOR EACH ROW
EXECUTE FUNCTION public.set_next_gallery_code();

-- 5. Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
