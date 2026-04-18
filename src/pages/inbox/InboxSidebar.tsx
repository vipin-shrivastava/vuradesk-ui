import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react'; // Import Maximize2 and Minimize2
import TicketConversationPane from './TicketConversationPane';
import TicketDetailsSidebar from './TicketDetailsSidebar'; // Import the new sidebar component

interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  sentiment: 'frustrated' | 'happy' | 'neutral';
  assigneeId?: string;
}

const InboxSidebar: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false); // New state for maximize/restore
  const [popoutTicketId, setPopoutTicketId] = useState<string | undefined>(undefined); // State to hold the ID of the ticket in the pop-out
  const isCustomer = activeRole === 'CUSTOMER';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosClient.get('/tickets');
        setTickets(response.data.content);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;
    if (activeTab === 'my') {
      filtered = tickets.filter(ticket => ticket.assigneeId === user?.id);
    } else if (activeTab === 'unassigned') {
      filtered = tickets.filter(ticket => !ticket.assigneeId);
    }
    setFilteredTickets(filtered);
  }, [tickets, activeTab, user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const handleDoubleClick = (id: string) => {
    setPopoutTicketId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsMaximized(false); // Reset maximize state when closing
    setPopoutTicketId(undefined); // Clear popout ticket ID
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  const modalWidthClass = isMaximized ? 'w-screen' : 'w-[90vw]';
  const modalHeightClass = isMaximized ? 'h-screen' : 'h-[90vh]';

  return (
    <>
      <div className="w-80 shrink-0 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 shrink-0">
          <h2 className="text-lg font-semibold">Inbox</h2>
        </div>
        {!isCustomer && (
          <div className="px-4 shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my">My</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
        <ul className="overflow-y-auto flex-grow">
          {filteredTickets.length === 0 ? (
            <li className="p-4 text-center text-muted-foreground">No tickets found.</li>
          ) : (
            filteredTickets.map(ticket => {
              const isActive = ticket.id.toString() === ticketId;
              const sentimentColor = ticket.sentiment === 'frustrated' ? 'bg-red-500' : ticket.sentiment === 'happy' ? 'bg-green-500' : 'bg-gray-400';

              return (
                <li key={ticket.id} onDoubleClick={() => handleDoubleClick(ticket.id)}>
                  <Link
                    to={`/inbox/${ticket.id}`}
                    className={`block p-3 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{ticket.subject}</div>
                      <div className={`w-1.5 h-6 rounded-full ${sentimentColor}`}></div>
                    </div>
                    <div className="text-sm text-slate-500">{ticket.customerName}</div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {isModalOpen && popoutTicketId && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-slate-900 ${modalWidthClass} ${modalHeightClass} rounded-lg shadow-2xl flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold">Ticket #{popoutTicketId}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMaximize} aria-label={isMaximized ? "Restore" : "Maximize"}>
                  {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Close">
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="flex-grow grid grid-cols-4"> {/* 75%/25% grid */}
              <div className="col-span-3">
                <TicketConversationPane popoutTicketId={popoutTicketId} isModal={true} />
              </div>
              <div className="col-span-1">
                <TicketDetailsSidebar />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InboxSidebar;
