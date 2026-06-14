-- This script sets up niveaseby@gmail.com as an admin user
-- Run this after the user has registered, or use it to manually set admin status

-- Option 1: Set admin status for a specific email (run after user registers)
UPDATE public.user_profiles
SET is_admin = TRUE
WHERE email = 'niveaseby@gmail.com';

-- Option 2: If you want to create the user directly in auth.users (requires password hash)
-- Note: This is complex and requires proper password hashing. 
-- It's easier to have the user sign up normally, then run the UPDATE above.

-- Verify the admin was set up correctly
SELECT id, email, full_name, is_admin
FROM public.user_profiles
WHERE email = 'niveaseby@gmail.com';
