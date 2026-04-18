import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Download, Search } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <Button>
        <Plus className="mr-2 h-4 w-4" /> New Ticket
      </Button>
      <Button variant="outline">
        <UserPlus className="mr-2 h-4 w-4" /> Invite Agent
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" /> Export Data
      </Button>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <input
          type="text"
          placeholder="Search Knowledge Base..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
        />
      </div>
    </div>
  );
};

export default QuickActions;
