import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

const AgentsOnline: React.FC = () => {
  const agents = [
    { name: 'Tech Agent' },
    { name: 'Support Agent' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-semibold">Agents Online</h3>
      </div>
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="ml-3 text-sm font-medium">{agent.name}</span>
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsOnline;
