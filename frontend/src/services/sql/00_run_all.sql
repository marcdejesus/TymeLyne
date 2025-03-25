-- Main SQL file to run all the components
-- This helps troubleshoot by running each part separately

-- First, ensure we have the necessary extensions
\i sql/01_init_extensions.sql

-- Create function to handle new user signup
\i sql/02_user_trigger.sql

-- Setup database function
\i sql/03_setup_database.sql

-- Admin functions
\i sql/04_admin_functions.sql

-- Profile functions
\i sql/05_profile_functions.sql

-- Storage functions
\i sql/06_storage_functions.sql

-- Execute the setup function to configure the database
SELECT public.setup_database();

-- Add notice to remind about making the first user an admin
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete. To make a user an admin, run: SELECT public.init_admin(''your-email@example.com'');';
END $$; 