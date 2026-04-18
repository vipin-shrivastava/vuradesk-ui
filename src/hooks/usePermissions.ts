import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface Permission {
  key: string;
  label: string;
  description?: string;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/admin/permissions');
      setPermissions(response.data || []);
      if (!response.data || response.data.length === 0) {
        setError('No permissions found.');
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setError('Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, error };
};
