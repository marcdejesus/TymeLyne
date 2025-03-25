-- Function to update the allowed MIME types for the avatars bucket
CREATE OR REPLACE FUNCTION public.update_avatars_mime_types(mime_types text[] DEFAULT ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the existing avatars bucket with the specified MIME types
    UPDATE storage.buckets 
    SET allowed_mime_types = mime_types
    WHERE id = 'avatars';
    
    RETURN TRUE;
END;
$$;

-- Function to reset storage policies
CREATE OR REPLACE FUNCTION public.reset_storage_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar access" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar insert" ON storage.objects;
    DROP POLICY IF EXISTS "Individual user access" ON storage.objects;
    
    -- Create simple policies that just work
    CREATE POLICY "Public Avatar Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
    
    CREATE POLICY "Avatar Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated'
    );
    
    CREATE POLICY "Avatar Update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.role() = 'authenticated'
    );
    
    RETURN TRUE;
END;
$$;

-- Call these functions automatically to fix common issues
SELECT public.update_avatars_mime_types();
SELECT public.reset_storage_policies(); 