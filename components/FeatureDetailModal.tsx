
import React, { useState } from 'react';
import { FeatureRequest, FeatureStatus, User, Comment as CommentType } from '../types';
import { STATUS_COLORS, MOCK_USER_ADMIN_ID } from '../constants';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import CommentItem from './CommentItem';
import { ThumbsUpIcon, ChatBubbleIcon } from './common/Icon';

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureRequest: FeatureRequest | null;
  currentUser: User | null;
  onUpvote: (requestId: string) => void;
  onAddComment: (requestId: string, text: string) => void;
  onChangeStatus: (requestId: string, status: FeatureStatus) => void;
}

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({
  isOpen,
  onClose,
  featureRequest,
  currentUser,
  onUpvote,
  onAddComment,
  onChangeStatus,
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');

  if (!featureRequest || !currentUser) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') {
      setCommentError('Comment cannot be empty.');
      return;
    }
    if (newComment.trim().length < 3) {
        setCommentError('Comment must be at least 3 characters.');
        return;
    }
    setCommentError('');
    onAddComment(featureRequest.id, newComment.trim());
    setNewComment('');
  };

  const canChangeStatus = currentUser.id === MOCK_USER_ADMIN_ID || currentUser.id === featureRequest.userId;
  const hasUpvoted = featureRequest.upvotes.includes(currentUser.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={featureRequest.title} size="xl">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Submitted by <span className="font-semibold">{featureRequest.userName}</span> on{' '}
            {new Date(featureRequest.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed">{featureRequest.description}</p>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Button
              variant={hasUpvoted ? 'primary' : 'ghost'}
              onClick={() => onUpvote(featureRequest.id)}
              leftIcon={<ThumbsUpIcon size={18} />}
              className="text-sm"
            >
              {hasUpvoted ? 'Upvoted' : 'Upvote'} ({featureRequest.upvotes.length})
            </Button>
            <div className="flex items-center text-gray-600 text-sm">
              <ChatBubbleIcon size={18} className="mr-1.5" />
              {featureRequest.comments.length} Comments
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            {canChangeStatus ? (
              <select
                value={featureRequest.status}
                onChange={(e) => onChangeStatus(featureRequest.id, e.target.value as FeatureStatus)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[featureRequest.status]} border border-gray-300 focus:ring-primary focus:border-primary`}
              >
                {Object.values(FeatureStatus).map((status) => (
                  <option key={status} value={status} className="bg-white text-gray-800">
                    {status}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_COLORS[featureRequest.status]
                }`}
              >
                {featureRequest.status}
              </span>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Comments</h4>
          {featureRequest.comments.length > 0 ? (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
              {featureRequest.comments
                .slice() // Create a copy to avoid mutating the original array
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by newest first
                .map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Add a comment</h4>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            aria-describedby={commentError ? "comment-error" : undefined}
          />
          {commentError && <p id="comment-error" className="mt-1 text-sm text-red-600">{commentError}</p>}
          <div className="mt-3 flex justify-end">
            <Button type="submit" variant="secondary" size="md">
              Post Comment
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FeatureDetailModal;
    