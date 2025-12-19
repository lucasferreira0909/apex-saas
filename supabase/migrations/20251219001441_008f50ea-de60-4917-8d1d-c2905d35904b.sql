-- Drop existing storage policies that might not be working
DROP POLICY IF EXISTS "Users can view attachments from their boards" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload attachments to their cards" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete attachments from their cards" ON storage.objects;

-- Create simpler storage policies - allow authenticated users to manage their files
CREATE POLICY "Allow authenticated users to upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-attachments');

CREATE POLICY "Allow public read access to attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-attachments');

CREATE POLICY "Allow authenticated users to delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-attachments');