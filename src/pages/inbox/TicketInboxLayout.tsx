import React from 'react';
import { Outlet } from 'react-router-dom';
import InboxSidebar from './InboxSidebar';

const TicketInboxLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <InboxSidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default TicketInboxLayout;
