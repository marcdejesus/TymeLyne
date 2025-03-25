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

1. Create a new Supabase project at https://supabase.io

2. Get your project URL and anon key from the API settings

3. Enable Email Authentication in Authentication > Providers

4. Set up the email confirmation template in Authentication > Email Templates

5. Run the SQL script in `frontend/src/services/supabase.sql` in the Supabase SQL Editor to create the necessary tables and functions

6. Create Storage buckets:
   - Create a bucket named "avatars" with public access

7. Get your JWT secret for authentication:
   - Go to Settings > API > JWT Settings
   - Copy the JWT Secret
   - Add this to your backend `.env` file as `SUPABASE_JWT_SECRET`

## Troubleshooting

### "relation "public.profiles" does not exist"

This error occurs when the profiles table hasn't been created in Supabase. Run the SQL script in `frontend/src/services/supabase.sql` in the Supabase SQL Editor.

### "Email not confirmed" error

When signing up, users need to confirm their email address. Check your Supabase authentication settings to ensure email confirmation is enabled and templates are set up correctly.

## Features

- User authentication with email/password
- User profiles with avatars
- Goal tracking
- Task management
- Responsive design for mobile devices