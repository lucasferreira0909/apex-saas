-- Create sidebar_folders table
CREATE TABLE public.sidebar_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.sidebar_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for sidebar_folders
CREATE POLICY "Users can view their own folders" 
ON public.sidebar_folders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
ON public.sidebar_folders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
ON public.sidebar_folders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
ON public.sidebar_folders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create sidebar_folder_items table
CREATE TABLE public.sidebar_folder_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES public.sidebar_folders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('funnel', 'board')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE(folder_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.sidebar_folder_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for sidebar_folder_items
CREATE POLICY "Users can view items in their folders" 
ON public.sidebar_folder_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.sidebar_folders 
  WHERE sidebar_folders.id = sidebar_folder_items.folder_id 
  AND sidebar_folders.user_id = auth.uid()
));

CREATE POLICY "Users can add items to their folders" 
ON public.sidebar_folder_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sidebar_folders 
  WHERE sidebar_folders.id = sidebar_folder_items.folder_id 
  AND sidebar_folders.user_id = auth.uid()
));

CREATE POLICY "Users can update items in their folders" 
ON public.sidebar_folder_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.sidebar_folders 
  WHERE sidebar_folders.id = sidebar_folder_items.folder_id 
  AND sidebar_folders.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their folders" 
ON public.sidebar_folder_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.sidebar_folders 
  WHERE sidebar_folders.id = sidebar_folder_items.folder_id 
  AND sidebar_folders.user_id = auth.uid()
));