import React from 'react';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';

interface KpiData {
  newTickets?: { value: number; change: string };
  unassignedTickets?: { value: number; change: string };
  avgResolutionTime?: { value: string; change: string };
  openTickets?: { value: number; change: string };
}

interface KpiRibbonProps {
  data?: KpiData;
}

const KpiRibbon: React.FC<KpiRibbonProps> = ({ data }) => {
  const statConfig = [
    { title: 'New Tickets', key: 'newTickets', icon: <TrendingUp className="text-green-500" />, color: 'border-green-500' },
    { title: 'Unassigned Tickets', key: 'unassignedTickets', icon: <AlertCircle className="text-orange-500" />, color: 'border-orange-500' },
    { title: 'Avg. Resolution Time', key: 'avgResolutionTime', icon: <Clock className="text-yellow-500" />, color: 'border-yellow-500' },
    { title: 'Open Tickets', key: 'openTickets', icon: <AlertCircle className="text-blue-500" />, color: 'border-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat) => {
        const statData = data?.[stat.key as keyof KpiData];
        return (
          <div key={stat.key} className={`bg-card p-4 rounded-lg shadow-sm border-l-4 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{statData?.value || 0}</p>
              </div>
              {stat.icon}
            </div>
            {statData?.change && <p className="text-xs text-muted-foreground mt-2">{statData.change} vs last week</p>}
          </div>
        );
      })}
    </div>
  );
};

export default KpiRibbon;
