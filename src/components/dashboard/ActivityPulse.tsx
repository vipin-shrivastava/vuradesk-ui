import React from 'react';
import { MessageSquare } from 'lucide-react';

interface Activity {
  timestamp: number[];
  message: string;
}

interface ActivityPulseProps {
  data?: Activity[];
}

const formatDate = (dateArray: number[]) => {
  if (!dateArray || dateArray.length < 5) return '';
  const [year, month, day, hour, minute] = dateArray;
  return new Date(year, month - 1, day, hour, minute).toLocaleString();
};

const ActivityPulse: React.FC<ActivityPulseProps> = ({ data = [] }) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-semibold">Activity Pulse</h3>
      </div>
      <div className="relative">
        <div className="absolute left-2 h-full border-l-2 border-border"></div>
        {data.map((activity, index) => (
          <div key={index} className="flex items-start mb-4">
            <div className="w-4 h-4 bg-primary rounded-full mt-1 mr-4 z-10"></div>
            <div>
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPulse;
