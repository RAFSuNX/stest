import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  
  const { login, adminLogin, student } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let success;
      
      if (loginType === 'student') {
        success = await login(formData.identifier, formData.password);
        
        if (success && student?.approvalStatus === 'pending') {
          setError('Your account is pending approval from an administrator');
          return;
        } else if (success && student?.approvalStatus === 'rejected') {
          setError('Your registration has been rejected');
          return;
        }
      } else {
        success = await adminLogin(formData.identifier, formData.password);
      }
      
      if (success) {
        navigate('/');
      } else {
        setError(loginType === 'student' 
          ? 'Invalid roll number or password' 
          : 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Bell className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to School Notify
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            register if you don't have an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md 
                ${loginType === 'student' 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setLoginType('student')}
            >
              Student Login
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md 
                ${loginType === 'admin' 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setLoginType('admin')}
            >
              Admin Login
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <Input
              label={loginType === 'student' ? "Roll Number" : "Email"}
              id="identifier"
              name="identifier"
              type={loginType === 'admin' ? "email" : "text"}
              required
              value={formData.identifier}
              onChange={handleChange}
              fullWidth
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login