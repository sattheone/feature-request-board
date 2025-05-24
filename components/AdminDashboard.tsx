import React from 'react';
import { FeatureRequest, User, Changelog } from '../types';

interface AdminDashboardProps {
  requests: FeatureRequest[];
  currentUser: User;
  onUpdateRequest: (requestId: string, updates: Partial<FeatureRequest>) => void;
  onAddChangelog: (requestId: string, changelog: Omit<Changelog, 'id' | 'createdAt'>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  currentUser,
  onUpdateRequest,
  onAddChangelog,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <div key={request.id} className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{request.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              By {request.userName} on {new Date(request.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-4">{request.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {request.upvotes.length} upvotes
              </span>
              <span className="text-sm text-gray-500">
                {request.comments.length} comments
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 