import React from 'react';
import { Board } from '../types';

interface BoardNavigationProps {
  boards: Board[];
  currentBoardId: string;
  onBoardChange: (boardId: string) => void;
}

const BoardNavigation: React.FC<BoardNavigationProps> = ({
  boards,
  currentBoardId,
  onBoardChange,
}) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-20">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto py-3">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => onBoardChange(board.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${
                  currentBoardId === board.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              aria-current={currentBoardId === board.id ? 'page' : undefined}
            >
              {board.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BoardNavigation; 