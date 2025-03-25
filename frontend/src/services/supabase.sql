-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'PREMIUM')) DEFAULT 'USER',
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proper RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Add policies
-- Allow users to view any profile
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Create function to create the profiles table with SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_profiles_table() 
RETURNS VOID 
SECURITY DEFINER -- This bypasses RLS
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER', 'PREMIUM')) DEFAULT 'USER',
            full_name TEXT,
            avatar_url TEXT,
            bio TEXT,
            date_of_birth DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create RLS policies
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Add policies
        -- Allow users to view any profile
        CREATE POLICY "Public profiles are viewable by everyone"
        ON public.profiles
        FOR SELECT USING (true);

        -- Allow users to insert their own profile
        CREATE POLICY "Users can insert own profile"
        ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

        -- Allow users to update their own profile
        CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This bypasses RLS
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        'USER',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket RLS policies
-- This needs to run from the SQL editor in Supabase dashboard

-- Enable storage bucket creation - using security definer function
CREATE OR REPLACE FUNCTION create_avatars_bucket()
RETURNS VOID
SECURITY DEFINER -- This bypasses RLS
AS $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('avatars', 'avatars', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif'])
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Call the function to create the bucket
SELECT create_avatars_bucket();

-- Storage RLS policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- Allow public access to avatar images
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload avatars to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 