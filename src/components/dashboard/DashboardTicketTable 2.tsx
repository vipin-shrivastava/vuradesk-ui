import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, CircleDotDashed, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket, fetchTickets } from '@/services/ticketService'; // Import Ticket interface and fetchTickets

const getPriorityBadge = (priority: Ticket['priority']) => {
  const baseClasses = "text-xs px-1 py-0.5 rounded-sm font-medium";
  switch (priority) {
    case 'URGENT':
      return <Badge className={`${baseClasses} bg-red-500 hover:bg-red-600 text-white`}>Urgent</Badge>;
    case 'HIGH':
      return <Badge className={`${baseClasses} bg-orange-500 hover:bg-orange-600 text-white`}>High</Badge>;
    case 'MEDIUM':
      return <Badge className={`${baseClasses} bg-yellow-500 hover:bg-yellow-600 text-gray-900`}>Medium</Badge>;
    case 'LOW':
      return <Badge className={`${baseClasses} bg-green-500 hover:bg-green-600 text-white`}>Low</Badge>;
    default:
      return <Badge className={`${baseClasses} bg-gray-400 hover:bg-gray-500 text-white`}>Unknown</Badge>;
  }
};

const getStatusBadge = (status: Ticket['status']) => {
  const baseClasses = "text-xs px-1 py-0.5 rounded-sm font-medium flex items-center gap-1";
  const iconClasses = "h-3 w-3";
  let badgeColorClass = "";
  let icon = null;
  let statusText = "";

  switch (status) {
    case 'OPEN':
      badgeColorClass = "bg-blue-500 hover:bg-blue-600 text-white";
      icon = <CircleDotDashed className={iconClasses} strokeWidth={1.5} />;
      statusText = "Open";
      break;
    case 'IN_PROGRESS':
      badgeColorClass = "bg-purple-500 hover:bg-purple-600 text-white";
      icon = <ArrowUpCircle className={iconClasses} strokeWidth={1.5} />;
      statusText = "In Progress";
      break;
    case 'RESOLVED':
      badgeColorClass = "bg-green-500 hover:bg-green-600 text-white";
      icon = <CheckCircle2 className={iconClasses} strokeWidth={1.5} />;
      statusText = "Resolved";
      break;
    case 'CLOSED':
      badgeColorClass = "bg-gray-500 hover:bg-gray-600 text-white";
      icon = <XCircle className={iconClasses} strokeWidth={1.5} />;
      statusText = "Closed";
      break;
    default:
      badgeColorClass = "bg-gray-400 hover:bg-gray-500 text-white";
      statusText = "Unknown";
      break;
  }

  return (
    <Badge className={`${baseClasses} ${badgeColorClass}`}>
      {icon} {statusText}
    </Badge>
  );
};

const DashboardTicketTable: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10; // Define page size for the table

  useEffect(() => {
    const getTickets = async () => {
      try {
        setLoading(true);
        const response = await fetchTickets(currentPage, pageSize);
        setTickets(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        setError('Failed to fetch tickets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTickets();
  }, [currentPage]); // Refetch when currentPage changes

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm flex items-center justify-center h-48">
        <p className="text-slate-700">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm flex items-center justify-center h-48">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm border border-uv-border shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 p-3">Recent Tickets</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-uv-bg">
            <TableHead className="text-slate-700 font-semibold rounded-tl-sm h-8 px-3 text-xs">ID</TableHead>
            <TableHead className="text-slate-700 font-semibold h-8 px-3 text-xs">Subject</TableHead>
            <TableHead className="text-slate-700 font-semibold h-8 px-3 text-xs">Priority</TableHead>
            <TableHead className="text-slate-700 font-semibold rounded-tr-sm h-8 px-3 text-xs">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-slate-800 py-2 px-3 text-sm">{ticket.id}</TableCell>
                <TableCell className="text-slate-700 py-2 px-3 text-sm">{ticket.subject}</TableCell>
                <TableCell className="py-2 px-3">{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell className="py-2 px-3">{getStatusBadge(ticket.status)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                No tickets found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center p-3 border-t border-uv-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="rounded-sm"
        >
          Previous
        </Button>
        <span className="text-sm text-slate-700">
          Page {currentPage + 1} of {totalPages} ({totalElements} tickets)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          className="rounded-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DashboardTicketTable;
