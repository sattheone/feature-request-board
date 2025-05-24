export enum FeatureStatus {
  OPEN = 'open',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined'
}

export enum FeatureCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  INTEGRATION = 'integration',
  DESIGN = 'design',
  UX = 'ux',
  FEEDBACK = 'feedback'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface Changelog {
  id: string;
  requestId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface FeatureRequest {
  id: string;
  boardId: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: Date;
  upvotes: string[];
  status: FeatureStatus;
  category: FeatureCategory;
  comments: Comment[];
  changelogs: Changelog[];
}

export interface Board {
  id: string;
  name: string;
  description?: string;
}