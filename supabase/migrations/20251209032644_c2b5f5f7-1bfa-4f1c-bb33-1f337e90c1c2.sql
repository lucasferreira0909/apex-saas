-- Create table for chat conversations
CREATE TABLE public.apex_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.apex_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.apex_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apex_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apex_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.apex_conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON public.apex_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.apex_conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.apex_conversations FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages of their conversations" 
ON public.apex_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.apex_conversations 
  WHERE apex_conversations.id = apex_messages.conversation_id 
  AND apex_conversations.user_id = auth.uid()
));

CREATE POLICY "Users can insert messages in their conversations" 
ON public.apex_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.apex_conversations 
  WHERE apex_conversations.id = apex_messages.conversation_id 
  AND apex_conversations.user_id = auth.uid()
));

CREATE POLICY "Users can delete messages from their conversations" 
ON public.apex_messages FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.apex_conversations 
  WHERE apex_conversations.id = apex_messages.conversation_id 
  AND apex_conversations.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_apex_conversations_user_id ON public.apex_conversations(user_id);
CREATE INDEX idx_apex_messages_conversation_id ON public.apex_messages(conversation_id);

-- Trigger for updated_at
CREATE TRIGGER update_apex_conversations_updated_at
BEFORE UPDATE ON public.apex_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();