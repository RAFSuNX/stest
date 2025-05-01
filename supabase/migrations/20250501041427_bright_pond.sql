/*
  # Create Admin User

  1. Changes
    - Create admin user in auth.users table
    - Set admin role in user metadata
    - Grant necessary permissions
*/

-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'admin@school.com';

  -- If admin doesn't exist, create the user
  IF admin_uid IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@school.com',
      crypt('admin123', gen_salt('bf')), -- Default password: admin123
      NOW(),
      '{"role": "admin"}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- Update existing admin user's metadata if needed
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    WHERE id = admin_uid;
  END IF;
END $$;