import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Ticket {
  id: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low' | 'URGENT';
  status: string;
  createdAt: number[];
  assigneeId?: string;
  customerName: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface TicketWorkloadProps {
  data?: Ticket[];
  onTicketSelect: (ticket: Ticket) => void;
}

const getInitials = (name: string) => {
  if (!name) return '??';
  const names = name.split(' ');
  return names.map((n) => n[0]).join('');
};

const getSentimentGlow = (sentiment: Ticket['sentiment']) => {
  switch (sentiment) {
    case 'positive':
      return 'shadow-[0_0_15px_rgba(74,222,128,0.5)]';
    case 'negative':
      return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    default:
      return '';
  }
};

const TicketWorkload: React.FC<TicketWorkloadProps> = ({ data = [], onTicketSelect }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTickets = () => {
    switch (activeTab) {
      case 'my-tasks':
        return [];
      case 'critical':
        return data.filter(ticket => ticket.priority === 'High' || ticket.priority === 'URGENT');
      case 'all':
      default:
        return data;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-sm h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4 h-full flex flex-col">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="flex-grow overflow-y-auto mt-4">
          <div className="space-y-4">
            {filteredTickets().map(ticket => (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50/50 active:scale-[0.98] ${getSentimentGlow(ticket.sentiment)}`}
                onClick={() => onTicketSelect(ticket)}
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-4">
                    <AvatarFallback>{getInitials(ticket.customerName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-bold">{ticket.subject}</p>
                    <p className="text-sm text-slate-500">{ticket.id}</p>
                  </div>
                  <Badge variant={ticket.priority === 'High' || ticket.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketWorkload;
