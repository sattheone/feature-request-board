import { useState } from 'react';
import { FeatureRequest as FeatureRequestType, User } from '../types';
import { STATUS_COLORS } from '../constants';

interface Props {
  request: FeatureRequestType;
  onUpdate: (id: string, updates: any) => void;
  onCreateComment: (requestId: string, text: string) => void;
  onToggleUpvote: (requestId: string) => void;
  user: User | null;
}

export const FeatureRequest = ({
  request,
  onUpdate,
  onCreateComment,
  onToggleUpvote,
  user,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(request.id, { title, description });
    setIsEditing(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onCreateComment(request.id, comment);
      setComment('');
    }
  };

  const hasUpvoted = user && request.upvotes.some((upvote) => upvote.userId === user.id);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Description"
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
              <p className="mt-2 text-gray-600">{request.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  STATUS_COLORS[request.status]
                }`}
              >
                {request.status}
              </span>
              {user && (
                <button
                  onClick={() => onToggleUpvote(request.id)}
                  className={`p-2 rounded-full ${
                    hasUpvoted ? 'text-blue-600' : 'text-gray-400'
                  } hover:text-blue-600`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <span className="text-sm text-gray-600">
                {request.upvotes.length}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Comments</h4>
            <div className="mt-2 space-y-4">
              {request.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                </div>
              ))}
            </div>

            {user && (
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Add a comment..."
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>
              </form>
            )}
          </div>

          {user && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Edit
              </button>
              <select
                value={request.status}
                onChange={(e) => onUpdate(request.id, { status: e.target.value })}
                className="px-4 py-2 border rounded-md"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 