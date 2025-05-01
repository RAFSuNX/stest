import React from 'react';
import { Notification } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../contexts/AuthContext';
import { markNotificationAsRead, isNotificationRead } from '../../utils/storage';

interface NotificationCardProps {
  notification: Notification;
  onRead?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRead }) => {
  const { user } = useAuth();
  
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
  
  const handleClick = () => {
    if (user && user.role === 'student') {
      markNotificationAsRead(user.id, notification.id);
      if (onRead) onRead();
    }
  };
  
  const isRead = user && user.role === 'student' && isNotificationRead(user.id, notification.id);
  
  return (
    <div 
      className={`
        bg-white p-6 rounded-lg shadow mb-4 border-l-4 
        ${isRead ? 'border-gray-300' : 'border-blue-500'} 
        transition-all duration-200 hover:shadow-md
      `}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className={`text-lg font-semibold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
          {notification.title}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(notification.category)}`}>
          {notification.category}
        </span>
      </div>
      
      <p className={`mt-2 ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
        {notification.content}
      </p>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <span>Posted: {formatDate(notification.createdAt)}</span>
        {!isRead && user?.role === 'student' && (
          <span className="text-blue-600 font-medium">New</span>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;