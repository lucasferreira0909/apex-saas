-- Create a function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_current_user_account()
RETURNS void AS $$
BEGIN
  -- Only allow authenticated users to delete their own account
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user's profile first (if exists)
  DELETE FROM public.profiles WHERE user_id = auth.uid();
  
  -- The actual deletion of the auth user needs to be handled by an edge function
  -- This function will be called from the edge function after deleting the auth user
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;