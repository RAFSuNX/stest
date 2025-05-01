import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">School Notify</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {user ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Admin Panel
                  </Link>
                )}
                
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </nav>
          
          {user && (
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="ml-4"
              >
                Logout
              </Button>
            </div>
          )}
          
          <div className="md:hidden flex items-center">
            {/* Mobile menu button */}
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;