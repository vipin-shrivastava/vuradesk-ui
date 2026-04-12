import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/contexts/AuthContext';

export interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  assignedAgentName?: string;
  department?: string;
}

export interface TicketFilters {
  departmentId?: string;
  status?: string;
  priority?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}

export const useTickets = (filter?: 'my-tickets', initialFilters?: TicketFilters) => {
  const { user, activeRole } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>(initialFilters || {});

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTickets = useCallback(async (pageToFetch = 0, currentFilters = filters) => {
    if (!activeRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = '/tickets';
      const params: any = { page: pageToFetch, size: 10 };

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          params[key] = value;
        }
      });

      if (filter === 'my-tickets' && user?.id) {
        url = `/tickets/assigned/${user.id}`;
      }

      const response = await axiosClient.get(url, { params });

      setTickets(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
      setPage(pageToFetch);

    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Service temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeRole, filter, user?.id, filters]);

  useEffect(() => {
    fetchTickets(0, filters);
  }, [activeRole, filter, filters]);

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTickets(newPage);
    }
  };

  const applyFilters = (newFilters: Partial<TicketFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchTickets(0, updatedFilters);
  };

  return {
    tickets,
    loading,
    error,
    refetch: () => fetchTickets(page),
    pagination: {
      page,
      totalPages,
      totalElements,
      goToPage,
    },
    applyFilters,
    filters,
  };
};
