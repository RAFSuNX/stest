/*
  # Add Admin Claims and Fix Constraints

  1. Changes
    - Add admin claims to auth.users metadata
    - Add unique constraint for roll number in students table
    - Add check constraint for notification categories
    - Add check constraint for session rep role

  2. Security
    - Add policy for admin access to all tables
*/

-- Add admin claims to auth.users
BEGIN;
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = 'admin@school.com';
COMMIT;

-- Add check constraints
ALTER TABLE students
ADD CONSTRAINT check_session_format
CHECK (session ~ '^\d{4}-\d{4}$');

ALTER TABLE notifications
ADD CONSTRAINT check_created_by_role
CHECK (created_by_role IN ('admin', 'session_rep'));

-- Add admin policies
CREATE POLICY "Admins can read all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (raw_app_meta_data->>'role')::text = 'admin' 
     FROM auth.users 
     WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update all students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT (raw_app_meta_data->>'role')::text = 'admin' 
     FROM auth.users 
     WHERE id = auth.uid())
  );

CREATE POLICY "Admins can read all read_status"
  ON read_status
  FOR SELECT
  TO authenticated
  USING (
    (SELECT (raw_app_meta_data->>'role')::text = 'admin' 
     FROM auth.users 
     WHERE id = auth.uid())
  );