import React from 'react';
import { User } from '../types';
import { Button } from './common/Button';
import { UserCircleIcon, PlusCircleIcon } from './common/Icon';
import { MOCK_USER_ADMIN_ID } from '../constants';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onAddRequest: () => void;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLogout, 
  onAddRequest,
  showLoginButton = false,
  onLoginClick
}) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold text-primary">FeatureBoard</h1>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="text-gray-600" size={24}/>
                <span className="text-gray-700 font-medium">{currentUser.name}</span>
                {currentUser.id === MOCK_USER_ADMIN_ID && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Admin</span>
                )}
              </div>
              <Button variant="ghost" onClick={onLogout} size="sm">
                Logout
              </Button>
              <Button
                variant="primary"
                onClick={onAddRequest}
                leftIcon={<PlusCircleIcon size={20} />}
              >
                Add Request
              </Button>
            </>
          ) : showLoginButton && (
            <Button variant="primary" onClick={onLoginClick} size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 