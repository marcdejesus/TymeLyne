# TymeLyne

A time management and goal tracking application built with React Native, Django, and Supabase.

## Project Structure

- `frontend`: React Native application using Expo
- `backend`: Django REST Framework API

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- Supabase account
- PostgreSQL

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file with the following variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```
npm start
```

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Create a `.env` file with the following variables:
```
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

6. Run migrations:
```
python manage.py migrate
```

7. Create a superuser:
```
python manage.py createsuperuser
```

8. Start the development server:
```
python manage.py runserver
```

### Supabase Setup

1. Create a new Supabase project at https://app.supabase.io

2. Get your project URL and anon key from the API settings

3. Enable Email Authentication in Authentication > Providers

4. Set up the email confirmation template in Authentication > Email Templates

5. **IMPORTANT: Run the SQL script in the Supabase SQL Editor**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the entire SQL script from `frontend/src/services/supabase.sql` 
   - Click "Run" to execute the script
   - This script creates tables, functions, and sets up Row Level Security (RLS) policies
   - **Use your admin account when executing this script** - regular users don't have permission to create tables or modify RLS policies

6. **Row Level Security (RLS) Policies and RPC Functions**
   The SQL script creates the following important components:
   
   - **Profiles Table**: Stores user profile information
   - **RLS Policies for Profiles**:
     - Users can view/edit their own profile
     - Admins can view/edit all profiles
   
   - **Avatars Storage Bucket**: For storing user profile images
   - **RLS Policies for Storage**:
     - Public access for viewing avatars
     - Authenticated users can upload to avatars bucket
     - Users can update/delete only their own avatars
     - Admins can manage all avatars
   
   - **RPC Functions to Bypass RLS**:
     - `setup_database()`: Master function that sets up everything
     - `update_profile()`: Update user profile details
     - `update_avatar_url()`: Update just the avatar URL
     - `make_user_admin()`: Promote a user to admin
     - `create_bucket()`: Create a storage bucket

   These functions use `SECURITY DEFINER` to bypass RLS policies, allowing operations that would otherwise be blocked due to permissions.

7. Get your JWT secret for authentication:
   - Go to Settings > API > JWT Settings
   - Copy the JWT Secret
   - Add this to your backend `.env` file as `SUPABASE_JWT_SECRET`

## Troubleshooting

### "RLS policy violation" errors

If you encounter "row violates row-level security policy" errors:

1. **Option 1: Run the SQL Script as Admin (Recommended)**
   - Go to the Supabase SQL Editor (as an admin user)
   - Copy and paste the entire SQL script from `frontend/src/services/supabase.sql`
   - Click "Run" to execute all statements 
   - The script will create RPC functions that bypass RLS

2. **Option 2: Use the "Fix Database Issues" Button**
   - In the app, go to the Profile screen
   - Click the "Fix Database Issues" button
   - This will call the `setup_database()` RPC function

3. **Option 3: Use the "Make Me Admin" Button**
   - In the app, go to the Profile screen
   - Click the "Make Me Admin" button
   - This will promote your user to have admin privileges
   - Admin users have extended permissions in the app

4. **Understanding RPC Functions**
   The app now uses RPC functions to bypass RLS where needed:
   - Profile updates use `update_profile()` RPC function
   - Avatar updates use `update_avatar_url()` RPC function
   - Database setup uses `setup_database()` RPC function

### If All Else Fails: Temporary RLS Disable (DEVELOPMENT ONLY)

```sql
-- WARNING: Only use in development, NEVER in production
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS when done testing:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### "relation 'public.profiles' does not exist" error

This error occurs when the profiles table hasn't been created in Supabase. Run the SQL script in `frontend/src/services/supabase.sql` in the Supabase SQL Editor.

### "Email not confirmed" error

When signing up, users need to confirm their email address. Check your Supabase authentication settings to ensure email confirmation is enabled and templates are set up correctly.

## Features

- User authentication with email/password
- User profiles with avatars
- Goal tracking
- Task management
- Responsive design for mobile devices