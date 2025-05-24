import { Board, User } from '../types';
import { GoogleLogin } from './GoogleLogin';

interface Props {
  boards: Board[];
  selectedBoard: string;
  onSelectBoard: (boardId: string) => void;
  onOpenForm: () => void;
  onOpenChangelogForm: () => void;
  user: User | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
}

export const Header = ({
  boards,
  selectedBoard,
  onSelectBoard,
  onOpenForm,
  onOpenChangelogForm,
  user,
  onLogin,
  onLogout,
}: Props) => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Feature Request Board</h1>
            <nav className="flex space-x-4">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => onSelectBoard(board.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedBoard === board.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {board.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onOpenForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  New Request
                </button>
                <button
                  onClick={onOpenChangelogForm}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  New Changelog
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{user.name}</span>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <GoogleLogin onLogin={onLogin} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 