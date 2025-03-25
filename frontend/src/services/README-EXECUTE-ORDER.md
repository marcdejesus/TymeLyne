# Execute SQL Scripts in This Order

To fix the profile issues in your Supabase database, run the scripts in exactly this order:

## 1. First, Run the Fix for Existing Functions

This will drop all existing functions that might be causing conflicts:

```sql
-- Run fix_existing_functions.sql first
```

This script will:
- Drop all existing functions that might have different return types
- Create new versions of those functions with the correct return types

## 2. Next, Run the Quick Fix Script

```sql
-- Run quick_fix.sql next
```

This will:
- Reset storage policies
- Set up profile table policies
- Create the direct_update_profile function
- Create the avatars bucket

## 3. Finally, Run the Profile Sync Fix

```sql
-- Run profile_sync_fix.sql last
```

This will:
- Add functions to force sync profiles
- Check for missing profiles

## Important Notes

- If you run into errors about functions already existing, always run the `fix_existing_functions.sql` script first
- You don't need to run `missing_functions.sql` separately - all those functions are included in `fix_existing_functions.sql`
- After running all scripts, check if the "Fix Database Issues" button in the app now works properly
- If you still have issues, try directly making yourself an admin with this SQL:

```sql
SELECT public.make_user_admin('your-email@example.com');
```

- For image upload issues, you may need to manually set allowed MIME types:

```sql
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
WHERE id = 'avatars';
``` 