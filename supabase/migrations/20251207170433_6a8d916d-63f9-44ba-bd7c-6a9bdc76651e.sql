-- Create table to store funnel edges (connections between nodes)
CREATE TABLE public.funnel_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  source_handle TEXT,
  target_handle TEXT,
  edge_style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funnel_edges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view edges of their funnels"
ON public.funnel_edges
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM funnels
  WHERE funnels.id = funnel_edges.funnel_id
  AND funnels.user_id = auth.uid()
));

CREATE POLICY "Users can insert edges in their funnels"
ON public.funnel_edges
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM funnels
  WHERE funnels.id = funnel_edges.funnel_id
  AND funnels.user_id = auth.uid()
));

CREATE POLICY "Users can update edges in their funnels"
ON public.funnel_edges
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM funnels
  WHERE funnels.id = funnel_edges.funnel_id
  AND funnels.user_id = auth.uid()
));

CREATE POLICY "Users can delete edges from their funnels"
ON public.funnel_edges
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM funnels
  WHERE funnels.id = funnel_edges.funnel_id
  AND funnels.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_funnel_edges_updated_at
BEFORE UPDATE ON public.funnel_edges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();