import React, { useState, useEffect } from 'react';
import mockDashboardService from '../services/mockDashboardService';
import RoleDropdown from '@/components/RoleDropdown'; // Import the RoleDropdown component
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth to get user info

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
  const { activeRole } = useAuth(); // Get the active role
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
  }, [activeRole]); // Re-fetch data if the activeRole changes

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl text-gray-700">No dashboard data available.</p>
      </div>
    );
  }

  const { summary, recentActivities } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            {activeRole && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Viewing as: <strong>{activeRole}</strong>
              </span>
            )}
          </div>
          <RoleDropdown />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Tickets</h2>
            <p className="text-4xl font-bold text-blue-600">{summary.totalTickets}</p>

          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Open Tickets</h2>
            <p className="text-4xl font-bold text-yellow-600">{summary.openTickets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">In Progress</h2>
            <p className="text-4xl font-bold text-purple-600">{summary.inProgressTickets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Closed Tickets</h2>
            <p className="text-4xl font-bold text-green-600">{summary.closedTickets}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
          {recentActivities.length > 0 ? (
            <ul>
              {recentActivities.map((activity) => (
                <li key={activity.id} className="border-b border-gray-200 py-2 last:border-b-0">
                  <span className="font-medium">{activity.description}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({new Date(activity.timestamp).toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
