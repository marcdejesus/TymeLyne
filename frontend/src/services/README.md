# Supabase SQL Scripts

This directory contains SQL scripts for setting up the Supabase database and Row Level Security (RLS) policies.

## How to Use

### Option 1: Run the Original Single Script

The simplest approach is to run the original `supabase.sql` file in the Supabase SQL Editor:

1. Go to the [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `supabase.sql` or upload the file
6. Run the query

### Option 2: Run the Quick Fix Script

If you're experiencing issues with updating profiles or uploading avatars:

1. Go to the Supabase SQL Editor
2. Create a new query
3. Copy and paste the contents of `sql/quick_fix.sql` or upload the file
4. Run the query

This script will:
- Reset all storage policies to be more permissive
- Simplify profile access policies to avoid recursion issues
- Create RPC functions that bypass RLS for direct profile updates
- Create the avatars bucket if it doesn't exist

This is the fastest way to fix common RLS issues without running the complete setup script.

### Option 3: Run the Complete Reset Script

If you're experiencing "Policy already exists" errors or want to start fresh:

1. Go to the Supabase SQL Editor
2. Create a new query
3. Copy and paste the contents of `sql/run_all_with_drop.sql` or upload the file
4. Run the query

This script will:
- Drop all existing policies, functions, and triggers
- Recreate everything from scratch
- Set up all necessary tables and RLS policies
- Run the `setup_database()` function

### Option 4: Run Individual Scripts

For more granular control or debugging, you can run each file individually in the Supabase SQL Editor:

1. `sql/01_init_extensions.sql` - Sets up required extensions
2. `sql/02_user_trigger.sql` - Creates the user creation trigger
3. `sql/03_setup_database.sql` - Creates tables and RLS policies
4. `sql/04_admin_functions.sql` - Functions for admin management
5. `sql/05_profile_functions.sql` - Functions for profile management
6. `sql/06_storage_functions.sql` - Functions for storage management
7. Finally, run: `SELECT public.setup_database();`

After running all the scripts, make yourself an admin by running:

```sql
SELECT public.init_admin('your-email@example.com');
```

> **Note**: The `00_run_all.sql` file uses `\i` commands which work in PostgreSQL but might not work in the Supabase SQL Editor. If you encounter issues, use `run_all_with_drop.sql` instead.

## Troubleshooting

### "Policy already exists" error

If you see an error like:
```
ERROR: 42710: policy "Everyone can read admin_users" for table "admin_users" already exists
```

This means you've already run the setup script before. Use the `sql/run_all_with_drop.sql` script which will clear everything first.

### Issues Updating Profile or Avatar

If you can't update your profile or avatar, try running the `sql/quick_fix.sql` script, which creates special RPC functions that bypass RLS. After running this script, you should also click the "Fix Database" button in the Profile screen to reset policies and make yourself an admin.

### RLS Policy Issues

If you're having issues with Row Level Security policies:

1. Make sure you're running the scripts as the `postgres` user (or a user with admin privileges)
2. Verify that your user has been added to the `admin_users` table:
```sql
SELECT * FROM public.admin_users WHERE user_id = auth.uid();
```
3. Make yourself an admin directly:
```sql
-- Make yourself an admin by your email
SELECT public.init_admin('your-email@example.com');

-- Or use the direct_update_profile function with real values
SELECT public.direct_update_profile('your-email@example.com', 'Your Name', 'Your Bio');
```

### Testing the Setup

After running the scripts, you can verify everything is working by:

1. Creating a new user through the Supabase Auth UI or API
2. Verifying that a profile was automatically created
3. Checking that the RLS policies are enforced correctly (users can only see their own profiles)
4. Verifying that admins can see all profiles 