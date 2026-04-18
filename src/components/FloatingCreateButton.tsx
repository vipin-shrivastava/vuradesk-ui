import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingCreateButtonProps {
  onClick: () => void;
}

const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-scale-in"
      aria-label="Create new ticket"
      title="Create New Ticket"
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingCreateButton;
