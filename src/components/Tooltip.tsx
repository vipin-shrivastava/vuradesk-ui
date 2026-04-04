import React, { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative group flex items-center">
      {children}
      <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-md
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
