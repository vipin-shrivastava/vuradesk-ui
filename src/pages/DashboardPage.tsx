import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceUnavailable } from '@/components/illustrations/ServiceUnavailable';

interface TicketSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

interface RecentActivity {
  id: string;
  type: string;
  subject: string; // The Fix: Use subject instead of description or generic fallback
  updatedAt: number[] | string; // Handle array or string
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

  // Date helper for Java LocalDateTime arrays
  const formatActivityDate = (dateData: any): string => {
    if (!dateData) return '';
    if (Array.isArray(dateData) && dateData.length >= 5) {
      // new Date(year, monthIndex, day, hours, minutes)
      const [year, month, day, hour, minute] = dateData;
      return new Date(year, month - 1, day, hour, minute).toLocaleString();
    }
    return new Date(dateData).toLocaleString();
  };

  const getDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsResponse = await axiosClient.get('/dashboard/stats');
      const activityResponse = await axiosClient.get('/dashboard/activity');

      const mappedData: DashboardData = {
        summary: {
          total: statsResponse.data.total || 0,
          open: statsResponse.data.open || 0,
          inProgress: statsResponse.data.inProgress || 0,
          resolved: statsResponse.data.resolved || 0,
        },
        // Handle Page object or raw list
        recentActivities: activityResponse.data.content || activityResponse.data || []
      };

      setDashboardData(mappedData);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 404 || err.response?.status === 500) {
          setDashboardData({
              summary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
              recentActivities: []
          });
      } else {
          setError('Failed to fetch dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, [activeRole]);

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center p-8 text-center">
         <ServiceUnavailable />
         <button
           onClick={getDashboardData}
           className="mt-6 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
         >
           Retry
         </button>
       </div>
    );
  }

  const summary = dashboardData?.summary || { total: 0, open: 0, inProgress: 0, resolved: 0 };
  const recentActivities = dashboardData?.recentActivities || [];

  const cardClasses = "bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden";

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Total Tickets</h2>
          {loading ? (
             <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          ) : (
             <p className="text-4xl font-bold text-blue-500 dark:text-blue-400">{summary.total}</p>
          )}
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Open Tickets</h2>
          {loading ? (
             <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          ) : (
             <p className="text-4xl font-bold text-orange-500 dark:text-orange-400">{summary.open}</p>
          )}
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">In Progress</h2>
           {loading ? (
             <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          ) : (
             <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{summary.inProgress}</p>
          )}
        </div>
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400 mb-4">Resolved Tickets</h2>
           {loading ? (
             <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          ) : (
             <p className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">{summary.resolved}</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60 min-h-[200px]">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
        {loading ? (
             <div className="space-y-4 mt-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
             </div>
        ) : recentActivities.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="py-3 group">
                {/* Route Fix: Link directly to the ticket ID */}
                <Link to={`/tickets/${activity.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded transition-colors">
                  <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {/* Title Fix: Use subject */}
                    {activity.subject || `Ticket #${activity.id} updated`}
                  </span>
                  <span className="text-slate-500 dark:text-slate-500 text-sm ml-2">
                    {/* Date Fix: Use formatActivityDate */}
                    ({formatActivityDate(activity.updatedAt)})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 dark:text-slate-500 mt-4">No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
