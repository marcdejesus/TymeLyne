-- Create function to handle new user signup
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