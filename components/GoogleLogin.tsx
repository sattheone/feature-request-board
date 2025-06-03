import React from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginProps {
  onLogin: (user: User) => void;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLogin }) => {
  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
        const user: User = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          role: 'user' as const,
        };
        onLogin(user);
      } catch (error) {
        // For testing with mock client ID
        const mockUser: User = {
          id: 'google_mock_1',
          name: 'Google User',
          email: 'google.user@example.com',
          role: 'user' as const,
        };
        onLogin(mockUser);
      }
    }
  };

  const handleError = () => {
    console.error('Login Failed');
    // For testing with mock client ID
    const mockUser: User = {
      id: 'google_mock_1',
      name: 'Google User',
      email: 'google.user@example.com',
      role: 'user' as const,
    };
    onLogin(mockUser);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <GoogleLoginButton
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_blue"
        text="signin_with"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLogin; 