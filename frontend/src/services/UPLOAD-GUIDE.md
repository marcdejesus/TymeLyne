# Profile Picture Upload Guide

This guide provides instructions on properly configuring Supabase to handle profile picture uploads.

## Prerequisites

1. Supabase project with authentication and storage enabled
2. Proper RLS (Row Level Security) policies in place

## Required SQL Functions

The following SQL functions must be configured in your Supabase instance:

### 1. Create Avatars Bucket Function

```sql
CREATE OR REPLACE FUNCTION public.create_avatars_bucket(
  bucket_name text DEFAULT 'avatars',
  public_access boolean DEFAULT true
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_id text;
BEGIN
  -- Check if bucket already exists
  SELECT id INTO bucket_id FROM storage.buckets WHERE id = bucket_name;
  
  -- If bucket doesn't exist, create it
  IF bucket_id IS NULL THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection)
    VALUES (bucket_name, bucket_name, public_access, false)
    RETURNING id INTO bucket_id;
    
    -- Return success message
    RETURN 'Bucket ' || bucket_id || ' created successfully';
  ELSE
    -- Bucket already exists, update its settings
    UPDATE storage.buckets
    SET 
      public = public_access
    WHERE id = bucket_name;
    
    -- Return info message
    RETURN 'Bucket ' || bucket_id || ' already exists, updated settings';
  END IF;
END;
$$;
```

### 2. Update MIME Types Function

```sql
CREATE OR REPLACE FUNCTION public.update_avatars_mime_types(
  mime_types text[] DEFAULT ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
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
```

### 3. Reset Storage Policies Function

```sql
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
```

### 4. Update Avatar URL Function

```sql
CREATE OR REPLACE FUNCTION public.update_avatar_url(
  user_id UUID,
  new_avatar_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Check if the user exists in the profiles table
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = user_id
  ) INTO profile_exists;
  
  -- If the profile doesn't exist, create it
  IF NOT profile_exists THEN
    INSERT INTO profiles (id, avatar_url, created_at, updated_at)
    VALUES (
      user_id,
      new_avatar_url,
      NOW(),
      NOW()
    );
    
    result := jsonb_build_object(
      'success', TRUE,
      'message', 'Created new profile with avatar URL',
      'avatar_url', new_avatar_url
    );
  ELSE
    -- Update the existing profile's avatar URL
    UPDATE profiles
    SET 
      avatar_url = new_avatar_url,
      updated_at = NOW()
    WHERE id = user_id;
    
    result := jsonb_build_object(
      'success', TRUE,
      'message', 'Updated avatar URL',
      'avatar_url', new_avatar_url
    );
  END IF;
  
  RETURN result;
END;
$$;
```

## Step-by-Step Setup

1. **Create the 'avatars' Bucket**:
   ```sql
   SELECT public.create_avatars_bucket('avatars', true);
   ```

2. **Configure MIME Types**:
   ```sql
   SELECT public.update_avatars_mime_types(ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
   ```

3. **Set up Storage Policies**:
   ```sql
   SELECT public.reset_storage_policies();
   ```

## Troubleshooting

If you encounter upload issues:

1. **Check that the bucket exists**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```

2. **Verify MIME types are set correctly**:
   ```sql
   SELECT allowed_mime_types FROM storage.buckets WHERE id = 'avatars';
   ```

3. **Verify storage policies exist**:
   ```sql
   SELECT * FROM storage.policies WHERE table_name = 'objects';
   ```

4. **Check for errors in browser console or app logs**:
   Common errors include MIME type mismatches, policy issues, or network problems.

## Additional Tips

1. Use `FormData` for uploads from the client
2. Include proper error handling in your application
3. Provide user feedback during upload process
4. Verify file size limits are appropriate
5. Consider image compression for large files 