-- --------------------------------------------------------
-- Script to run all SQL in order with proper policy cleanup
-- --------------------------------------------------------

-- First, drop all potentially problematic policies
DO $$
BEGIN
  -- Drop policies on profiles table
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
  
  -- Drop policies on admin_users table
  DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
  DROP POLICY IF EXISTS "Users can read admin_users" ON public.admin_users;
  DROP POLICY IF EXISTS "Everyone can read admin_users" ON public.admin_users;
  
  -- Drop storage policies
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;
  
  -- Drop all functions to ensure clean slate
  DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
  DROP FUNCTION IF EXISTS public.setup_database() CASCADE;
  DROP FUNCTION IF EXISTS public.make_user_admin(TEXT) CASCADE;
  DROP FUNCTION IF EXISTS public.update_profile(UUID, TEXT, TEXT) CASCADE;
  DROP FUNCTION IF EXISTS public.update_avatar_url(UUID, TEXT) CASCADE;
  DROP FUNCTION IF EXISTS storage.create_bucket(TEXT) CASCADE;
  DROP FUNCTION IF EXISTS public.create_profile(UUID, TEXT, TEXT) CASCADE;
  DROP FUNCTION IF EXISTS public.init_admin(TEXT) CASCADE;
  DROP FUNCTION IF EXISTS public.get_profile_by_id(UUID) CASCADE;
  
  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error dropping existing objects: %', SQLERRM;
END
$$;

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    email_username TEXT;
BEGIN
    -- Validate email format (skip if null to avoid trigger errors)
    IF NEW.email IS NULL THEN
        RETURN NEW;
    END IF;

    -- Extract username from email
    email_username := split_part(NEW.email, '@', 1);

    -- More permissive email validation
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE WARNING 'Invalid email format: %', NEW.email;
        -- Continue anyway, don't block the user creation
    END IF;

    -- Create profile with username derived from email
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', email_username),
            'USER'
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but allow user creation to succeed
        RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Setup Database Function
CREATE OR REPLACE FUNCTION public.setup_database()
RETURNS void AS $$
DECLARE
    bucket_exists boolean;
    current_user_id UUID;
BEGIN
    -- Ensure public schema is properly configured
    -- Grant usage to authenticated and anon roles
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;
    
    -- Make sure public tables are accessible
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER', 'PREMIUM')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create an admin_users table (to avoid recursion in policies)
    CREATE TABLE IF NOT EXISTS public.admin_users (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id),
        is_admin BOOLEAN DEFAULT TRUE
    );

    -- Grant access to the tables
    GRANT ALL ON TABLE public.profiles TO authenticated;
    GRANT SELECT ON TABLE public.profiles TO anon;
    GRANT ALL ON TABLE public.admin_users TO authenticated;
    GRANT SELECT ON TABLE public.admin_users TO anon;

    -- Enable RLS on the tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

    -- Delete existing policies (just to be safe)
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
    DROP POLICY IF EXISTS "Users can read admin_users" ON public.admin_users;
    DROP POLICY IF EXISTS "Everyone can read admin_users" ON public.admin_users;
    
    -- Create simpler policies for admin_users table WITHOUT recursion
    -- Allow all authenticated users to read the admin_users table
    CREATE POLICY "Everyone can read admin_users"
        ON public.admin_users 
        FOR SELECT
        TO authenticated
        USING (true);
    
    -- Only service_role can modify the admin_users table directly (circumventing policies)
    -- Users will use the RPC functions to modify this table
    
    -- Only try to insert current user if we're in an authenticated context
    -- Get the current user ID if available
    current_user_id := auth.uid();
    
    -- Only insert if we have a valid user ID
    IF current_user_id IS NOT NULL THEN
        -- Insert current user into admin_users
        INSERT INTO public.admin_users (user_id, is_admin)
        VALUES (current_user_id, TRUE)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Create policies for the profiles table
    -- User can view/edit their own profile
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
    
    -- Admins can view/update all profiles
    CREATE POLICY "Admins can view all profiles"
        ON public.profiles 
        FOR SELECT
        TO authenticated
        USING (EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_admin = true
        ));

    CREATE POLICY "Admins can update all profiles"
        ON public.profiles 
        FOR UPDATE
        TO authenticated
        USING (EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_admin = true
        ));

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
    END IF;

    -- Enable RLS on storage
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing storage policies if they exist
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;

    -- Create policies for the storage bucket
    CREATE POLICY "Public Access"
        ON storage.objects 
        FOR SELECT
        USING (bucket_id = 'avatars');

    CREATE POLICY "Authenticated users can upload avatars"
        ON storage.objects 
        FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars' AND
            auth.role() = 'authenticated'
        );

    CREATE POLICY "Users can update their own avatars"
        ON storage.objects 
        FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'avatars' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );

    CREATE POLICY "Users can delete their own avatars"
        ON storage.objects 
        FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'avatars' AND
            auth.uid()::text = (storage.foldername(name))[1]
        );

    -- Admin policy for avatars
    CREATE POLICY "Admins can manage all avatars"
        ON storage.objects 
        FOR ALL
        TO authenticated
        USING (
            bucket_id = 'avatars' AND
            EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_admin = true
            )
        );
    
    -- Add a notice to remind about admin setup
    RAISE NOTICE 'Database setup complete. To make a user an admin, run: SELECT public.init_admin(''your-email@example.com'');';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Admin Functions
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user ID from the email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update profile role
    UPDATE public.profiles
    SET role = 'ADMIN'
    WHERE id = target_user_id;
    
    -- Add to admin_users table
    INSERT INTO public.admin_users (user_id, is_admin)
    VALUES (target_user_id, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize an admin user (useful for first setup)
CREATE OR REPLACE FUNCTION public.init_admin(admin_email TEXT)
RETURNS void AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find the user ID from the email
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', admin_email;
    END IF;
    
    -- Insert into admin_users
    INSERT INTO public.admin_users (user_id, is_admin)
    VALUES (user_id, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET is_admin = TRUE;
    
    -- Update profile role
    UPDATE public.profiles
    SET role = 'ADMIN'
    WHERE id = user_id;
    
    RAISE NOTICE 'User % has been made an admin', admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Profile Functions
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

-- 6. Storage Functions
CREATE OR REPLACE FUNCTION storage.create_bucket(bucket_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = bucket_name
    ) INTO bucket_exists;
    
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the setup function
SELECT public.setup_database();

-- Show completion message
DO $$
BEGIN
  RAISE NOTICE '======================================';
  RAISE NOTICE 'SQL setup complete!';
  RAISE NOTICE 'To make yourself an admin, run:';
  RAISE NOTICE 'SELECT public.init_admin(''your-email@example.com'');';
  RAISE NOTICE '======================================';
END $$; 