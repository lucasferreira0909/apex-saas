-- Add folder column to boards table
ALTER TABLE public.boards 
ADD COLUMN folder text;