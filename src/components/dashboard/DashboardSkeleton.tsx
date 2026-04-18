import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

      {/* KPI Ribbon Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket Workload Skeleton */}
        <div className="lg:col-span-9 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>

        {/* Activity Pulse Skeleton */}
        <div className="lg:col-span-3 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
