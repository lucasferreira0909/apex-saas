-- Create funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnel_elements table
CREATE TABLE public.funnel_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  element_config JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_elements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funnels
CREATE POLICY "Users can view their own funnels" 
ON public.funnels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funnels" 
ON public.funnels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels" 
ON public.funnels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels" 
ON public.funnels 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for funnel_elements
CREATE POLICY "Users can view their funnel elements" 
ON public.funnel_elements 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Users can create their funnel elements" 
ON public.funnel_elements 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Users can update their funnel elements" 
ON public.funnel_elements 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Users can delete their funnel elements" 
ON public.funnel_elements 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid()));

-- Create trigger for automatic timestamp updates on funnels
CREATE TRIGGER update_funnels_updated_at
BEFORE UPDATE ON public.funnels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_funnels_user_id ON public.funnels(user_id);
CREATE INDEX idx_funnel_elements_funnel_id ON public.funnel_elements(funnel_id);
CREATE INDEX idx_funnel_elements_order ON public.funnel_elements(funnel_id, order_index);