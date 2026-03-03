// src/services/mockDashboardService.ts

interface TicketSummary {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  inProgressTickets: number;
}

interface RecentActivity {
  id: string;
  type: 'ticket_update' | 'ticket_create' | 'agent_assign';
  description: string;
  timestamp: string;
}

interface DashboardData {
  summary: TicketSummary;
  recentActivities: RecentActivity[];
}

const mockDashboardData: DashboardData = {
  summary: {
    totalTickets: 250,
    openTickets: 75,
    closedTickets: 150,
    inProgressTickets: 25,
  },
  recentActivities: [
    { id: '1', type: 'ticket_update', description: 'Ticket #105 updated by Agent Smith', timestamp: '2023-10-27T14:30:00Z' },
    { id: '2', type: 'ticket_create', description: 'New ticket #106 created by Customer Jane', timestamp: '2023-10-27T14:00:00Z' },
    { id: '3', type: 'agent_assign', description: 'Agent John assigned to Ticket #102', timestamp: '2023-10-27T13:45:00Z' },
    { id: '4', type: 'ticket_update', description: 'Ticket #101 status changed to Resolved', timestamp: '2023-10-27T13:00:00Z' },
    { id: '5', type: 'ticket_create', description: 'New ticket #107 created by Customer Bob', timestamp: '2023-10-27T12:15:00Z' },
  ],
};

const fetchDashboardData = (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDashboardData);
    }, 500); // Simulate network delay
  });
};

export default {
  fetchDashboardData,
};
