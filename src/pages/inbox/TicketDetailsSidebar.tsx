import React, { useState, useEffect } from 'react';
import { useTicket } from '@/hooks/useTicket';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { formatBackendDate } from '@/utils/dateUtils';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

const TicketDetailsSidebar: React.FC = () => {
  const { ticket, setTicket } = useTicket(); // Use useTicket without ticketId to get shared context
  const { user, activeRole } = useAuth();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const isCustomer = activeRole === 'CUSTOMER';

  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const response = await axiosClient.get('/users/list/agents-admins');
        setAgents(response.data.content || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        toast.error('Failed to load agents for assignment.');
      } finally {
        setAgentsLoading(false);
      }
    };

    if ((activeRole === 'ADMIN' || activeRole === 'AGENT') && ticket) {
      fetchAgents();
    }
  }, [activeRole, ticket]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await axiosClient.patch(`/tickets/${ticket.id}/status`, { status: newStatus });
      setTicket(prev => prev ? { ...prev, status: response.data.status } : null);
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      toast.error('Failed to update ticket status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignAgent = async (value: string) => {
    if (!ticket || isAssigning) return;

    setIsAssigning(true);
    try {
      const userIdToSend = value === "unassigned" ? null : value;
      const response = await axiosClient.patch(`/tickets/${ticket.id}/assign`, { userId: userIdToSend });
      setTicket(prev => prev ? { ...prev, ...response.data } : null);
      if (value === "unassigned") {
        toast.success('Ticket unassigned successfully!');
      } else {
        const agent = agents.find(a => a.id === value);
        toast.success(`Ticket assigned to ${agent?.firstName} ${agent?.lastName}`);
      }
    } catch (err) {
      console.error('Failed to assign agent:', err);
      toast.error('Failed to assign agent. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500 hover:bg-green-600';
      case 'IN_PROGRESS': return 'bg-blue-500 hover:bg-blue-600';
      case 'RESOLVED': return 'bg-purple-500 hover:bg-purple-600';
      case 'CLOSED': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  if (!ticket) {
    return <div className="p-6 text-center text-muted-foreground">No ticket selected.</div>;
  }

  return (
    <aside className="w-full bg-card-bg shadow-sm border-l border-card-border p-6 shrink-0 h-full overflow-y-auto">
      {!isCustomer && (
        <Button className="w-full mb-6 font-bold" style={{ backgroundColor: 'var(--primary-brand)' }}>
          Draft AI Response
        </Button>
      )}
      <h3 className="text-lg font-semibold mb-4 border-b border-card-border pb-2">Ticket Details</h3>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <label className="text-slate-600 dark:text-slate-400">Ticket ID</label>
          <span className="font-semibold text-slate-900 dark:text-white">#{ticket.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-slate-600 dark:text-slate-400">Status</label>
          {activeRole !== 'CUSTOMER' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  className={`cursor-pointer ${getStatusBadgeColor(ticket.status)} text-white px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200`}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-white dark:bg-slate-800 border border-card-border rounded-md shadow-lg z-50">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="cursor-pointer px-4 py-2 text-sm text-text-main hover:bg-slate-100 dark:hover:bg-slate-700"
                    disabled={isUpdatingStatus || ticket.status === status}
                  >
                    {status.replace('_', ' ')}
                  </DropdownMenuItem>
                ))}
                {activeRole === 'ADMIN' && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('CLOSED')}
                    className="cursor-pointer px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={isUpdatingStatus || ticket.status === 'CLOSED'}
                  >
                    CLOSED
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-white">{ticket.status}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-slate-600 dark:text-slate-400">Priority</label>
          <span className="font-semibold text-slate-900 dark:text-white">{ticket.priority}</span>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-slate-600 dark:text-slate-400">Department</label>
          <span className="font-semibold text-slate-900 dark:text-white">{ticket.department}</span>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-slate-600 dark:text-slate-400">Created</label>
          <span className="font-semibold text-slate-900 dark:text-white">{formatBackendDate(ticket.createdAt as any)}</span>
        </div>

        {(activeRole === 'ADMIN' || activeRole === 'AGENT') && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="assignee" className="text-slate-600 dark:text-slate-400">Assignee</label>
            </div>
            <Select
              onValueChange={handleAssignAgent}
              value={ticket.assignedAgentId || "unassigned"}
              disabled={isAssigning || agentsLoading}
            >
              <SelectTrigger id="assignee" className="w-full bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700">
                <SelectValue placeholder={agentsLoading ? "Loading..." : "Unassigned"}>
                  {ticket.assignedAgentName || (agentsLoading ? "Loading..." : "Unassigned")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                {!agentsLoading && (
                  <>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents?.filter(a => a.id).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.id === user?.id ? `${agent.firstName} ${agent.lastName} (You)` : `${agent.firstName} ${agent.lastName}`}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TicketDetailsSidebar;
