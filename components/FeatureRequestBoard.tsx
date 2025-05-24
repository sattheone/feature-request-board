import React, { useState, useMemo } from 'react';
import { FeatureRequest, User, FeatureStatus } from '../types';
import FeatureRequestItem from './FeatureRequestItem';

interface FeatureRequestBoardProps {
  requests: FeatureRequest[];
  currentUser: User | null;
  onUpvote: (requestId: string) => void;
  onViewDetails: (request: FeatureRequest) => void;
  onAddComment: (requestId: string, text: string) => void;
  onChangeStatus: (requestId: string, status: FeatureStatus) => void;
  stickyFiltersTopOffset?: number;
  currentBoardName?: string;
}

type SortOption = 'newest' | 'oldest' | 'upvotes' | 'comments';

const FeatureRequestBoard: React.FC<FeatureRequestBoardProps> = ({
  requests,
  currentUser,
  onUpvote,
  onViewDetails,
  onAddComment,
  onChangeStatus,
  stickyFiltersTopOffset = 0,
  currentBoardName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests; // Requests are already filtered by boardId in App.tsx

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((req) => req.status === selectedStatus);
    }
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'upvotes':
          return b.upvotes.length - a.upvotes.length;
        case 'comments':
          return b.comments.length - a.comments.length;
        default:
          return 0;
      }
    });
  }, [requests, searchTerm, selectedStatus, sortBy]);


  if (!currentUser) {
    return <p className="text-center text-gray-600 mt-10">Please log in to view feature requests.</p>;
  }
  
  // This message now refers to the specific board, e.g., "No feature requests in 'Integrations' yet."
  if (requests.length === 0) { 
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No requests in {currentBoardName}</h3>
        <p className="mt-1 text-sm text-gray-500">Be the first to add one to this board!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`p-4 bg-slate-100/80 backdrop-blur-md rounded-lg shadow sticky z-10 border-b border-gray-200 ${stickyFiltersTopOffset}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search in {currentBoardName}</label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as FeatureStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"
            >
              <option value="all">All Statuses</option>
              {Object.values(FeatureStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="upvotes">Most Upvotes</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredAndSortedRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRequests.map((request) => (
            <FeatureRequestItem
              key={request.id}
              request={request}
              currentUser={currentUser}
              onUpvote={onUpvote}
              onViewDetails={onViewDetails}
              onAddComment={onAddComment}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10 text-lg">
          No requests match your current filters in {currentBoardName}. Try adjusting your search or filter criteria.
        </p>
      )}
    </div>
  );
};

export default FeatureRequestBoard;