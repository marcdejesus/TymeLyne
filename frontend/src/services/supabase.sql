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

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Create function to create the profiles table
CREATE OR REPLACE FUNCTION create_profiles_table() 
RETURNS VOID AS $$
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

        -- Public profiles are viewable by everyone
        CREATE POLICY "Public profiles are viewable by everyone"
        ON public.profiles
        FOR SELECT USING (true);

        -- Users can update their own profiles
        CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 