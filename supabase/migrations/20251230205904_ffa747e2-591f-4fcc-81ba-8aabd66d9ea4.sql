-- Drop the overly permissive policies for card-attachments bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete attachments" ON storage.objects;

-- Create secure INSERT policy that verifies board ownership through card_id in path
CREATE POLICY "Users can upload attachments to their board cards"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-attachments' 
  AND EXISTS (
    SELECT 1 
    FROM board_cards bc 
    JOIN boards b ON b.id = bc.board_id 
    WHERE b.user_id = auth.uid() 
    AND (storage.foldername(name))[1] = bc.id::text
  )
);

-- Create secure DELETE policy that verifies board ownership through card_id in path
CREATE POLICY "Users can delete attachments from their board cards"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-attachments' 
  AND EXISTS (
    SELECT 1 
    FROM board_cards bc 
    JOIN boards b ON b.id = bc.board_id 
    WHERE b.user_id = auth.uid() 
    AND (storage.foldername(name))[1] = bc.id::text
  )
);

-- Create secure UPDATE policy that verifies board ownership through card_id in path
CREATE POLICY "Users can update attachments in their board cards"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-attachments' 
  AND EXISTS (
    SELECT 1 
    FROM board_cards bc 
    JOIN boards b ON b.id = bc.board_id 
    WHERE b.user_id = auth.uid() 
    AND (storage.foldername(name))[1] = bc.id::text
  )
);