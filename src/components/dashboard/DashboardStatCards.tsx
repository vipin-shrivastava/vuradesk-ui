import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Hourglass, CheckCircle, XCircle } from 'lucide-react';
// import { cn } from '@/lib/utils'; // cn utility is no longer needed here

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <Card className="rounded-sm border border-uv-border shadow-sm bg-light-gray"> {/* Reverted background and border-t-4 */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-500 mt-1">Tickets</p>
      </CardContent>
    </Card>
  );
};

interface DashboardStatCardsProps {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  closedTickets: number;
}

const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  totalTickets,
  openTickets,
  inProgressTickets,
  closedTickets,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4"> {/* Reverted p-4 */}
      <StatCard title="Total Tickets" value={totalTickets} icon={Ticket} colorClass="text-blue-500" />
      <StatCard title="Open Tickets" value={openTickets} icon={Hourglass} colorClass="text-yellow-500" />
      <StatCard title="In Progress" value={inProgressTickets} icon={CheckCircle} colorClass="text-purple-500" />
      <StatCard title="Closed Tickets" value={closedTickets} icon={XCircle} colorClass="text-green-500" />
    </div>
  );
};

export default DashboardStatCards;
