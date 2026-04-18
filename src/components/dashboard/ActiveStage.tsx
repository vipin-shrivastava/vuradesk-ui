import React from 'react';

interface Ticket {
  id: string;
  subject: string;
  // Add other ticket properties as needed
}

interface ActiveStageProps {
  ticket: Ticket | null;
}

const ActiveStage: React.FC<ActiveStageProps> = ({ ticket }) => {
  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full bg-white/70 backdrop-blur-md rounded-lg shadow-sm">
        <p className="text-muted-foreground">Select a ticket to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-sm h-full flex flex-col">
      {/* AI Briefing HUD */}
      <div className="p-4 border-b border-border">
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
          <p className="font-bold">AI Briefing</p>
          <p>This ticket is about a login issue. The user is likely frustrated.</p>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="p-4 flex-grow overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{ticket.subject}</h2>
        <p className="text-sm text-muted-foreground mb-4">{ticket.id}</p>

        {/* Message History Placeholder */}
        <div className="space-y-4">
          <p className="text-muted-foreground">Message history will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveStage;
