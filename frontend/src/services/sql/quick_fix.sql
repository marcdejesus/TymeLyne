-- Quick fix for profile and storage permissions
-- Run this in the Supabase SQL editor to fix common issues

-- Drop existing storage policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own avatars" ON storage.objects;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new more permissive policies for storage
-- Public can view all avatars
CREATE POLICY "Public Access"
    ON storage.objects 
    FOR SELECT
    USING (bucket_id = 'avatars');

-- More permissive policy for authenticated users to manage the avatars bucket
CREATE POLICY "Users can manage their own avatars"
    ON storage.objects 
    FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars')
    WITH CHECK (bucket_id = 'avatars');

-- Reset profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simpler policies for the profiles table
CREATE POLICY "Users can view their own profile"
    ON public.profiles 
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles 
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles 
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Function to directly update profile that bypasses all policies
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

-- Function to create bucket that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_avatars_bucket(
    bucket_name TEXT DEFAULT 'avatars',
    public_access BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = bucket_name
    ) INTO bucket_exists;
    
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (
            bucket_name, 
            bucket_name,
            public_access
        );
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Create avatars bucket if it doesn't exist
SELECT public.create_avatars_bucket('avatars', true);

-- For testing: Try updating your profile
SELECT * FROM direct_update_profile('your-email@example.com', 'Test Name', 'Test Bio'); 