-- Fix storage bucket permissions

-- First, make sure the avatars bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    -- Check if avatars bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) INTO bucket_exists;
    
    IF NOT bucket_exists THEN
        -- Create the avatars bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'avatars',
            'avatars',
            true,
            5242880, -- 5MB limit
            ARRAY['image/jpeg', 'image/png', 'image/gif']
        );
        RAISE NOTICE 'Created avatars bucket';
    ELSE
        RAISE NOTICE 'Avatars bucket already exists';
    END IF;
END $$;

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

-- Grant direct access to service role
GRANT ALL ON storage.objects TO service_role;

-- Create a special function to ensure user is admin
CREATE OR REPLACE FUNCTION public.ensure_user_is_admin(
    admin_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    is_already_admin BOOLEAN;
BEGIN
    -- Find the user ID from the email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', admin_email;
        RETURN FALSE;
    END IF;
    
    -- Check if already admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = user_id AND is_admin = true
    ) INTO is_already_admin;
    
    -- If not admin, make admin
    IF NOT is_already_admin THEN
        -- Insert into admin_users
        INSERT INTO public.admin_users (user_id, is_admin)
        VALUES (user_id, TRUE)
        ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
        
        -- Update profile role
        UPDATE public.profiles
        SET role = 'ADMIN'
        WHERE id = user_id;
        
        RAISE NOTICE 'User % has been made an admin', admin_email;
    ELSE
        RAISE NOTICE 'User % is already an admin', admin_email;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create a function that bypasses RLS to create buckets
CREATE OR REPLACE FUNCTION storage.create_bucket_rpc(
    bucket_name TEXT,
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

-- Create a function to test storage permissions
CREATE OR REPLACE FUNCTION public.test_storage_permissions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Try to create a test bucket
    PERFORM storage.create_bucket_rpc('test-bucket-' || (random() * 1000)::int);
    
    -- Check permissions
    SELECT jsonb_build_object(
        'can_create_bucket', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated' AND pg_has_role('authenticated', 'buckets_admin', 'member')),
        'can_insert_object', EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE grantee = 'authenticated' 
            AND table_name = 'objects'
            AND privilege_type = 'INSERT'
        ),
        'authenticated_role_exists', EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'),
        'storage_schema_accessible', EXISTS (
            SELECT 1 FROM information_schema.role_usage_grants 
            WHERE grantee = 'authenticated' 
            AND object_schema = 'storage'
        ),
        'avatars_bucket_exists', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars'),
        'avatars_bucket_public', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars' AND public = true)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Run this to make yourself an admin
-- SELECT public.ensure_user_is_admin('your-email@example.com');

-- And run this to check storage permissions
-- SELECT public.test_storage_permissions();

-- Create a function to test profile permissions
CREATE OR REPLACE FUNCTION public.test_profile_permissions(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    user_id UUID;
    role_name TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Get user role
    SELECT role FROM public.profiles WHERE id = user_id INTO role_name;
    
    -- Check permissions
    SELECT jsonb_build_object(
        'user_id', user_id,
        'user_email', user_email,
        'admin_user_exists', EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = user_id),
        'is_admin', EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = user_id AND is_admin = true),
        'profile_exists', EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id),
        'profile_role', role_name,
        'update_permissions', EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE grantee = 'authenticated' 
            AND table_name = 'profiles'
            AND privilege_type = 'UPDATE'
        ),
        'select_permissions', EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE grantee = 'authenticated' 
            AND table_name = 'profiles'
            AND privilege_type = 'SELECT'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Create a function to reset all profile policies for a fresh start
CREATE OR REPLACE FUNCTION public.reset_profile_policies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    
    -- Create fresh policies
    -- User can view/update/insert their own profile
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
    
    -- Admins can view/update all profiles (with simplified policy)
    CREATE POLICY "Admins can view all profiles"
        ON public.profiles 
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_admin = true
            )
        );

    CREATE POLICY "Admins can update all profiles"
        ON public.profiles 
        FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_admin = true
            )
        );
        
    RETURN 'Profile policies reset successfully';
END;
$$;

-- Make sure any missing users get profiles
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_created INTEGER := 0;
    user_rec RECORD;
BEGIN
    FOR user_rec IN 
        SELECT id, email, raw_user_meta_data->>'full_name' as full_name 
        FROM auth.users 
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id)
    LOOP
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            user_rec.id,
            user_rec.email,
            COALESCE(user_rec.full_name, split_part(user_rec.email, '@', 1)),
            'USER',
            NOW(),
            NOW()
        );
        
        count_created := count_created + 1;
    END LOOP;
    
    RETURN count_created;
END;
$$;

-- For testing:
-- SELECT public.fix_missing_profiles();
-- SELECT public.reset_profile_policies();
-- SELECT public.test_profile_permissions('your-email@example.com'); 