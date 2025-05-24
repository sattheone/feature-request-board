import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { User } from '../types';

interface Props {
  onLogin: (email: string, name: string) => void;
}

export const GoogleLogin = ({ onLogin }: Props) => {
  return (
    <div className="flex items-center space-x-4">
      <GoogleLoginButton
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
            onLogin(decoded.email, decoded.name);
          }
        }}
        onError={() => {
          console.error('Login Failed');
        }}
      />
    </div>
  );
}; 