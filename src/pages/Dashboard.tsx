import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import Layout from '../components/layout/Layout';
import NotificationList from '../components/notifications/NotificationList';
import { useAuth } from '../contexts/AuthContext';
import { getNotificationsForSession, getReadStatusesForStudent } from '../utils/storage';
import { Notification, ReadStatus } from '../types';

const Dashboard: React.FC = () => {
  const { user, student, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    if (student) {
      // Load notifications for this student's session
      const sessionNotifications = getNotificationsForSession(student.session);
      setNotifications(sessionNotifications);
      
      // Load read statuses for this student
      const studentReadStatuses = getReadStatusesForStudent(user!.id);
      setReadStatuses(studentReadStatuses);
    }
  }, [user, student, loading, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!student) {
    return null; // Redirect happens in useEffect
  }
  
  const unreadCount = notifications.length - readStatuses.length;
  
  return (
    <Layout>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {student.fullName}!
        </h1>
        <p className="text-gray-600">
          Roll Number: {student.rollNumber} | Session: {student.session}
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Notifications</h2>
          
          <div className="flex items-center">
            {unreadCount > 0 ? (
              <div className="flex items-center text-blue-600">
                <Bell className="h-5 w-5 mr-1" />
                <span>{unreadCount} unread</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <BellOff className="h-5 w-5 mr-1" />
                <span>All caught up</span>
              </div>
            )}
          </div>
        </div>
        
        <NotificationList 
          notifications={notifications} 
          emptyMessage="No notifications for your session yet."
        />
      </div>
    </Layout>
  );
};

export default Dashboard;