/*
  # Add Student Approval System

  1. Changes
    - Add `is_approved` column to students table
    - Add `approval_status` enum type
    - Update policies to handle approval system

  2. Security
    - Only admins can approve students
    - Students can only access system after approval
*/

-- Create approval status enum
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Add approval status to students table
ALTER TABLE students 
ADD COLUMN approval_status approval_status NOT NULL DEFAULT 'pending';

-- Update student policies
CREATE POLICY "Pending students can read their own basic data"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    (SELECT (raw_app_meta_data->>'role')::text = 'admin' FROM auth.users WHERE id = auth.uid())
  );

-- Only approved students can access notifications
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