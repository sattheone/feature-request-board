
import React, { useState } from 'react';
import { Button } from './common/Button';
import { UserCircleIcon } from './common/Icon';

interface UserLoginProps {
  onLogin: (name: string) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      setError('Name cannot be empty.');
      return;
    }
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }
    setError('');
    onLogin(name.trim());
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl">
      <div className="flex flex-col items-center mb-6">
        <UserCircleIcon className="text-primary mb-3" size={64} />
        <h2 className="text-3xl font-bold text-gray-800">Welcome!</h2>
        <p className="text-gray-600 mt-1">Enter your name to join the discussion.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            aria-describedby={error ? "name-error" : undefined}
          />
          {error && <p id="name-error" className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Enter Board
        </Button>
      </form>
    </div>
  );
};

export default UserLogin;
    