import React, { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="light bg-slate-50 min-h-screen">
      {children}
    </div>
  );
};

export default PublicLayout;
