-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('funnel', 'video', 'message')),
  folder TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  template_type TEXT,
  thumbnail TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funnels" ON public.funnels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funnels" ON public.funnels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels" ON public.funnels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels" ON public.funnels
  FOR DELETE USING (auth.uid() = user_id);

-- Create funnel_elements table
CREATE TABLE public.funnel_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  configured BOOLEAN NOT NULL DEFAULT false,
  element_config JSONB DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view elements of their funnels" ON public.funnel_elements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid())
  );

CREATE POLICY "Users can insert elements in their funnels" ON public.funnel_elements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid())
  );

CREATE POLICY "Users can update elements in their funnels" ON public.funnel_elements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid())
  );

CREATE POLICY "Users can delete elements from their funnels" ON public.funnel_elements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_elements.funnel_id AND funnels.user_id = auth.uid())
  );

-- Create boards table
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boards" ON public.boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON public.boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON public.boards
  FOR DELETE USING (auth.uid() = user_id);

-- Create board_columns table
CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view columns of their boards" ON public.board_columns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_columns.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can insert columns in their boards" ON public.board_columns
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_columns.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can update columns in their boards" ON public.board_columns
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_columns.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can delete columns from their boards" ON public.board_columns
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_columns.board_id AND boards.user_id = auth.uid())
  );

-- Create board_cards table
CREATE TABLE public.board_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.board_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.board_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards of their boards" ON public.board_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_cards.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can insert cards in their boards" ON public.board_cards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_cards.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can update cards in their boards" ON public.board_cards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_cards.board_id AND boards.user_id = auth.uid())
  );

CREATE POLICY "Users can delete cards from their boards" ON public.board_cards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_cards.board_id AND boards.user_id = auth.uid())
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON public.funnels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_elements_updated_at BEFORE UPDATE ON public.funnel_elements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_columns_updated_at BEFORE UPDATE ON public.board_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_cards_updated_at BEFORE UPDATE ON public.board_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();