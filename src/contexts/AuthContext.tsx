import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Admin } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  admin: Admin | null;
  loading: boolean;
  login: (rollNumber: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  register: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStudentRole: (studentId: string, isSessionRep: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // First check if user is an admin
          const { data: claims } = await supabase.rpc('get_claims', {
            uid: session.user.id
          });

          if (claims?.role === 'admin') {
            setUser({
              id: session.user.id,
              role: 'admin'
            });
            setAdmin({
              id: session.user.id,
              email: session.user.email!
            });
          } else {
            // If not admin, check if student
            const { data: studentData, error: studentError } = await supabase
              .from('students')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!studentError && studentData) {
              setUser({
                id: session.user.id,
                role: studentData.is_session_rep ? 'session_rep' : 'student',
                session: studentData.session
              });
              setStudent(studentData);
            } else {
              // If no student data found, sign out
              await supabase.auth.signOut();
              setUser(null);
              setStudent(null);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // On error, clear auth state
        setUser(null);
        setStudent(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStudent(null);
        setAdmin(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (rollNumber: string, password: string): Promise<boolean> => {
    try {
      // First get the student's email using roll number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', rollNumber)
        .maybeSingle();

      if (studentError || !studentData) {
        return false;
      }

      // Sign in with email/password
      const { error } = await supabase.auth.signInWithPassword({
        email: `${rollNumber}@school.com`, // Using roll number as email
        password
      });

      if (error) {
        return false;
      }

      setUser({
        id: studentData.id,
        role: studentData.is_session_rep ? 'session_rep' : 'student',
        session: studentData.session
      });
      setStudent(studentData);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return false;
      }

      // Check if user has admin role in Supabase
      const { data: claims } = await supabase.rpc('get_claims', {
        uid: authUser.id
      });

      if (claims?.role !== 'admin') {
        await supabase.auth.signOut();
        return false;
      }

      setUser({
        id: authUser.id,
        role: 'admin'
      });
      
      setAdmin({
        id: authUser.id,
        email: authUser.email!
      });

      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const register = async (studentData: Omit<Student, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Check if roll number already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('roll_number')
        .eq('roll_number', studentData.rollNumber)
        .maybeSingle();

      if (checkError || existingStudent) {
        return false;
      }

      // Create auth user
      const { error: signUpError, data: { user: newUser } } = await supabase.auth.signUp({
        email: `${studentData.rollNumber}@school.com`,
        password: studentData.password
      });

      if (signUpError || !newUser) {
        throw signUpError;
      }

      // Create student record
      const { error: insertError } = await supabase
        .from('students')
        .insert({
          id: newUser.id,
          roll_number: studentData.rollNumber,
          full_name: studentData.fullName,
          session: studentData.session,
          is_session_rep: false
        });

      if (insertError) {
        throw insertError;
      }

      setUser({
        id: newUser.id,
        role: 'student',
        session: studentData.session
      });

      setStudent({
        id: newUser.id,
        ...studentData,
        createdAt: new Date().toISOString(),
        isSessionRep: false
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateStudentRole = async (studentId: string, isSessionRep: boolean) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_session_rep: isSessionRep })
        .eq('id', studentId);

      if (error) {
        throw error;
      }

      // Update local state if this is the current user
      if (student?.id === studentId) {
        setStudent(prev => prev ? { ...prev, isSessionRep } : null);
        setUser(prev => prev ? {
          ...prev,
          role: isSessionRep ? 'session_rep' : 'student'
        } : null);
      }
    } catch (error) {
      console.error('Error updating student role:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setStudent(null);
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      student, 
      admin,
      loading, 
      login, 
      adminLogin,
      register, 
      logout,
      updateStudentRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};