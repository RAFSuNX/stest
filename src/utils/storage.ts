import { supabase } from '../lib/supabase';
import { Student, Admin, Notification, ReadStatus, User } from '../types';

export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
};

export const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .insert([notification]);

  if (error) {
    console.error('Error adding notification:', error);
    return false;
  }

  return true;
};

export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return data || [];
};

export const markNotificationAsRead = async (studentId: string, notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('read_status')
    .insert([
      { student_id: studentId, notification_id: notificationId }
    ]);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getReadStatusesForStudent = async (studentId: string): Promise<ReadStatus[]> => {
  const { data, error } = await supabase
    .from('read_status')
    .select('*')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching read statuses:', error);
    return [];
  }

  return data || [];
};

export const isNotificationRead = async (studentId: string, notificationId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('read_status')
    .select('*')
    .eq('student_id', studentId)
    .eq('notification_id', notificationId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
};

export const getNotificationsForSession = async (session: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`target_sessions.cs.{${session}},target_sessions.cs.{all}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications for session:', error);
    return [];
  }

  return data || [];
};