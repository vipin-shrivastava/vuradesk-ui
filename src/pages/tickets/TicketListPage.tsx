import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets, Ticket } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { AlertCircle, ChevronUp, ChevronsUp, Minus, ShieldAlert, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ServiceUnavailable } from '@/components/illustrations/ServiceUnavailable';
import CreateTicketModal from '@/components/modals/CreateTicketModal';

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

const TicketListPage: React.FC = () => {
  const { tickets, loading, error, refetch, pagination } = useTickets();
  const { activeRole } = useAuth(); // Get activeRole to customize messages
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

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
        <td colSpan={5} className="text-center py-12">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
              <th scope="col" className="w-40 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
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
            All Tickets
          </h1>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="text-white font-bold py-2.5 px-5 rounded-lg transition-colors duration-200 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: 'var(--primary-brand)' }}
          >
            Create Ticket
          </button>
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
