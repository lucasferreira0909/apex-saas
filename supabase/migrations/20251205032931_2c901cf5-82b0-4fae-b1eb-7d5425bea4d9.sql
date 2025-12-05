-- Add folder column to funnels table
ALTER TABLE public.funnels 
ADD COLUMN IF NOT EXISTS folder text;