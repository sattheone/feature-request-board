export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Changelog {
  id: string;
  title: string;
  content: string;
  requestId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Upvote {
  id: string;
  userId: string;
  requestId: string;
  createdAt: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'completed' | 'declined';
  boardId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  comments: Comment[];
  changelogs: Changelog[];
  upvotes: Upvote[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  items: FeatureRequest[];
} 