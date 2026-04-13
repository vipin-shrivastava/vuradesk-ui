import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/roles');
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, setRoles, loading, error, refetch: fetchRoles };
};
