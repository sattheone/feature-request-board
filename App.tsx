import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { User, FeatureRequest, Comment, Changelog, Board, FeatureStatus, FeatureCategory } from './types';
import { GLOBAL_DATA_KEY, MOCK_USER_ADMIN_ID, MOCK_USER_ADMIN_NAME, APP_BOARDS, DEFAULT_BOARD_ID } from './constants';
import UserLogin from './components/UserLogin';
import FeatureRequestBoard from './components/FeatureRequestBoard';
import NewFeatureRequestForm from './components/NewFeatureRequestForm';
import FeatureDetailModal from './components/FeatureDetailModal';
import AdminDashboard from './components/AdminDashboard';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { PlusCircleIcon, UserCircleIcon } from './components/common/Icon';
import Header from './components/Header';
import GoogleLogin from './components/GoogleLogin';
import BoardNavigation from './components/BoardNavigation';

// Helper to generate unique IDs
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Initial mock data
const getInitialData = (): FeatureRequest[] => {
  console.log('Getting initial data...');
  const storedData = localStorage.getItem(GLOBAL_DATA_KEY);
  console.log('Stored data:', storedData);
  
  if (storedData && storedData !== '[]') {
    try {
      const parsedData = JSON.parse(storedData) as FeatureRequest[];
      console.log('Parsed data:', parsedData);
      if (parsedData.length > 0) {
      return parsedData.map(req => ({
        ...req,
          boardId: req.boardId || DEFAULT_BOARD_ID,
          category: req.category || FeatureCategory.FEATURE,
          changelogs: req.changelogs || [],
        createdAt: new Date(req.createdAt),
        comments: req.comments.map(c => ({...c, createdAt: new Date(c.createdAt)}))
      }));
      }
    } catch (error) {
      console.error("Failed to parse stored feature requests:", error);
      localStorage.removeItem(GLOBAL_DATA_KEY);
    }
  }

  console.log('No stored data or empty array, creating default items...');
  // Feature Requests Board Items
  const featureRequestsItems = [
    {
      id: generateId(),
      boardId: APP_BOARDS[0].id,
      title: 'Dark Mode Theme',
      description: 'Implement a dark mode option for the entire application to reduce eye strain in low-light environments.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_2', 'user_mock_3', 'user_mock_4'],
      status: FeatureStatus.PLANNED,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [
        { id: generateId(), requestId: '', userId: 'user_mock_2', userName: 'Bob', text: 'This would be amazing!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
      ],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[0].id,
      title: 'Export Data to CSV',
      description: 'Allow users to export their feature request data, including comments and upvotes, to a CSV file for external analysis.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      upvotes: ['user_mock_3', 'user_mock_4'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[0].id,
      title: 'Keyboard Shortcuts',
      description: 'Add keyboard shortcuts for common actions to improve productivity.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_2'],
      status: FeatureStatus.IN_PROGRESS,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[0].id,
      title: 'Bulk Actions',
      description: 'Enable bulk selection and actions for multiple feature requests.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      upvotes: ['user_mock_2', 'user_mock_3'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[0].id,
      title: 'Advanced Search Filters',
      description: 'Add more advanced search and filtering options for feature requests.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_4'],
      status: FeatureStatus.COMPLETED,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [],
    },
  ];

  // Integrations Board Items
  const integrationsItems = [
    {
      id: generateId(),
      boardId: APP_BOARDS[1].id,
      title: 'Slack Integration for Notifications',
      description: 'Allow users to receive notifications about their requests directly in Slack.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      upvotes: ['user_mock_3', MOCK_USER_ADMIN_ID, 'user_mock_2'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.INTEGRATION,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[1].id,
      title: 'GitHub Integration',
      description: 'Link feature requests to GitHub issues and track implementation progress.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      upvotes: ['user_mock_2', 'user_mock_3', 'user_mock_4'],
      status: FeatureStatus.PLANNED,
      category: FeatureCategory.INTEGRATION,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[1].id,
      title: 'Jira Integration',
      description: 'Sync feature requests with Jira tickets for better project management.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_2'],
      status: FeatureStatus.IN_PROGRESS,
      category: FeatureCategory.INTEGRATION,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[1].id,
      title: 'Microsoft Teams Integration',
      description: 'Add support for Microsoft Teams notifications and updates.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      upvotes: ['user_mock_4'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.INTEGRATION,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[1].id,
      title: 'Discord Integration',
      description: 'Enable Discord webhook integration for real-time updates.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      upvotes: ['user_mock_3', 'user_mock_2'],
      status: FeatureStatus.DECLINED,
      category: FeatureCategory.INTEGRATION,
      changelogs: [],
      comments: [],
    },
  ];

  // Design Suggestions Board Items
  const designItems = [
    {
      id: generateId(),
      boardId: APP_BOARDS[2].id,
      title: 'Modern Card Design',
      description: 'Update the feature request cards with a more modern and clean design.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      upvotes: ['user_mock_4', MOCK_USER_ADMIN_ID],
      status: FeatureStatus.IN_PROGRESS,
      category: FeatureCategory.DESIGN,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[2].id,
      title: 'Custom Color Themes',
      description: 'Allow users to customize the color scheme of the application.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      upvotes: ['user_mock_2', 'user_mock_3'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.DESIGN,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[2].id,
      title: 'Improved Typography',
      description: 'Enhance readability with better typography and font choices.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_4'],
      status: FeatureStatus.COMPLETED,
      category: FeatureCategory.DESIGN,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[2].id,
      title: 'Animated Transitions',
      description: 'Add smooth animations for state changes and interactions.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      upvotes: ['user_mock_3'],
      status: FeatureStatus.PLANNED,
      category: FeatureCategory.DESIGN,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[2].id,
      title: 'Custom Icons',
      description: 'Replace generic icons with custom-designed ones.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      upvotes: ['user_mock_4', 'user_mock_2'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.DESIGN,
      changelogs: [],
      comments: [],
    },
  ];

  // UX Improvements Board Items
  const uxItems = [
    {
      id: generateId(),
      boardId: APP_BOARDS[3].id,
      title: 'Improved Mobile Navigation',
      description: 'Enhance the mobile navigation experience with a better menu system.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      upvotes: ['user_mock_3', 'user_mock_4'],
      status: FeatureStatus.IN_PROGRESS,
      category: FeatureCategory.UX,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[3].id,
      title: 'Streamlined Onboarding',
      description: 'Create a more intuitive onboarding experience for new users.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_2'],
      status: FeatureStatus.PLANNED,
      category: FeatureCategory.UX,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[3].id,
      title: 'Contextual Help',
      description: 'Add tooltips and contextual help throughout the application.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      upvotes: ['user_mock_2', 'user_mock_3'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.UX,
      changelogs: [],
      comments: [],
    },
     {
      id: generateId(),
      boardId: APP_BOARDS[3].id,
      title: 'Improved Form Validation',
      description: 'Enhance form validation with better error messages and real-time feedback.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      upvotes: ['user_mock_4', MOCK_USER_ADMIN_ID],
      status: FeatureStatus.COMPLETED,
      category: FeatureCategory.UX,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[3].id,
      title: 'Accessibility Improvements',
      description: 'Enhance accessibility features for better screen reader support.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      upvotes: ['user_mock_3', 'user_mock_2'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.UX,
      changelogs: [],
      comments: [],
    },
  ];

  // General Feedback Board Items
  const feedbackItems = [
    {
      id: generateId(),
      boardId: APP_BOARDS[4].id,
      title: 'Performance Optimization',
      description: 'The application feels slow when loading large lists of feature requests.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      upvotes: ['user_mock_2', 'user_mock_3', 'user_mock_4'],
      status: FeatureStatus.IN_PROGRESS,
      category: FeatureCategory.FEEDBACK,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[4].id,
      title: 'Better Documentation',
      description: 'Need more comprehensive documentation for the API and features.',
      userId: 'user_mock_3',
      userName: 'Charlie',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      upvotes: ['user_mock_3', MOCK_USER_ADMIN_ID],
      status: FeatureStatus.PLANNED,
      category: FeatureCategory.FEEDBACK,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[4].id,
      title: 'More Customization Options',
      description: 'Allow users to customize their dashboard and views.',
      userId: 'user_mock_4',
      userName: 'Diana',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      upvotes: ['user_mock_4', 'user_mock_2'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.FEEDBACK,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[4].id,
      title: 'Better Error Handling',
      description: 'Improve error messages and recovery options.',
      userId: MOCK_USER_ADMIN_ID,
      userName: MOCK_USER_ADMIN_NAME,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      upvotes: [MOCK_USER_ADMIN_ID, 'user_mock_3'],
      status: FeatureStatus.COMPLETED,
      category: FeatureCategory.FEEDBACK,
      changelogs: [],
      comments: [],
    },
    {
      id: generateId(),
      boardId: APP_BOARDS[4].id,
      title: 'Enhanced Search',
      description: 'The current search functionality could be more powerful.',
      userId: 'user_mock_2',
      userName: 'Bob',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      upvotes: ['user_mock_2', 'user_mock_4'],
      status: FeatureStatus.OPEN,
      category: FeatureCategory.FEEDBACK,
      changelogs: [],
      comments: [],
    },
  ];

  // Combine all items and map comments
  const allItems = [...featureRequestsItems, ...integrationsItems, ...designItems, ...uxItems, ...feedbackItems]
    .map(req => ({
      ...req,
      comments: req.comments.map(c => ({...c, requestId: req.id}))
    }));
  
  console.log('Created default items:', allItems);
  return allItems;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(DEFAULT_BOARD_ID);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>(getInitialData());
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Handle Google login
  const handleGoogleLogin = (userData: User) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
  };

  // Handle email/password login
  const handleEmailLogin = async (userData: { id: string; name: string; email: string; token: string; role: 'admin' | 'user' }) => {
    const newUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as 'admin' | 'user'
    };
    setUser(newUser);
    setIsAdmin(userData.role === 'admin');
    // Store token in localStorage
    localStorage.setItem('auth_token', userData.token);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('auth_token');
  };

  const [boards] = useState<Board[]>(APP_BOARDS);

  // Approximate heights for sticky elements calculation
  const HEADER_HEIGHT_CLASS = 'h-[68px]'; // Tailwind class for ~4.25rem (py-4 + content)
  const BOARD_NAV_HEIGHT_CLASS = 'h-[52px]'; // Tailwind class for ~3.25rem (py-3 + content)
  
  // Dynamically generate top offset class for filters based on header and board nav heights
  // For Tailwind JIT, these specific values like top-[120px] need to be present or whitelisted.
  // A simpler approach is to ensure these heights are fixed and use fixed Tailwind classes like top-16, top-28.
  // Let's use fixed values for simplicity of example. Header py-4 -> ~68px. Nav py-3 -> ~52px.
  const STICKY_HEADER_TOP_OFFSET = 'top-[68px]'; // For board nav
  const STICKY_FILTERS_TOP_OFFSET = 'top-[120px]'; // For filters in FeatureRequestBoard (68px + 52px)

  useEffect(() => {
    console.log('App useEffect running...');
    // Load initial data
    const initialData = getInitialData();
    console.log('Setting initial data:', initialData);
    setFeatureRequests(initialData);

    // Mock user login with role
    setUser({
      id: 'user_mock_1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user' as const
    });
  }, []);

  useEffect(() => {
    console.log('Saving requests to localStorage:', featureRequests);
    localStorage.setItem(GLOBAL_DATA_KEY, JSON.stringify(featureRequests));
  }, [featureRequests]);

  const handleAddFeatureRequest = useCallback((title: string, description: string) => {
    if (!user) return;
    const newRequest: FeatureRequest = {
      id: generateId(),
      boardId: selectedBoardId, // Assign to current board
      title,
      description,
      userId: user.id,
      userName: user.name,
      createdAt: new Date(),
      upvotes: [user.id], 
      status: FeatureStatus.OPEN,
      category: FeatureCategory.FEATURE,
      changelogs: [],
      comments: [],
    };
    setFeatureRequests((prevRequests) => [newRequest, ...prevRequests]);
    setIsNewRequestModalOpen(false);
  }, [user, selectedBoardId]);

  const handleUpvote = useCallback((requestId: string) => {
    if (!user) return;
    setFeatureRequests((prevRequests) =>
      prevRequests.map((req) => {
        if (req.id === requestId) {
          const alreadyUpvoted = req.upvotes.includes(user.id);
          return {
            ...req,
            upvotes: alreadyUpvoted
              ? req.upvotes.filter((userId) => userId !== user.id)
              : [...req.upvotes, user.id],
          };
        }
        return req;
      })
    );
  }, [user]);

  const handleAddComment = useCallback((requestId: string, text: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: generateId(),
      requestId,
      userId: user.id,
      userName: user.name,
      text,
      createdAt: new Date(),
    };
    setFeatureRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, comments: [newComment, ...req.comments] } : req
      )
    );
    setSelectedRequest(prev => prev && prev.id === requestId ? {...prev, comments: [newComment, ...prev.comments]} : prev);
  }, [user]);

  const handleChangeStatus = useCallback((requestId: string, status: FeatureStatus) => {
     if (!user) return;
    const requestToChange = featureRequests.find(req => req.id === requestId);
    if (!requestToChange) return;
    
    const canChange = user.id === MOCK_USER_ADMIN_ID || user.id === requestToChange.userId;
    if (!canChange) {
        alert("You are not authorized to change the status of this request.");
        return;
    }

    setFeatureRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, status } : req
      )
    );
     setSelectedRequest(prev => prev && prev.id === requestId ? {...prev, status} : prev);
  }, [user, featureRequests]);

  const handleUpdateRequest = useCallback((requestId: string, updates: Partial<FeatureRequest>) => {
    if (!user || user.id !== MOCK_USER_ADMIN_ID) return;
    
    setFeatureRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, ...updates } : req
      )
    );
    setSelectedRequest(prev => prev && prev.id === requestId ? {...prev, ...updates} : prev);
  }, [user]);

  const handleAddChangelog = useCallback((requestId: string, changelog: Omit<Changelog, 'id' | 'createdAt'>) => {
    if (!user || user.id !== MOCK_USER_ADMIN_ID) return;
    
    const newChangelog: Changelog = {
      id: generateId(),
      ...changelog,
      createdAt: new Date(),
    };
    
    setFeatureRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === requestId ? { ...req, changelogs: [newChangelog, ...req.changelogs] } : req
      )
    );
    setSelectedRequest(prev => prev && prev.id === requestId ? {...prev, changelogs: [newChangelog, ...prev.changelogs]} : prev);
  }, [user]);

  const handleViewDetails = (request: FeatureRequest) => {
    setSelectedRequest(request);
  };

  const handleCloseDetailModal = () => {
    setSelectedRequest(null);
  };
  
  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
  };
  
  const requestsForCurrentBoard = useMemo(() => {
    return featureRequests.filter(req => req.boardId === selectedBoardId);
  }, [featureRequests, selectedBoardId]);

  const currentBoardName = useMemo(() => {
    return APP_BOARDS.find(b => b.id === selectedBoardId)?.name || 'Board';
  }, [selectedBoardId]);

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
            <h1 className="text-2xl font-bold text-center mb-6">Welcome to FeatureBoard</h1>
            <div className="space-y-4">
              <GoogleLogin onLogin={handleGoogleLogin} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
              <UserLogin onLogin={handleEmailLogin} />
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={user} 
        onLogout={handleLogout} 
        onAddRequest={() => setIsNewRequestModalOpen(true)}
      />
      <BoardNavigation
        boards={APP_BOARDS}
        currentBoardId={selectedBoardId}
        onBoardChange={handleBoardChange}
      />
      <main className="container mx-auto px-4 py-8">
        {user?.id === MOCK_USER_ADMIN_ID ? (
          <AdminDashboard
            requests={requestsForCurrentBoard}
            currentUser={user}
            onUpdateRequest={handleUpdateRequest}
            onAddChangelog={handleAddChangelog}
          />
        ) : (
        <FeatureRequestBoard
          requests={requestsForCurrentBoard}
          currentUser={user}
          onUpvote={handleUpvote}
          onViewDetails={handleViewDetails}
            onAddComment={handleAddComment}
            onChangeStatus={handleChangeStatus}
            stickyFiltersTopOffset={80}
          currentBoardName={currentBoardName}
          />
        )}
        <FeatureDetailModal
          isOpen={!!selectedRequest}
          onClose={handleCloseDetailModal}
          featureRequest={selectedRequest}
          currentUser={user}
          onUpvote={handleUpvote}
          onAddComment={handleAddComment}
          onChangeStatus={handleChangeStatus}
        />
      </main>
      <Modal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        title={`Submit to ${currentBoardName}`}
        size="lg"
      >
        <NewFeatureRequestForm
          onSubmit={handleAddFeatureRequest}
          onCancel={() => setIsNewRequestModalOpen(false)}
        />
      </Modal>
       <footer className="py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} FeatureBoard. All rights reserved.</p>
        <p>A React & Tailwind CSS Application.</p>
      </footer>
    </div>
  );
};

export default App;