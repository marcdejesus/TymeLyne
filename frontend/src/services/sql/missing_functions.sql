-- Add the missing functions that are being called in the front-end

-- Function to reset profile policies
CREATE OR REPLACE FUNCTION public.reset_profile_policies()
RETURNS BOOLEAN
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

    RETURN TRUE;
END;
$$;

-- Function to fix missing profiles
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profiles_created INTEGER := 0;
    missing_user RECORD;
BEGIN
    FOR missing_user IN 
        SELECT 
            u.id, 
            u.email, 
            u.raw_user_meta_data->>'full_name' as full_name
        FROM 
            auth.users u
        WHERE 
            NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
    LOOP
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            bio,
            role,
            created_at,
            updated_at
        ) VALUES (
            missing_user.id,
            missing_user.email,
            COALESCE(missing_user.full_name, ''),
            '',
            'USER',
            NOW(),
            NOW()
        );
        
        profiles_created := profiles_created + 1;
    END LOOP;
    
    RETURN profiles_created;
END;
$$;

-- Function to test storage permissions
CREATE OR REPLACE FUNCTION public.test_storage_permissions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'avatars_bucket_exists', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars'),
        'total_storage_objects', (SELECT COUNT(*) FROM storage.objects),
        'user_can_upload', true
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to test profile permissions
CREATE OR REPLACE FUNCTION public.test_profile_permissions(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    is_admin_user BOOLEAN;
    profile_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = user_id AND is_admin = true
    ) INTO is_admin_user;
    
    -- Check if profile exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = user_id
    ) INTO profile_exists;
    
    -- Build result object
    SELECT jsonb_build_object(
        'user_id', user_id,
        'email', user_email,
        'is_admin', is_admin_user,
        'profile_exists', profile_exists,
        'has_read_permission', true,
        'has_write_permission', true
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to ensure a user is an admin
CREATE OR REPLACE FUNCTION public.ensure_user_is_admin(admin_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    already_admin BOOLEAN;
    admin_table_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Check if admin_users table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
    ) INTO admin_table_exists;
    
    -- Create admin_users table if it doesn't exist
    IF NOT admin_table_exists THEN
        CREATE TABLE public.admin_users (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Enable RLS on the admin_users table
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for admin_users
        CREATE POLICY "Everyone can read admin_users" 
            ON public.admin_users 
            FOR SELECT 
            USING (true);
    END IF;
    
    -- Get the user ID from email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', admin_email;
    END IF;
    
    -- Check if user is already an admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = target_user_id AND is_admin = TRUE
    ) INTO already_admin;
    
    IF already_admin THEN
        -- User is already an admin
        SELECT jsonb_build_object(
            'user_id', target_user_id,
            'is_admin', true,
            'message', 'User is already an admin',
            'action_taken', 'none'
        ) INTO result;
    ELSE
        -- Insert or update admin status
        INSERT INTO public.admin_users (user_id, email, is_admin)
        VALUES (target_user_id, admin_email, TRUE)
        ON CONFLICT (user_id) 
        DO UPDATE SET is_admin = TRUE, email = admin_email;
        
        -- Also update the profile role to ADMIN
        UPDATE public.profiles
        SET role = 'ADMIN'
        WHERE id = target_user_id;
        
        SELECT jsonb_build_object(
            'user_id', target_user_id,
            'is_admin', true,
            'message', 'User has been made an admin',
            'action_taken', 'inserted'
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$;

-- Function to make a user an admin (alias for ensure_user_is_admin)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Just call the ensure_user_is_admin function
    RETURN public.ensure_user_is_admin(user_email);
END;
$$; 