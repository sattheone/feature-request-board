import React from 'react';
import { FeatureRequest, User, FeatureStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { Button } from './common/Button';
import { ThumbsUpIcon, ChatBubbleIcon } from './common/Icon';

interface FeatureRequestItemProps {
  request: FeatureRequest;
  currentUser: User | null;
  onUpvote: (requestId: string) => void;
  onViewDetails: (request: FeatureRequest) => void;
  onAddComment: (requestId: string, text: string) => void;
  onChangeStatus: (requestId: string, status: FeatureStatus) => void;
}

const FeatureRequestItem: React.FC<FeatureRequestItemProps> = ({
  request,
  currentUser,
  onUpvote,
  onViewDetails,
  onAddComment,
  onChangeStatus,
}) => {
  if (!currentUser) return null;

  const hasUpvoted = request.upvotes.includes(currentUser.id);
  const descriptionPreview = request.description.length > 100 
    ? `${request.description.substring(0, 100)}...` 
    : request.description;

  const isAdmin = currentUser.id === 'admin_mock_1'; // Replace with actual admin check

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 transition-all hover:shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800 hover:text-primary cursor-pointer" onClick={() => onViewDetails(request)}>
            {request.title}
          </h3>
          {isAdmin ? (
            <select
              value={request.status}
              onChange={(e) => onChangeStatus(request.id, e.target.value as FeatureStatus)}
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                STATUS_COLORS[request.status]
              } border-0 focus:ring-0`}
            >
              {Object.values(FeatureStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                STATUS_COLORS[request.status]
              }`}
            >
              {request.status}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3">
          By <span className="font-medium">{request.userName}</span> on{' '}
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{descriptionPreview}</p>
      </div>

      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant={hasUpvoted ? 'primary' : 'ghost'}
            onClick={() => onUpvote(request.id)}
            leftIcon={<ThumbsUpIcon size={16} />}
            className="text-sm"
          >
             {request.upvotes.length}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onViewDetails(request)}
            leftIcon={<ChatBubbleIcon size={16}/>}
            className="text-sm text-gray-600 hover:text-primary"
          >
            {request.comments.length}
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(request)}
          className="text-sm text-primary hover:underline"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default FeatureRequestItem;
    