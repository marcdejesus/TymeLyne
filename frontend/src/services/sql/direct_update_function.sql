-- Function to directly update avatar URL without RLS
-- This bypasses all policies and updates the profile directly
CREATE OR REPLACE FUNCTION public.direct_update_profile(
    user_email TEXT,
    new_full_name TEXT DEFAULT NULL,
    new_bio TEXT DEFAULT NULL,
    new_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    profile_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Find the user ID from the email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = target_user_id
    ) INTO profile_exists;
    
    -- Create profile if it doesn't exist
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            bio,
            avatar_url,
            role,
            created_at,
            updated_at
        ) VALUES (
            target_user_id,
            user_email,
            COALESCE(new_full_name, ''),
            COALESCE(new_bio, ''),
            new_avatar_url,
            'USER',
            NOW(),
            NOW()
        )
        RETURNING to_jsonb(profiles.*) INTO result;
        
        RETURN result;
    END IF;
    
    -- Update existing profile
    UPDATE public.profiles
    SET 
        full_name = CASE WHEN new_full_name IS NOT NULL THEN new_full_name ELSE full_name END,
        bio = CASE WHEN new_bio IS NOT NULL THEN new_bio ELSE bio END,
        avatar_url = CASE WHEN new_avatar_url IS NOT NULL THEN new_avatar_url ELSE avatar_url END,
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING to_jsonb(profiles.*) INTO result;
    
    RETURN result;
END;
$$;

-- Create a function to check if user has an account
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(
    user_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_user_id UUID;
BEGIN
    SELECT id INTO found_user_id
    FROM auth.users
    WHERE email = user_email;
    
    RETURN found_user_id;
END;
$$;

-- Usage examples:
-- SELECT * FROM public.direct_update_profile('user@example.com', 'New Name', 'New Bio', 'https://example.com/avatar.jpg');
-- SELECT * FROM public.direct_update_profile('user@example.com', 'New Name', 'New Bio');
-- SELECT * FROM public.direct_update_profile('user@example.com', NULL, NULL, 'https://example.com/avatar.jpg');
-- SELECT public.get_user_id_by_email('user@example.com'); 