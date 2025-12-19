-- Create storage bucket for card attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('card-attachments', 'card-attachments', true);

-- Create storage policies for card attachments
CREATE POLICY "Users can view attachments from their boards"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'card-attachments' AND
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE b.user_id = auth.uid()
    AND (storage.foldername(name))[1] = bc.id::text
  )
);

CREATE POLICY "Users can upload attachments to their cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'card-attachments' AND
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE b.user_id = auth.uid()
    AND (storage.foldername(name))[1] = bc.id::text
  )
);

CREATE POLICY "Users can delete attachments from their cards"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'card-attachments' AND
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE b.user_id = auth.uid()
    AND (storage.foldername(name))[1] = bc.id::text
  )
);

-- Create table for card attachments metadata
CREATE TABLE public.card_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES board_cards(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for card_attachments
CREATE POLICY "Users can view attachments from their boards"
ON public.card_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE bc.id = card_attachments.card_id
    AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert attachments to their cards"
ON public.card_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE bc.id = card_attachments.card_id
    AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete attachments from their cards"
ON public.card_attachments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM board_cards bc
    JOIN boards b ON b.id = bc.board_id
    WHERE bc.id = card_attachments.card_id
    AND b.user_id = auth.uid()
  )
);