import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  agentId?: string;
  requesterId: string;
  createdAt: string;
  updatedAt: string;
  // Add other relevant ticket fields as per API response
}

export interface TicketSearchResponse {
  content: Ticket[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TicketSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

// Dummy data for tickets
const DUMMY_TICKETS: Ticket[] = [
  { id: 'VD-001', subject: 'Printer not connecting to network', status: 'OPEN', priority: 'HIGH', requesterId: 'user1', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'VD-002', subject: 'Software installation issue on new laptop', status: 'IN_PROGRESS', priority: 'MEDIUM', agentId: 'agent1', requesterId: 'user2', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'VD-003', subject: 'Email client configuration help', status: 'OPEN', priority: 'LOW', requesterId: 'user3', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
  { id: 'VD-004', subject: 'System crash after update', status: 'OPEN', priority: 'URGENT', requesterId: 'user4', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.2).toISOString() },
  { id: 'VD-005', subject: 'Request for new user account', status: 'RESOLVED', priority: 'LOW', agentId: 'agent2', requesterId: 'user5', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'VD-006', subject: 'Monitor flickering intermittently', status: 'IN_PROGRESS', priority: 'MEDIUM', agentId: 'agent3', requesterId: 'user6', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'VD-007', subject: 'Cannot access shared drive', status: 'OPEN', priority: 'HIGH', requesterId: 'user7', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.8).toISOString() },
  { id: 'VD-008', subject: 'Password reset for VPN', status: 'CLOSED', priority: 'LOW', agentId: 'agent1', requesterId: 'user8', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'VD-009', subject: 'Application X not launching', status: 'OPEN', priority: 'MEDIUM', requesterId: 'user9', createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.05).toISOString() },
  { id: 'VD-010', subject: 'New printer setup request', status: 'OPEN', priority: 'LOW', requesterId: 'user10', createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 0.1).toISOString() },
  { id: 'VD-011', subject: 'VPN connection dropping', status: 'IN_PROGRESS', priority: 'HIGH', agentId: 'agent2', requesterId: 'user11', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'VD-012', subject: 'Mouse not responding', status: 'RESOLVED', priority: 'LOW', agentId: 'agent3', requesterId: 'user12', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
];

export const fetchTicketSummary = async (): Promise<TicketSummary> => {
  try {
    console.log('Attempting to fetch ticket summary from API...');
    const response = await axios.get<TicketSearchResponse>(`${API_BASE_URL}/api/tickets/search`, {
      params: {
        page: 0,
        size: 1000,
      },
    });
    console.log('Successfully fetched ticket summary from API.');
    const tickets = response.data.content;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(ticket => ticket.status === 'OPEN').length;
    const inProgressTickets = tickets.filter(ticket => ticket.status === 'IN_PROGRESS').length;
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'RESOLVED').length;
    const closedTickets = tickets.filter(ticket => ticket.status === 'CLOSED').length;

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    };
  } catch (error) {
    console.error('Error fetching ticket summary from API, using dummy data:', error);
    // Fallback to dummy data if API call fails
    const totalTickets = DUMMY_TICKETS.length;
    const openTickets = DUMMY_TICKETS.filter(ticket => ticket.status === 'OPEN').length;
    const inProgressTickets = DUMMY_TICKETS.filter(ticket => ticket.status === 'IN_PROGRESS').length;
    const resolvedTickets = DUMMY_TICKETS.filter(ticket => ticket.status === 'RESOLVED').length;
    const closedTickets = DUMMY_TICKETS.filter(ticket => ticket.status === 'CLOSED').length;

    const dummySummary = {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    };
    console.log('Returning dummy ticket summary:', dummySummary);
    return dummySummary;
  }
};

export const fetchTickets = async (
  page: number = 0,
  size: number = 10,
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
): Promise<TicketSearchResponse> => {
  try {
    console.log(`Attempting to fetch tickets from API (page: ${page}, size: ${size})...`);
    const params: any = { page, size };
    if (status) params.status = status;
    if (priority) params.priority = priority;

    const response = await axios.get<TicketSearchResponse>(`${API_BASE_URL}/api/tickets/search`, {
      params,
    });
    console.log('Successfully fetched tickets from API.');
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets from API, using dummy data:', error);
    // Fallback to dummy data if API call fails
    let filteredTickets = DUMMY_TICKETS;

    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    const start = page * size;
    const end = start + size;
    const paginatedTickets = filteredTickets.slice(start, end);

    const dummyResponse = {
      content: paginatedTickets,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: { empty: true, sorted: false, unsorted: true },
        offset: start,
        paged: true,
        unpaged: false,
      },
      last: end >= filteredTickets.length,
      totalPages: Math.ceil(filteredTickets.length / size),
      totalElements: filteredTickets.length,
      size: size,
      number: page,
      sort: { empty: true, sorted: false, unsorted: true },
      first: page === 0,
      numberOfElements: paginatedTickets.length,
      empty: paginatedTickets.length === 0,
    };
    console.log('Returning dummy tickets:', dummyResponse);
    return dummyResponse;
  }
};
