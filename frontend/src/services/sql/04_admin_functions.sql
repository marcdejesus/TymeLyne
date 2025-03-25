-- Function to update an existing user's role to ADMIN
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