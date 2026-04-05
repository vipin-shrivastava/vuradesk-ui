import React, { useState, useEffect } from 'react';
import mockDashboardService from '../services/mockDashboardService';
import { useAuth } from '@/contexts/AuthContext';

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

const DashboardPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        const data = await mockDashboardService.fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [activeRole]);

  if (loading) {
    return <div className="text-center p-8">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400">No dashboard data available.</div>;
  }

  const { summary, recentActivities } = dashboardData;
  const cardClasses = "bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60 transition-all duration-300 hover:shadow-md hover:-translate-y-1";

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Total Tickets</h2>
          <p className="text-4xl font-bold text-blue-500 dark:text-blue-400">{summary.totalTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Open Tickets</h2>
          <p className="text-4xl font-bold text-orange-500 dark:text-orange-400">{summary.openTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">In Progress</h2>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{summary.inProgressTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Closed Tickets</h2>
          <p className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">{summary.closedTickets}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="py-3">
                <span className="font-medium text-slate-900 dark:text-slate-200">{activity.description}</span>
                <span className="text-slate-500 dark:text-slate-500 text-sm ml-2">
                  ({new Date(activity.timestamp).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 dark:text-slate-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
