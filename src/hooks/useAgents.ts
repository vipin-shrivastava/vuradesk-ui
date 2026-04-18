import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  enabled: boolean;
  phone?: string;
  street?: string;
  city?: string;
  pin?: string;
  state?: string;
  profilePictureUrl?: string;
  // New fields for permissions and groups
  directPermissions: string[];
  assignedGroupIds: string[];
  inheritedPermissions: { [key: string]: string[] }; // Map of permission ID to source labels
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/users/list/agents-admins'); // Corrected endpoint
      // Assuming the API now returns directPermissions, assignedGroupIds, and inheritedPermissions
      // If not, these would need to be fetched separately or mocked.
      const fetchedAgents: Agent[] = response.data.content.map((agent: any) => ({
        ...agent,
        directPermissions: agent.directPermissions || [],
        assignedGroupIds: agent.assignedGroupIds || [],
        inheritedPermissions: agent.inheritedPermissions || {},
      }));
      setAgents(fetchedAgents);
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
