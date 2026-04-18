import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { useSharedTicket } from '@/contexts/TicketContext'; // Import useSharedTicket
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  downloadUrl: string;
}

export interface ThreadEntry {
  id: string;
  posterFirstName: string;
  posterLastName: string;
  posterId: number;
  posterRole?: string;
  message: string;
  createdAt: string;
  internal: boolean;
  attachments: Attachment[];
}

export interface TicketDetails {
  id:string;
  subject: string;
  description: string;
  customerName: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  department: string;
  threadEntries: ThreadEntry[];
  attachments: Attachment[];
}

export const useTicket = (ticketId?: string) => {
  const { ticket: sharedTicket, setTicket: setSharedTicket, isSwitchingRole } = useSharedTicket();
  const { activeRole } = useAuth(); // Get activeRole
  const [localTicket, setLocalTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ticket = sharedTicket ?? localTicket;
  const setTicket = setSharedTicket ?? setLocalTicket;

  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      setError("No ticket ID provided.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (err: any) {
      // If a role switch is in progress and it's a 403, ignore the error
      if (isSwitchingRole && err.response?.status === 403) {
        console.warn(`Ignoring 403 during role switch for ticket ${ticketId}`);
        return;
      }

      console.error(`Failed to fetch ticket ${ticketId}:`, err);

      const isCustomer = activeRole === 'CUSTOMER';
      const redirectPath = isCustomer ? '/inbox' : '/tickets';

      if (err.response?.status === 403) {
        toast.error("Security", {
          description: `You are not authorized to view Ticket #${ticketId}.`,
        });
        navigate(redirectPath, { replace: true });
      } else if (err.response?.status === 500) {
        toast.error("Server Error", {
          description: "The server encountered an error trying to load this ticket.",
        });
        navigate(redirectPath, { replace: true });
      } else {
        setError('Failed to load ticket details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigate, setTicket, isSwitchingRole, activeRole]); // Add activeRole to dependencies

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, refetch: fetchTicket, setTicket };
};
