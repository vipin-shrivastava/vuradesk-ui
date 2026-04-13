import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface Agent {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  enabled: boolean;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/users/list/staff');
      setAgents(response.data);
    } catch (err: any) {
      console.error('Failed to fetch agents:', err);
      if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load staff members.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, setAgents, loading, error, refetch: fetchAgents };
};
