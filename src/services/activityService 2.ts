import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Activity {
  id: string;
  type: 'TICKET_CREATED' | 'TICKET_UPDATED' | 'AGENT_ASSIGNED' | 'MESSAGE_SENT'; // Example types
  description: string;
  timestamp: string;
  ticketId?: string; // Optional: if activity relates to a ticket
  agentId?: string; // Optional: if activity relates to an agent
}

export const fetchRecentActivities = async (limit: number = 10): Promise<Activity[]> => {
  try {
    // Assuming a backend endpoint for recent activities.
    // If not available, this would need to be derived from other data,
    // e.g., by fetching recent ticket updates.
    const response = await axios.get<Activity[]>(`${API_BASE_URL}/api/activities/recent`, {
      params: {
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    // For now, return mock data on error or if API is not yet implemented
    return [
      { id: 'act-001', type: 'TICKET_CREATED', description: 'Ticket VD-009 created by John Doe', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'act-002', type: 'AGENT_ASSIGNED', description: 'Agent Jane Smith assigned to VD-001', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'act-003', type: 'TICKET_UPDATED', description: 'Ticket VD-002 status changed to In Progress', timestamp: new Date(Date.now() - 10800000).toISOString() },
      { id: 'act-004', type: 'MESSAGE_SENT', description: 'New message added to Ticket VD-003', timestamp: new Date(Date.now() - 14400000).toISOString() },
      { id: 'act-005', type: 'TICKET_CREATED', description: 'Ticket VD-010 created by Alice Brown', timestamp: new Date(Date.now() - 18000000).toISOString() },
    ];
  }
};
