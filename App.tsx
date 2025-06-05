import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, FeatureRequest, Comment, Changelog, Board, FeatureStatus, FeatureCategory } from './types';
import { MOCK_USER_ADMIN_ID, MOCK_USER_ADMIN_NAME, APP_BOARDS, DEFAULT_BOARD_ID } from './constants';
import UserLogin from './components/UserLogin';
import FeatureRequestBoard from './components/FeatureRequestBoard';
import NewFeatureRequestForm from './components/NewFeatureRequestForm';
import FeatureDetailModal from './components/FeatureDetailModal';
import AdminDashboard from './components/AdminDashboard';
import { Button } from './components/common/Button';
import { Modal } from './components/common/Modal';
import { PlusCircleIcon, UserCircleIcon } from './components/common/Icon';
import Header from './components/Header';
import BoardNavigation from './components/BoardNavigation';

// Helper to generate unique IDs
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

// Initial mock data
const getInitialData = (): FeatureRequest[] => {
  // Return empty array instead of mock data
  return [];
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  const [boards] = useState<Board[]>(APP_BOARDS);

  const handleAddFeatureRequest = useCallback((title: string, description: string) => {
    if (!user) return;
    const newRequest: FeatureRequest = {
      id: generateId(),
      boardId: selectedBoardId,
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
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={null}
          onLogout={() => {}} 
          onAddRequest={() => {}} 
          showLoginButton={true}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
        <BoardNavigation
          boards={APP_BOARDS}
          currentBoardId={selectedBoardId}
          onBoardChange={handleBoardChange}
        />
        <main className="container mx-auto px-4 py-8">
          <FeatureRequestBoard
            requests={requestsForCurrentBoard}
            currentUser={null}
            onUpvote={() => {}}
            onViewDetails={handleViewDetails}
            onAddComment={() => {}}
            onChangeStatus={() => {}}
            stickyFiltersTopOffset={80}
            currentBoardName={currentBoardName}
          />
          <FeatureDetailModal
            isOpen={!!selectedRequest}
            onClose={handleCloseDetailModal}
            featureRequest={selectedRequest}
            currentUser={null}
            onUpvote={() => {}}
            onAddComment={() => {}}
            onChangeStatus={() => {}}
          />
        </main>
        <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Login" size="md">
          <UserLogin onLogin={(userData) => { 
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role
            }); 
            setIsLoginModalOpen(false); 
          }} />
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={user} 
        onLogout={handleLogout} 
        onAddRequest={() => setIsNewRequestModalOpen(true)}
        showLoginButton={true}
        onLoginClick={handleLogout}
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