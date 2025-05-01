import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getStudents, addNotification } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';

interface CreateNotificationProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateNotification: React.FC<CreateNotificationProps> = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetSessions: ['all'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSessions, setAvailableSessions] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Get unique sessions from students
    const students = getStudents();
    const sessions = Array.from(new Set(students.map(student => student.session)));
    setAvailableSessions(['all', ...sessions]);
    
    // If user is a session rep, set their session as the only target
    if (user?.role === 'session_rep' && user.session) {
      setFormData(prev => ({
        ...prev,
        targetSessions: [user.session!]
      }));
    }
  }, [user]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Session reps can only create notifications for their session
    if (user?.role === 'session_rep') {
      return;
    }
    
    if (value === 'all') {
      setFormData(prev => ({ ...prev, targetSessions: ['all'] }));
    } else {
      setFormData(prev => {
        const newTargetSessions = prev.targetSessions.filter(s => s !== 'all');
        if (!newTargetSessions.includes(value)) {
          newTargetSessions.push(value);
        }
        return { ...prev, targetSessions: newTargetSessions };
      });
    }
  };
  
  const removeSession = (session: string) => {
    // Session reps can't modify their target session
    if (user?.role === 'session_rep') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      targetSessions: prev.targetSessions.filter(s => s !== session)
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.targetSessions.length === 0) {
      newErrors.targetSessions = 'At least one target session is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newNotification = {
        id: crypto.randomUUID(),
        title: formData.title,
        content: formData.content,
        category: formData.category as 'important' | 'academic' | 'general',
        createdAt: new Date().toISOString(),
        targetSessions: formData.targetSessions,
        createdBy: {
          id: user!.id,
          role: user!.role === 'admin' ? 'admin' : 'session_rep',
          session: user!.session
        }
      };
      
      addNotification(newNotification);
      onCreated();
    } catch (err) {
      console.error(err);
      setErrors({
        form: 'An error occurred while creating the notification'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Notification</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          )}
          
          <Input
            label="Title"
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            fullWidth
          />
          
          <div className="mb-4">
            <label 
              htmlFor="content" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={4}
              className={`
                px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-blue-500 block w-full sm:text-sm 
                ${errors.content ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              `}
              value={formData.content}
              onChange={handleChange}
              required
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>
          
          <Select
            label="Category"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: 'important', label: 'Important' },
              { value: 'academic', label: 'Academic' },
              { value: 'general', label: 'General' },
            ]}
            error={errors.category}
            fullWidth
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Sessions
            </label>
            
            {user?.role === 'admin' ? (
              <>
                <Select
                  id="session-selector"
                  value=""
                  onChange={handleSessionChange}
                  options={[
                    { value: '', label: '-- Select Sessions --' },
                    ...availableSessions
                      .filter(session => !formData.targetSessions.includes(session))
                      .map(session => ({ 
                        value: session, 
                        label: session === 'all' ? 'All Sessions' : session 
                      }))
                  ]}
                  fullWidth
                />
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.targetSessions.map(session => (
                    <div 
                      key={session} 
                      className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {session === 'all' ? 'All Sessions' : session}
                      <button 
                        type="button" 
                        onClick={() => removeSession(session)}
                        className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-2">
                <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm inline-flex items-center">
                  {user?.session}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  As a session representative, you can only create notifications for your session.
                </p>
              </div>
            )}
            
            {errors.targetSessions && (
              <p className="mt-1 text-sm text-red-600">{errors.targetSessions}</p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading}
            >
              Create Notification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotification;