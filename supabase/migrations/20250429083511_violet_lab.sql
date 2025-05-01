/*
  # Initial Schema Setup for School Notification System

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `roll_number` (text, unique)
      - `full_name` (text)
      - `session` (text)
      - `is_session_rep` (boolean)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (enum: important, academic, general)
      - `target_sessions` (text array)
      - `created_by_id` (uuid, references auth.users)
      - `created_by_role` (text)
      - `created_by_session` (text)
      - `created_at` (timestamp)
    
    - `read_status`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references auth.users)
      - `notification_id` (uuid, references notifications)
      - `read_at` (timestamp)

  2. Types
    - `notification_category` enum for notification categories

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create notification category enum
CREATE TYPE notification_category AS ENUM ('important', 'academic', 'general');

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  roll_number text UNIQUE NOT NULL,
  full_name text NOT NULL,
  session text NOT NULL,
  is_session_rep boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category notification_category NOT NULL,
  target_sessions text[] NOT NULL,
  created_by_id uuid NOT NULL REFERENCES auth.users(id),
  created_by_role text NOT NULL,
  created_by_session text,
  created_at timestamptz DEFAULT now()
);

-- Create read_status table
CREATE TABLE IF NOT EXISTS read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id),
  notification_id uuid NOT NULL REFERENCES notifications(id),
  read_at timestamptz DEFAULT now(),
  UNIQUE(student_id, notification_id)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_status ENABLE ROW LEVEL SECURITY;

-- Policies for students table
CREATE POLICY "Students can read their own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for notifications table
CREATE POLICY "Anyone can read notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and session reps can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid()
      AND (is_session_rep = true OR created_by_role = 'admin')
    )
  );

-- Policies for read_status table
CREATE POLICY "Students can read their own read status"
  ON read_status
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can mark notifications as read"
  ON read_status
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());