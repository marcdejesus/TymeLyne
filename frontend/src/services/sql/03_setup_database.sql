-- Create function to set up the entire database
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

    -- Delete existing policies
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 