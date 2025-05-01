// Storage utility functions to handle data persistence
import { Student, Admin, Notification, ReadStatus, User } from '../types';

// Initialize storage with sample data if empty
const initializeStorage = () => {
  if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('admins')) {
    localStorage.setItem('admins', JSON.stringify([
      {
        id: 'admin1',
        username: 'admin',
        password: 'admin123' // In a real app, this would be hashed
      }
    ]));
  }
  
  if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('readStatus')) {
    localStorage.setItem('readStatus', JSON.stringify([]));
  }
};

// Student-related storage functions
export const getStudents = (): Student[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('students') || '[]');
};

export const addStudent = (student: Student): void => {
  const students = getStudents();
  students.push(student);
  localStorage.setItem('students', JSON.stringify(students));
};

export const updateStudent = (updatedStudent: Student): void => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = updatedStudent;
    localStorage.setItem('students', JSON.stringify(students));
  }
};

export const getStudentById = (id: string): Student | undefined => {
  const students = getStudents();
  return students.find(student => student.id === id);
};

export const getStudentByRollNumber = (rollNumber: string): Student | undefined => {
  const students = getStudents();
  return students.find(student => student.rollNumber === rollNumber);
};

export const getStudentsBySession = (session: string): Student[] => {
  const students = getStudents();
  return students.filter(student => student.session === session);
};

// Admin-related storage functions
export const getAdmins = (): Admin[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('admins') || '[]');
};

export const getAdminByUsername = (username: string): Admin | undefined => {
  const admins = getAdmins();
  return admins.find(admin => admin.username === username);
};

// Notification-related storage functions
export const getNotifications = (): Notification[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('notifications') || '[]');
};

export const addNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

export const getNotificationById = (id: string): Notification | undefined => {
  const notifications = getNotifications();
  return notifications.find(notification => notification.id === id);
};

export const getNotificationsForSession = (session: string): Notification[] => {
  const notifications = getNotifications();
  return notifications.filter(notification => 
    notification.targetSessions.includes(session) || 
    notification.targetSessions.includes('all')
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Read status related storage functions
export const getReadStatuses = (): ReadStatus[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem('readStatus') || '[]');
};

export const markNotificationAsRead = (studentId: string, notificationId: string): void => {
  const readStatuses = getReadStatuses();
  
  // Check if already marked as read
  const alreadyRead = readStatuses.some(
    status => status.studentId === studentId && status.notificationId === notificationId
  );
  
  if (!alreadyRead) {
    readStatuses.push({
      studentId,
      notificationId,
      readAt: new Date().toISOString()
    });
    
    localStorage.setItem('readStatus', JSON.stringify(readStatuses));
  }
};

export const getReadStatusesForStudent = (studentId: string): ReadStatus[] => {
  const readStatuses = getReadStatuses();
  return readStatuses.filter(status => status.studentId === studentId);
};

export const isNotificationRead = (studentId: string, notificationId: string): boolean => {
  const readStatuses = getReadStatuses();
  return readStatuses.some(
    status => status.studentId === studentId && status.notificationId === notificationId
  );
};

// Current user session management
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};