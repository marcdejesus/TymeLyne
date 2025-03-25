-- Function to allow updating a profile from RPC
CREATE OR REPLACE FUNCTION public.update_profile(
    user_id UUID,
    new_full_name TEXT DEFAULT NULL,
    new_bio TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    profile_exists BOOLEAN;
BEGIN
    -- Check if the profile exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user_id
    ) INTO profile_exists;
    
    -- If profile doesn't exist, create it
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id, 
            full_name,
            bio,
            role,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            COALESCE(new_full_name, ''),
            COALESCE(new_bio, ''),
            'USER',
            NOW(),
            NOW()
        )
        RETURNING to_jsonb(profiles.*) INTO result;
        
        RETURN result;
    END IF;
    
    -- Otherwise update the existing profile
    UPDATE public.profiles
    SET 
        full_name = COALESCE(new_full_name, full_name),
        bio = COALESCE(new_bio, bio),
        updated_at = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update avatar URL (separate from profile)
CREATE OR REPLACE FUNCTION public.update_avatar_url(
    user_id UUID,
    new_avatar_url TEXT
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    profile_exists BOOLEAN;
BEGIN
    -- Check if the profile exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user_id
    ) INTO profile_exists;
    
    -- If profile doesn't exist, create it with the avatar
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id, 
            avatar_url,
            role,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            new_avatar_url,
            'USER',
            NOW(),
            NOW()
        )
        RETURNING to_jsonb(profiles.*) INTO result;
        
        RETURN result;
    END IF;
    
    -- Otherwise update the existing profile
    UPDATE public.profiles
    SET 
        avatar_url = new_avatar_url,
        updated_at = NOW()
    WHERE id = user_id
    RETURNING to_jsonb(profiles.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to explicitly create a user profile when needed
CREATE OR REPLACE FUNCTION public.create_profile(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    email_username TEXT;
BEGIN
    -- Create a username from the email
    email_username := split_part(user_email, '@', 1);
    
    -- Check if profile exists first
    SELECT to_jsonb(profiles.*) INTO result
    FROM public.profiles
    WHERE id = user_id;
    
    -- Only create if it doesn't exist
    IF result IS NULL THEN
        -- Create the profile
        INSERT INTO public.profiles (
            id, 
            email,
            full_name,
            role,
            created_at,
            updated_at
        )
        VALUES (
            user_id,
            user_email,
            COALESCE(user_full_name, email_username),
            'USER',
            NOW(),
            NOW()
        )
        RETURNING to_jsonb(profiles.*) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a secure function to get a profile by ID without hitting RLS policies
CREATE OR REPLACE FUNCTION public.get_profile_by_id(lookup_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'bio', bio,
    'avatar_url', avatar_url,
    'role', role,
    'created_at', created_at,
    'updated_at', updated_at
  )
  INTO profile_record
  FROM public.profiles
  WHERE id = lookup_user_id;
  
  RETURN profile_record;
END;
$$; 