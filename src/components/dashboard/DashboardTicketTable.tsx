import React from 'react';
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

interface Ticket {
  id: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

const mockTickets: Ticket[] = [
  { id: 'VD-001', subject: 'Printer not connecting to network', priority: 'HIGH', status: 'OPEN' },
  { id: 'VD-002', subject: 'Software installation issue on new laptop', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 'VD-003', subject: 'Email client configuration help', priority: 'LOW', status: 'OPEN' },
  { id: 'VD-004', subject: 'System crash after update', priority: 'URGENT', status: 'OPEN' },
  { id: 'VD-005', subject: 'Request for new user account', priority: 'LOW', status: 'RESOLVED' },
  { id: 'VD-006', subject: 'Monitor flickering intermittently', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 'VD-007', subject: 'Cannot access shared drive', priority: 'HIGH', status: 'OPEN' },
  { id: 'VD-008', subject: 'Password reset for VPN', priority: 'LOW', status: 'CLOSED' },
];

// New, cleaner Priority indicator
const PriorityIndicator = ({ priority }: { priority: Ticket['priority'] }) => {
  const priorityConfig = {
    LOW: { color: 'bg-green-500', text: 'Low' },
    MEDIUM: { color: 'bg-yellow-500', text: 'Medium' },
    HIGH: { color: 'bg-orange-500', text: 'High' },
    URGENT: { color: 'bg-red-500', text: 'Urgent' },
  };

  const { color, text } = priorityConfig[priority] || { color: 'bg-gray-400', text: 'Unknown' };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-slate-700">{text}</span>
    </div>
  );
};

// Updated, softer Status badges
const getStatusBadge = (status: Ticket['status']) => {
  switch (status) {
    case 'OPEN':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 rounded-sm flex items-center gap-1"><CircleDotDashed className="h-3 w-3" /> Open</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 rounded-sm flex items-center gap-1"><ArrowUpCircle className="h-3 w-3" /> In Progress</Badge>;
    case 'RESOLVED':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 rounded-sm flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>;
    case 'CLOSED':
      return <Badge variant="outline" className="bg-gray-200 text-gray-800 border-gray-300 rounded-sm flex items-center gap-1"><XCircle className="h-3 w-3" /> Closed</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-200 text-gray-800 border-gray-300 rounded-sm">Unknown</Badge>;
  }
};

const DashboardTicketTable: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Tickets</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-uv-bg hover:bg-uv-bg">
            <TableHead className="w-[100px] text-slate-700 font-semibold rounded-tl-sm" style={{ padding: '12px 16px' }}>ID</TableHead>
            <TableHead className="text-slate-700 font-semibold" style={{ padding: '12px 16px' }}>Subject</TableHead>
            <TableHead className="w-[120px] text-slate-700 font-semibold" style={{ padding: '12px 16px' }}>Priority</TableHead>
            <TableHead className="w-[150px] text-slate-700 font-semibold rounded-tr-sm" style={{ padding: '12px 16px' }}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTickets.map((ticket) => (
            <TableRow key={ticket.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-slate-800">{ticket.id}</TableCell>
              <TableCell className="text-slate-700">{ticket.subject}</TableCell>
              <TableCell>
                <PriorityIndicator priority={ticket.priority} />
              </TableCell>
              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashboardTicketTable;
