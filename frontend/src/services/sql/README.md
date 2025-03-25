# Supabase SQL Migrations

This directory contains modular SQL scripts for Supabase, separated to make troubleshooting easier.

## Directory Structure

- `00_run_all.sql` - Main file that includes all other scripts (may not work in Supabase SQL Editor)
- `01_init_extensions.sql` - PostgreSQL extensions setup
- `02_user_trigger.sql` - User creation trigger for auto-profile creation
- `03_setup_database.sql` - Tables, RLS setup, and policies
- `04_admin_functions.sql` - Admin-related functions
- `05_profile_functions.sql` - Profile management functions
- `06_storage_functions.sql` - Storage bucket management

## How to Run

### Running in Supabase SQL Editor

The `\i` commands in `00_run_all.sql` may not work directly in the Supabase SQL Editor. Instead:

1. Execute each script individually in numbered order
2. Run `SELECT public.setup_database();` after executing all scripts
3. Finally, make yourself an admin with `SELECT public.init_admin('your-email@example.com');`

### Running Locally with psql

If you have direct PostgreSQL access (not common with Supabase):

```bash
cd frontend/src/services
psql -h your-supabase-db-host -U postgres -d postgres -f sql/00_run_all.sql
```

## Common Errors

### Policy Already Exists

If you see:
```
ERROR: 42710: policy "Everyone can read admin_users" for table "admin_users" already exists
```

This happens when running scripts multiple times. Our scripts include `DROP POLICY IF EXISTS` statements to prevent this, but if you're still encountering issues:

```sql
DROP POLICY IF EXISTS "Everyone can read admin_users" ON public.admin_users;
```

### Function Issues

If you encounter function-related errors:

```sql
-- Drop all functions to start fresh
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.setup_database() CASCADE;
DROP FUNCTION IF EXISTS public.make_user_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_profile(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_avatar_url(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS storage.create_bucket(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_profile(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.init_admin(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_by_id(UUID) CASCADE;

-- Then run the scripts in order
```

## Testing

After setup, test with:

```sql
-- Check if your user is an admin
SELECT * FROM public.admin_users WHERE user_id = auth.uid();

-- Check if profiles table is properly set up
SELECT * FROM public.profiles LIMIT 5;

-- Test a profile update function
SELECT * FROM public.update_profile(auth.uid(), 'New Name', 'New Bio');
``` 