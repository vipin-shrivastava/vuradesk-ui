import React from 'react';
import { WifiOff } from 'lucide-react';

export const ServiceUnavailable: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
      <WifiOff size={64} className="mb-4 text-red-400" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Service Unavailable</h3>
      <p className="max-w-sm mt-2">We're having trouble connecting to our services right now. Please check your connection or try again in a few moments.</p>
    </div>
  );
};
