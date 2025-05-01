// Define core types for the application
export interface Student {
  id: string;
  rollNumber: string;
  fullName: string;
  session: string;
  password: string;
  createdAt: string;
  isSessionRep?: boolean; // New field to mark session representatives
}

export interface Admin {
  id: string;
  username: string;
  password: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  category: 'important' | 'academic' | 'general';
  createdAt: string;
  targetSessions: string[]; // Target specific sessions
  createdBy: {
    id: string;
    role: 'admin' | 'session_rep';
    session?: string; // Session for session representatives
  };
}

export interface ReadStatus {
  studentId: string;
  notificationId: string;
  readAt: string;
}

export interface User {
  id: string;
  role: 'student' | 'admin' | 'session_rep';
  session?: string; // Session for session representatives
}