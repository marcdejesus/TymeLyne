-- Function to update a user's avatar URL in the profiles table
CREATE OR REPLACE FUNCTION public.update_avatar_url(
  user_id UUID,
  new_avatar_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if the user exists in the profiles table
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = user_id
  ) INTO profile_exists;
  
  -- If the profile doesn't exist, create it
  IF NOT profile_exists THEN
    INSERT INTO profiles (id, avatar_url, created_at, updated_at)
    VALUES (
      user_id,
      new_avatar_url,
      NOW(),
      NOW()
    );
    
    result := jsonb_build_object(
      'success', TRUE,
      'message', 'Created new profile with avatar URL',
      'avatar_url', new_avatar_url
    );
  ELSE
    -- Update the existing profile's avatar URL
    UPDATE profiles
    SET 
      avatar_url = new_avatar_url,
      updated_at = NOW()
    WHERE id = user_id;
    
    result := jsonb_build_object(
      'success', TRUE,
      'message', 'Updated avatar URL',
      'avatar_url', new_avatar_url
    );
  END IF;
  
  RETURN result;
END;
$$; 