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
  register: (student: Omit<Student, 'id' | 'createdAt' | 'approvalStatus'>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStudentRole: (studentId: string, isSessionRep: boolean) => Promise<void>;
  updateStudentApproval: (studentId: string, status: 'approved' | 'rejected') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthStateChange = async (session: any) => {
    try {
      if (session?.user) {
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
          setStudent(null);
        } else {
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (studentData) {
            if (studentData.approval_status === 'approved') {
              setUser({
                id: session.user.id,
                role: studentData.is_session_rep ? 'session_rep' : 'student',
                session: studentData.session
              });
            } else {
              setUser(null);
            }
            setStudent(studentData);
            setAdmin(null);
          }
        }
      } else {
        setUser(null);
        setStudent(null);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error handling auth state:', error);
      setUser(null);
      setStudent(null);
      setAdmin(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthStateChange(session);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStudent(null);
        setAdmin(null);
      } else {
        await handleAuthStateChange(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (rollNumber: string, password: string): Promise<boolean> => {
    try {
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${rollNumber}@school.com`,
        password
      });

      if (signInError || !authUser) {
        return false;
      }

      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!studentData) {
        await supabase.auth.signOut();
        return false;
      }

      if (studentData.approval_status === 'approved') {
        setUser({
          id: authUser.id,
          role: studentData.is_session_rep ? 'session_rep' : 'student',
          session: studentData.session
        });
      }
      setStudent(studentData);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !authUser) {
        return false;
      }

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

  const register = async (studentData: Omit<Student, 'id' | 'createdAt' | 'approvalStatus'>): Promise<boolean> => {
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email: `${studentData.rollNumber}@school.com`,
        password: studentData.password
      });

      if (signUpError || !authUser) {
        return false;
      }

      const { error: insertError } = await supabase
        .from('students')
        .insert({
          id: authUser.id,
          roll_number: studentData.rollNumber,
          full_name: studentData.fullName,
          session: studentData.session,
          is_session_rep: false,
          approval_status: 'pending'
        });

      if (insertError) {
        return false;
      }

      setStudent({
        id: authUser.id,
        ...studentData,
        createdAt: new Date().toISOString(),
        isSessionRep: false,
        approvalStatus: 'pending'
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

  const updateStudentApproval = async (studentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ approval_status: status })
        .eq('id', studentId);

      if (error) {
        throw error;
      }

      if (student?.id === studentId) {
        setStudent(prev => prev ? { ...prev, approvalStatus: status } : null);
        if (status === 'approved') {
          setUser({
            id: studentId,
            role: student.isSessionRep ? 'session_rep' : 'student',
            session: student.session
          });
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error updating student approval:', error);
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
      updateStudentRole,
      updateStudentApproval
    }}>
      {children}
    </AuthContext.Provider>
  );
};