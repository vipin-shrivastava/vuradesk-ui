import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';

interface TeamMemberCardProps {
  agent: Agent;
  onStatusChange: (agent: Agent, newStatus: boolean) => void;
  onCardClick: (agent: Agent) => void;
}

const getAvatarSrc = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL}${path}`;
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ agent, onStatusChange, onCardClick }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className="relative bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 cursor-pointer border border-slate-100 overflow-hidden"
      onClick={() => onCardClick(agent)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 163, 224, 0.1) 0%, transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={getAvatarSrc(agent.profilePictureUrl)} alt={`${agent.firstName} ${agent.lastName}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {`${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{`${agent.firstName} ${agent.lastName}`}</h3>
            <p className="text-xs text-slate-500">{agent.email}</p>
          </div>
        </div>
        <Switch
          checked={agent.enabled}
          onCheckedChange={(newStatus) => onStatusChange(agent, newStatus)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="relative z-10 mt-2 flex flex-wrap gap-1">
        {agent.roles.map(role => (
          <Badge
            key={role}
            className={cn(
              'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
              role === 'ROLE_ADMIN'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            )}
          >
            {role.replace('ROLE_', '')}
          </Badge>
        ))}
      </div>
    </div>
  );
};
