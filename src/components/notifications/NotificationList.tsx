import React, { useState } from 'react';
import { Notification } from '../../types';
import NotificationCard from './NotificationCard';
import { Search } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  emptyMessage?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  emptyMessage = "No notifications available" 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         notification.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleRefresh = () => {
    // This function would be used to refresh the list if needed
    // For now, it just triggers a re-render
    setSearchQuery('');
    setFilterCategory('all');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search notifications..."
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter dropdown */}
        <div className="w-full md:w-48">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="important">Important</option>
            <option value="academic">Academic</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>
      
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4 mt-6">
          {filteredNotifications.map(notification => (
            <NotificationCard 
              key={notification.id} 
              notification={notification} 
              onRead={handleRefresh}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;