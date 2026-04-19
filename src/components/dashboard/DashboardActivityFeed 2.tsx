import React, { useState, useEffect } from 'react';
import { fetchRecentActivities, Activity } from '@/services/activityService'; // Import the new service and interface

const DashboardActivityFeed: React.FC = () => {
  const [recentActivities, setRecentActivities] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentActivities(); // Use the new service
        setRecentActivities(data);
      } catch (err) {
        setError('Failed to fetch recent activities.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-slate-700">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-sm border border-uv-border shadow-sm h-full">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
      {recentActivities && recentActivities.length > 0 ? (
        <ul className="space-y-3">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="pb-2 border-b border-uv-border last:border-b-0">
              <p className="text-sm text-slate-700 font-medium">{activity.description}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-sm">No recent activity.</p>
      )}
    </div>
  );
};

export default DashboardActivityFeed;
