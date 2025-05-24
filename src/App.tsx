import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from './components/GoogleLogin';
import { Header } from './components/Header';
import { FeatureRequest } from './components/FeatureRequest';
import { FeatureRequestForm } from './components/FeatureRequestForm';
import { Changelog } from './components/Changelog';
import { ChangelogForm } from './components/ChangelogForm';
import { Board, User, FeatureRequest as FeatureRequestType } from './types';
import { BOARDS } from './constants';
import { api } from './services/api';

function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('feature-requests');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isChangelogFormOpen, setIsChangelogFormOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBoards();
      if (response.data) {
        setBoards(response.data);
      } else {
        // If no boards exist, create them
        const newBoards = BOARDS.map((board: Board) => ({
          ...board,
          items: [],
        }));
        setBoards(newBoards);
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, name: string) => {
    const response = await api.login(email, name);
    if (response.data) {
      setUser(response.data.user);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleCreateRequest = async (request: {
    title: string;
    description: string;
    category: string;
  }) => {
    if (!user) return;

    const response = await api.createRequest({
      ...request,
      boardId: selectedBoard,
    });

    if (response.data) {
      await loadBoards();
      setIsFormOpen(false);
    }
  };

  const handleUpdateRequest = async (
    id: string,
    updates: {
      status?: string;
      title?: string;
      description?: string;
      category?: string;
    }
  ) => {
    if (!user) return;

    const response = await api.updateRequest(id, updates);
    if (response.data) {
      await loadBoards();
    }
  };

  const handleCreateComment = async (requestId: string, text: string) => {
    if (!user) return;

    const response = await api.createComment({ text, requestId });
    if (response.data) {
      await loadBoards();
    }
  };

  const handleToggleUpvote = async (requestId: string) => {
    if (!user) return;

    const response = await api.toggleUpvote(requestId);
    if (response.data) {
      await loadBoards();
    }
  };

  const handleCreateChangelog = async (changelog: {
    title: string;
    content: string;
    requestId: string;
  }) => {
    if (!user) return;

    const response = await api.createChangelog(changelog);
    if (response.data) {
      await loadBoards();
      setIsChangelogFormOpen(false);
    }
  };

  const currentBoard = boards.find((b) => b.id === selectedBoard);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="167d7c9d-8d59-4b02-9012-810f0634285f">
      <div className="min-h-screen bg-gray-50">
        <Header
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
          onOpenForm={() => setIsFormOpen(true)}
          onOpenChangelogForm={() => setIsChangelogFormOpen(true)}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <main className="container mx-auto px-4 py-8">
          {currentBoard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBoard.items.map((item: FeatureRequestType) => (
                <FeatureRequest
                  key={item.id}
                  request={item}
                  onUpdate={handleUpdateRequest}
                  onCreateComment={handleCreateComment}
                  onToggleUpvote={handleToggleUpvote}
                  user={user}
                />
              ))}
            </div>
          )}
        </main>

        {isFormOpen && (
          <FeatureRequestForm
            onSubmit={handleCreateRequest}
            onClose={() => setIsFormOpen(false)}
            user={user}
          />
        )}

        {isChangelogFormOpen && (
          <ChangelogForm
            onSubmit={handleCreateChangelog}
            onClose={() => setIsChangelogFormOpen(false)}
            user={user}
            requests={currentBoard?.items || []}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App; 