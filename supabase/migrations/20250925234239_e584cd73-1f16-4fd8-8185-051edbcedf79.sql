-- Add project_id column to funnels table to create relationship
ALTER TABLE public.funnels 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_funnels_project_id ON public.funnels(project_id);

-- Update existing funnels to have project_id where possible (if any exist)
-- This will set project_id to NULL for existing funnels without matching projects