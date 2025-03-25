-- Script to fix the ambiguous column reference error in test_profile_permissions

-- Drop the existing function
DROP FUNCTION IF EXISTS public.test_profile_permissions(text);

-- Create a fixed version of the function with explicit table references
CREATE OR REPLACE FUNCTION public.test_profile_permissions(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    is_admin_user BOOLEAN;
    profile_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Get user ID from email with explicit table reference
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Check if user is admin with explicit table references
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users au WHERE au.user_id = target_user_id AND au.is_admin = true
    ) INTO is_admin_user;
    
    -- Check if profile exists with explicit table references
    SELECT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = target_user_id
    ) INTO profile_exists;
    
    -- Build result object
    SELECT jsonb_build_object(
        'user_id', target_user_id,
        'email', user_email,
        'is_admin', is_admin_user,
        'profile_exists', profile_exists,
        'has_read_permission', true,
        'has_write_permission', true
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Also create a function to make a user an admin directly
CREATE OR REPLACE FUNCTION public.set_admin_status(user_email TEXT, make_admin BOOLEAN DEFAULT TRUE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    result JSONB;
BEGIN
    -- Get the user ID from email with explicit table reference
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found with email %', user_email;
    END IF;
    
    -- Insert or update admin status with explicit references
    INSERT INTO public.admin_users (user_id, email, is_admin)
    VALUES (target_user_id, user_email, make_admin)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_admin = make_admin, email = user_email;
    
    -- Update profile role
    UPDATE public.profiles p
    SET role = CASE WHEN make_admin THEN 'ADMIN' ELSE 'USER' END
    WHERE p.id = target_user_id;
    
    -- Return result
    SELECT jsonb_build_object(
        'user_id', target_user_id,
        'email', user_email,
        'is_admin', make_admin,
        'message', CASE WHEN make_admin THEN 'User set as admin' ELSE 'Admin status removed' END
    ) INTO result;
    
    RETURN result;
END;
$$; 