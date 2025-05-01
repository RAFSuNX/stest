/*
  # Add Student Approval Column and Update Policies

  1. Changes
    - Add approval_status column to students table
    - Update notification access policy to require approval

  2. Security
    - Only approved students can access notifications
*/

-- Add approval status to students table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' 
    AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE students 
    ADD COLUMN approval_status approval_status NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Only approved students can read notifications" ON notifications;

CREATE POLICY "Only approved students can read notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM students 
      WHERE id = auth.uid() 
      AND approval_status = 'approved'
    ))
    OR
    (SELECT (raw_app_meta_data->>'role')::text = 'admin' FROM auth.users WHERE id = auth.uid())
  );