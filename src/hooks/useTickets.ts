import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/contexts/AuthContext';

export interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export const useTickets = () => {
  const { activeRole } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0); // Spring Data JPA pages are 0-indexed
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchTickets = useCallback(async (pageToFetch = 0) => {
    if (!activeRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Pass the page number as a query parameter
      const response = await axiosClient.get('/tickets', {
        params: { page: pageToFetch, size: 10 }, // Assuming a page size of 10
      });

      // Update state with paginated data
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
  }, [activeRole]);

  useEffect(() => {
    // Fetch tickets when the component mounts or when the activeRole changes
    fetchTickets(0); // Reset to first page on role change
  }, [activeRole]); // Only depend on activeRole for re-fetching from page 0

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTickets(newPage);
    }
  };

  return {
    tickets,
    loading,
    error,
    refetch: () => fetchTickets(page), // Refetch the current page
    pagination: {
      page,
      totalPages,
      totalElements,
      goToPage,
    }
  };
};
