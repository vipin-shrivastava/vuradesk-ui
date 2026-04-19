import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-uv-bg border-b border-uv-border">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
        <Input
          type="text"
          placeholder="Search tickets, users, etc."
          className="pl-10 pr-3 py-2 bg-white border border-uv-border rounded-sm focus:ring-uv-blue focus:border-uv-blue text-[14px] h-9"
        />
      </div>
      <Button className="bg-uv-blue hover:bg-uv-blue-hover text-white font-semibold rounded-sm px-4 py-2 flex items-center gap-2">
        <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
        New Ticket
      </Button>
    </div>
  );
};

export default DashboardHeader;
