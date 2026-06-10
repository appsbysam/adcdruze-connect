ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address TEXT;

UPDATE public.businesses SET featured = false WHERE featured IS NULL;