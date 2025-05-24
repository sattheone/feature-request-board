
import React from 'react';
import { Comment as CommentType } from '../types';
import { UserCircleIcon } from './common/Icon';

interface CommentItemProps {
  comment: CommentType;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start space-x-3">
        <UserCircleIcon className="text-gray-400 mt-1" size={24} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">{comment.userName}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
    