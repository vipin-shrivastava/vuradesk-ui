import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets, Ticket, TicketFilters } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ChevronUp, ChevronsUp, Minus, ShieldAlert, RotateCw, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { ServiceUnavailable } from '@/components/illustrations/ServiceUnavailable';
import CreateTicketModal from '@/components/modals/CreateTicketModal';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/utils/getInitials';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosClient from '@/api/axiosClient';

const statusStyles: { [key: string]: string } = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/50',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 dark:ring-1 dark:ring-yellow-500/50',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 dark:ring-1 dark:ring-green-500/50',
};

const priorityIcons: { [key: string]: React.ReactNode } = {
  LOW: <Minus className="text-slate-500" size={20} />,
  MEDIUM: <ChevronUp className="text-yellow-500" size={20} />,
  HIGH: <ChevronsUp className="text-orange-500" size={20} />,
  URGENT: <ShieldAlert className="text-red-500" size={20} />,
};

const formatBackendDate = (dateArray: string | number[]): string => {
  if (Array.isArray(dateArray) && dateArray.length >= 6) {
    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString();
  }
  return new Date(dateArray as string).toLocaleDateString();
};

const departmentColors = [
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
];
const getDepartmentColor = (deptName: string) => {
  if (!deptName) return 'bg-gray-500';
  let hash = 0;
  for (let i = 0; i < deptName.length; i++) {
    hash = deptName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return departmentColors[Math.abs(hash) % departmentColors.length];
};

interface TicketListPageProps {
  filter?: 'my-tickets';
}

const TicketListPage: React.FC<TicketListPageProps> = ({ filter }) => {
  const { tickets, loading, error, refetch, pagination, applyFilters, filters } = useTickets(filter);
  const { activeRole } = useAuth();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosClient.get('/public/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSort = (sort: string) => {
    const dir = filters.sort === sort && filters.dir === 'asc' ? 'desc' : 'asc';
    applyFilters({ sort, dir });
  };

  const renderSortIcon = (column: string) => {
    if (filters.sort !== column) return <ArrowUpDown className="h-4 w-4" />;
    if (filters.dir === 'asc') return <ChevronUp className="h-4 w-4" />;
    return <ChevronsUp className="h-4 w-4" />;
  };

  const renderPagination = () => {
    if (loading || error || !pagination || pagination.totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Page {pagination.page + 1} of {pagination.totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => pagination.goToPage(pagination.page - 1)}
            disabled={pagination.page === 0}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft size={20} className="dark:text-slate-300" />
          </button>
          <button
            onClick={() => pagination.goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight size={20} className="dark:text-slate-300" />
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    const isCustomer = activeRole === 'CUSTOMER';
    const message = isCustomer
      ? "You haven't created any tickets yet."
      : "No tickets found for the current filter.";
    const subMessage = isCustomer
      ? "Click 'Create Ticket' to get started."
      : "Try adjusting your filters or switch roles to see more.";

    return (
      <tr>
        <td colSpan={7} className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{message}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subMessage}</p>
        </td>
      </tr>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-8 dark:text-slate-400">Loading tickets...</div>;
    if (error) return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ServiceUnavailable />
        <button
          onClick={() => refetch()}
          className="mt-6 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Retry
        </button>
      </div>
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('subject')}>
                <div className="flex items-center">
                  Subject {renderSortIcon('subject')}
                </div>
              </th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center">
                  Created At {renderSortIcon('createdAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
            {tickets && tickets.length > 0 ? tickets.map((ticket: Ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium align-middle">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono">
                    #{ticket.id}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-200 truncate align-middle">
                  <Link to={`/tickets/${ticket.id}`} className="hover:text-primary-brand transition-colors cursor-pointer">
                    {ticket.subject}
                  </Link>
                </td>
                <td className="px-6 py-3 whitespace-nowrap align-middle">
                  {ticket.department && (
                    <Badge
                      className={`text-white ${getDepartmentColor(ticket.department)}`}
                    >
                      {ticket.department}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-3 whitespace-nowrap align-middle">
                  {ticket.assignedAgentName ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white mr-2">
                        {getInitials(ticket.assignedAgentName)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {ticket.assignedAgentName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-3 whitespace-nowrap align-middle">
                  <span className={`px-2 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-full ${statusStyles[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 align-middle">
                  <div className="flex items-center">
                    {priorityIcons[ticket.priority]}
                    <span className="ml-2 hidden sm:inline">{ticket.priority}</span>
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 align-middle">
                  {formatBackendDate(ticket.createdAt as any)}
                </td>
              </tr>
            )) : renderEmptyState()}
          </tbody>
        </table>
        {renderPagination()}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {filter === 'my-tickets' ? 'My Tickets' : 'All Tickets'}
          </h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="text-white font-bold py-2.5 px-5 rounded-lg transition-colors duration-200 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: 'var(--primary-brand)' }}
          >
            Create Ticket
          </button>
        </div>
        <div className="sticky top-0 bg-white dark:bg-slate-900 py-4 z-10">
          <div className="flex items-center space-x-4">
            <Select onValueChange={(value) => applyFilters({ departmentId: value })} value={filters.departmentId || 'ALL'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => applyFilters({ status: value })} value={filters.status || 'ALL'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => applyFilters({ priority: value })} value={filters.priority || 'ALL'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {renderContent()}
      </div>
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTicketCreated={() => refetch()}
      />
    </>
  );
};

export default TicketListPage;
