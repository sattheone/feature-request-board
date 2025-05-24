
import React, { useState } from 'react';
import { Button } from './common/Button';

interface NewFeatureRequestFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

const NewFeatureRequestForm: React.FC<NewFeatureRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || description.trim() === '') {
      setError('Both title and description are required.');
      return;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }
    setError('');
    onSubmit(title.trim(), description.trim());
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <div>
        <label htmlFor="featureTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Feature Title
        </label>
        <input
          type="text"
          id="featureTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A short, descriptive title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="featureDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Detailed explanation of the feature or feedback"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Submit Request
        </Button>
      </div>
    </form>
  );
};

export default NewFeatureRequestForm;
    