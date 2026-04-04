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
    return <div className="text-center">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center">No dashboard data available.</div>;
  }

  const { summary, recentActivities } = dashboardData;
  const cardClasses = "bg-card-bg p-6 rounded-lg shadow-sm border border-card-border transition-all duration-300 hover:shadow-md hover:-translate-y-1";

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-main mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-4">Total Tickets</h2>
          <p className="text-4xl font-bold text-blue-600">{summary.totalTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-4">Open Tickets</h2>
          <p className="text-4xl font-bold text-yellow-600">{summary.openTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-4">In Progress</h2>
          <p className="text-4xl font-bold text-purple-600">{summary.inProgressTickets}</p>
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-4">Closed Tickets</h2>
          <p className="text-4xl font-bold text-green-600">{summary.closedTickets}</p>
        </div>
      </div>

      <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-card-border">
        <h2 className="text-xl font-semibold text-text-main mb-4">Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <ul>
            {recentActivities.map((activity) => (
              <li key={activity.id} className="border-b border-card-border py-3 last:border-b-0">
                <span className="font-medium text-text-main">{activity.description}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  ({new Date(activity.timestamp).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
