-- Function to sync profile data from auth.users to profiles table
-- This is useful if you're experiencing issues where profile updates 
-- aren't being reflected in the UI

CREATE OR REPLACE FUNCTION public.force_sync_profile(
    user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    auth_data JSONB;
    profile_data JSONB;
    result JSONB;
BEGIN
    -- Find the user ID from email
    SELECT id, to_jsonb(users) INTO target_user_id, auth_data
    FROM auth.users
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Check if profile exists
    SELECT to_jsonb(profiles) INTO profile_data
    FROM public.profiles
    WHERE id = target_user_id;
    
    -- Create profile if it doesn't exist
    IF profile_data IS NULL THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            created_at,
            updated_at
        ) VALUES (
            target_user_id,
            user_email,
            COALESCE(auth_data->'raw_user_meta_data'->>'full_name', split_part(user_email, '@', 1)),
            NOW(),
            NOW()
        )
        RETURNING to_jsonb(profiles) INTO profile_data;
    END IF;
    
    -- Update profile with auth data
    UPDATE public.profiles
    SET 
        email = user_email,
        full_name = COALESCE(profiles.full_name, auth_data->'raw_user_meta_data'->>'full_name', profiles.full_name),
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING to_jsonb(profiles) INTO profile_data;
    
    -- Build result with before/after data
    SELECT jsonb_build_object(
        'user_id', target_user_id,
        'email', user_email,
        'auth_data', auth_data,
        'profile_data', profile_data,
        'sync_timestamp', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create a function to check if all users have profiles
CREATE OR REPLACE FUNCTION public.check_missing_profiles()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    has_profile BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id) AS has_profile
    FROM 
        auth.users u;
END;
$$;

-- Example usage:
-- SELECT * FROM public.force_sync_profile('your-email@example.com');
-- SELECT * FROM public.check_missing_profiles(); 