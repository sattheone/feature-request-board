import { FeatureStatus, Board } from './types';

export const STATUS_COLORS: Record<FeatureStatus, string> = {
  [FeatureStatus.OPEN]: 'bg-blue-500 text-blue-50',
  [FeatureStatus.PLANNED]: 'bg-yellow-500 text-yellow-50',
  [FeatureStatus.IN_PROGRESS]: 'bg-purple-500 text-purple-50',
  [FeatureStatus.COMPLETED]: 'bg-green-500 text-green-50',
  [FeatureStatus.DECLINED]: 'bg-red-500 text-red-50',
};

export const MOCK_USER_ADMIN_ID = 'admin_mock_1';
export const MOCK_USER_ADMIN_NAME = 'Admin User';

export const GLOBAL_DATA_KEY = 'feature_requests_data';

export const APP_BOARDS: Board[] = [
  { id: 'feature_requests', name: 'Feature Requests', description: 'Suggest new features and improvements for the product' },
  { id: 'integrations', name: 'Integrations', description: 'Request new integrations with other tools and services' },
  { id: 'design', name: 'Design Suggestions', description: 'Share your ideas for improving the product design' },
  { id: 'ux', name: 'UX Improvements', description: 'Suggest ways to enhance the user experience' },
  { id: 'feedback', name: 'General Feedback', description: 'Share your general feedback and thoughts' },
];

export const DEFAULT_BOARD_ID = 'feature_requests';
