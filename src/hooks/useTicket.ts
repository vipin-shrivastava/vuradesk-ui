import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';

export interface ThreadEntry {
  id: string;
  posterFirstName: string;
  posterLastName: string;
  posterId: number; // Add posterId
  posterRole?: string;
  message: string;
  createdAt: string;
  internal: boolean;
}

export interface TicketDetails {
  id: string;
  subject: string;
  description: string;
  customerName: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  threadEntries: ThreadEntry[];
}

export const useTicket = (ticketId?: string) => {
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      console.error(`Failed to fetch ticket ${ticketId}:`, err);

      if (err.response?.status === 403) {
        toast.error("Security", {
          description: `You are not authorized to view Ticket #${ticketId}.`,
        });
        navigate('/tickets', { replace: true });
      } else if (err.response?.status === 500) {
        toast.error("Server Error", {
          description: "The server encountered an error trying to load this ticket.",
        });
        navigate('/tickets', { replace: true });
      } else {
        setError('Failed to load ticket details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigate]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, refetch: fetchTicket, setTicket };
};
