# Quick Fix Guide for Profile Update Issues

If you're experiencing issues updating your profile (name, bio, or avatar), follow these steps to resolve the problems:

## Step 1: Run the Quick Fix SQL Scripts

1. Go to your [Supabase Dashboard](https://app.supabase.com/) and select your project
2. Navigate to the SQL Editor
3. Create a new query
4. First, run `frontend/src/services/sql/quick_fix.sql`
5. Then, run `frontend/src/services/sql/missing_functions.sql` to add all the helper functions
6. Finally, run `frontend/src/services/sql/profile_sync_fix.sql` to ensure profiles are in sync

When running the scripts, replace any email addresses (like `'your-email@example.com'`) with your actual email.

These scripts will:
- Reset all storage and profile policies
- Create a direct update function that bypasses RLS
- Create the avatars bucket with proper permissions
- Add all the missing helper functions needed by the app

## Step 2: Use the "Fix Database" Button in the App

1. Go to your profile screen in the app
2. Find and click the "Fix Database Issues" button
3. Wait for the process to complete
4. If successful, you should see a success toast message

## Step 3: Try Updating Your Profile Again

After completing the steps above, try updating your profile again:
1. Edit your name and bio
2. Click "Save Changes"
3. Try selecting a new avatar image

## Troubleshooting Image Upload Issues

If you're getting "invalid_mime_type" errors when uploading images:

1. The app will automatically fall back to using a local avatar. This is expected behavior when there are MIME type issues.

2. If you want to manually set an avatar URL, you can run this SQL:
   ```sql
   SELECT direct_update_profile('your-email@example.com', NULL, NULL, 'https://placekitten.com/200/200');
   ```

3. For future development, you may need to configure your storage bucket's MIME type settings:
   ```sql
   UPDATE storage.buckets 
   SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
   WHERE id = 'avatars';
   ```

## Troubleshooting Profile Synchronization Issues

If your profile updates appear to be saved in the database (visible in the Supabase dashboard) but aren't showing in the app:

1. **Force Profile Sync**: Run the sync script:
   ```sql
   SELECT * FROM public.force_sync_profile('your-email@example.com');
   ```

2. **Check for Missing Profiles**:
   ```sql
   SELECT * FROM public.check_missing_profiles();
   ```

3. **Fix Function Name Issue**: If you see errors about missing functions, ensure you've run the `missing_functions.sql` script.

4. **Force Profile Refresh in App**: 
   - Log out and log back in
   - Or click the "Fix Database Issues" button to force a profile refresh

## Troubleshooting

If you're still experiencing issues:

### Function Not Found Errors

If you see errors like "Could not find the function" in your logs, run the missing functions SQL script:

```sql
-- Copy the contents of missing_functions.sql here
```

### If You Can't Save Your Profile

Try updating it directly through SQL:

```sql
SELECT direct_update_profile('your-email@example.com', 'Your Name', 'Your Bio');
```

### If You Can't Upload an Avatar

Try these steps:
1. Check if the avatars bucket exists:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```

2. If it doesn't exist, create it:
   ```sql
   SELECT public.create_avatars_bucket('avatars', true);
   ```

3. Try using the direct update function to set a placeholder URL:
   ```sql
   SELECT direct_update_profile('your-email@example.com', NULL, NULL, 'https://placekitten.com/200/200');
   ```

### If You're Not an Admin

Make yourself an admin:
```sql
SELECT public.make_user_admin('your-email@example.com');
```

## Understanding What Went Wrong

The issues were caused by:

1. **Infinite Recursion in RLS Policies**: The Row Level Security policies were referencing the same tables they were protecting, causing circular references.

2. **Missing Storage Permissions**: The storage bucket policies were not properly set up to allow users to upload files.

3. **Row Level Security Complexity**: The policies were too complex and contained bugs that prevented proper access.

4. **Profile Sync Issues**: Updates to profiles might not be properly reflected in the app, even when the database is correctly updated.

5. **Function Name Mismatch**: The code was calling functions that didn't exist in the database.

6. **MIME Type Issues**: Image uploads may fail due to MIME type validation issues in Supabase Storage.

The quick fix simplifies these policies and provides bypass functions to ensure you can always update your profile regardless of policy issues.

## Prevention For Future Development

When working with Supabase Row Level Security:

1. Avoid referencing a table within its own policy
2. Test policies thoroughly before deployment
3. Create SECURITY DEFINER functions for critical operations
4. Always create a backdoor admin function for emergency fixes
5. Keep function names consistent between SQL and application code
6. Be careful with MIME types in file uploads, especially in React Native

Remember that all these fixes are temporary - in a production environment, you would want to implement proper RLS policies after fixing the immediate issues. 