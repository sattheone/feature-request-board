import React, { useState } from 'react';
import { Button } from './common/Button';
import { UserCircleIcon } from './common/Icon';
import { User } from '../types';

interface UserLoginProps {
  onLogin: (userData: { id: string; name: string; email: string; token: string; role: 'admin' | 'user' }) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!process.env.REACT_APP_API_URL) {
      console.error("Missing REACT_APP_API_URL! Check your environment variables.");
    }

    try {
      const endpoint = `${process.env.REACT_APP_API_URL}${isLogin ? '/api/auth/login' : '/api/auth/signup'}`;
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        role: data.user.role || 'user'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl">
      <div className="flex flex-col items-center mb-6">
        <UserCircleIcon className="text-primary mb-3" size={64} />
        <h2 className="text-3xl font-bold text-gray-800">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isLogin ? 'Sign in to continue.' : 'Sign up to get started.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Jane Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-light focus:border-primary transition-shadow"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Button>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-primary hover:text-primary-dark transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
};

export default UserLogin;
    