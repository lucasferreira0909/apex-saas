-- Add DELETE policy for profiles table so users can remove their own data (GDPR/data privacy compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);