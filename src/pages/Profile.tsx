import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, student, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [studentData, setStudentData] = useState({
    fullName: student?.fullName || '',
    rollNumber: student?.rollNumber || '',
    session: student?.session || '',
  });
  
  // For password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  // In a real app, we would update the student data in the database
  const handleSaveChanges = () => {
    // Implementation would go here
    setIsEditing(false);
  };
  
  // In a real app, we would update the password in the database
  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, we would verify the current password before allowing change
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setIsChangingPassword(false);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user || !student) {
    navigate('/login');
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">
              My Profile
            </h1>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{student.fullName}</h2>
                <p className="text-gray-600">Student</p>
              </div>
            </div>
            
            {isEditing ? (
              // Edit form
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={studentData.fullName}
                  onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                  fullWidth
                />
                
                <Input
                  label="Roll Number"
                  value={studentData.rollNumber}
                  disabled
                  fullWidth
                />
                
                <Input
                  label="Session"
                  value={studentData.session}
                  onChange={(e) => setStudentData({ ...studentData, session: e.target.value })}
                  fullWidth
                />
                
                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-md text-gray-900">{student.fullName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                    <p className="mt-1 text-md text-gray-900">{student.rollNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Session</h3>
                    <p className="mt-1 text-md text-gray-900">{student.session}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                    <p className="mt-1 text-md text-gray-900">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="mr-3"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Password Change Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center">
              <KeyRound className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Security
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            {isChangingPassword ? (
              <div className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}
                
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  fullWidth
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  fullWidth
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  fullWidth
                />
                
                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleChangePassword}>Update Password</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  Change your password to keep your account secure.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;