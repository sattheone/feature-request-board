import { useState } from 'react';
import { User, FeatureRequest } from '../types';

interface Props {
  onSubmit: (changelog: {
    title: string;
    content: string;
    requestId: string;
  }) => void;
  onClose: () => void;
  user: User | null;
  requests: FeatureRequest[];
}

export const ChangelogForm = ({ onSubmit, onClose, user, requests }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [requestId, setRequestId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, requestId });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Changelog</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="request" className="block text-sm font-medium text-gray-700">
              Related Request
            </label>
            <select
              id="request"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select a request</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 