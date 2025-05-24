import { Board } from './types';

export const BOARDS: Board[] = [
  {
    id: 'feature-requests',
    name: 'Feature Requests',
    description: 'Suggest new features for our product',
    items: [],
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Request integrations with other tools',
    items: [],
  },
  {
    id: 'design-suggestions',
    name: 'Design Suggestions',
    description: 'Share your design ideas and improvements',
    items: [],
  },
  {
    id: 'ux-improvements',
    name: 'UX Improvements',
    description: 'Suggest ways to improve user experience',
    items: [],
  },
  {
    id: 'general-feedback',
    name: 'General Feedback',
    description: 'Share your thoughts and feedback',
    items: [],
  },
];

export const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

export const CATEGORIES = [
  'feature',
  'bug',
  'enhancement',
  'design',
  'ux',
  'other',
]; 