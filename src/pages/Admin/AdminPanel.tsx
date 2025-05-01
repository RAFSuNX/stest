import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Users, Clock, BadgeAlert as Alert, UserPlus } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Student, Notification } from '../../types';
import CreateNotification from './CreateNotification';

const AdminPanel: React.FC = () => {
  const { user, admin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'students'>('notifications');
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch students
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        setNotifications(notificationsData || []);
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, loading, navigate]);
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      setNotifications(notificationsData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSessionRep = async (student: Student) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_session_rep: !student.isSessionRep })
        .eq('id', student.id);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error updating student role:', error);
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'important':
        return <Alert className="h-4 w-4 text-red-600" />;
      case 'academic':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'general':
        return <Bell className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'important':
        return 'bg-red-100 text-red-800';
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'general':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <Layout>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage notifications, students, and session representatives
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            {activeTab === 'notifications' && (
              <Button 
                onClick={() => setShowCreateNotification(true)} 
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Notification
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'students'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Students
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'notifications' ? (
            <div>
              {notifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target Sessions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '24rem' }}>
                              {notification.content}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(notification.category)}`}>
                              <span className="flex items-center">
                                {getCategoryIcon(notification.category)}
                                <span className="ml-1">{notification.category}</span>
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.targetSessions.includes('all') 
                              ? 'All Sessions' 
                              : notification.targetSessions.join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.createdBy.role === 'admin' 
                              ? 'Admin'
                              : `Session Rep (${notification.createdBy.session})`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new notification.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={() => setShowCreateNotification(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Notification
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.rollNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.session}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {student.isSessionRep ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Session Representative
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Student
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button
                              variant={student.isSessionRep ? "outline" : "primary"}
                              size="sm"
                              onClick={() => handleToggleSessionRep(student)}
                              className="flex items-center"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {student.isSessionRep ? 'Remove Rep Role' : 'Make Session Rep'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students registered</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Students will appear here after they register.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showCreateNotification && (
        <CreateNotification 
          onClose={() => setShowCreateNotification(false)}
          onCreated={() => {
            refreshData();
            setShowCreateNotification(false);
          }}
        />
      )}
    </Layout>
  );
};

export default AdminPanel;