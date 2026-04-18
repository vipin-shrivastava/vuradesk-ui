import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface DashboardSettingsProps {
  showKpis: boolean;
  setShowKpis: (show: boolean) => void;
  showActivity: boolean;
  setShowActivity: (show: boolean) => void;
  showTickets: boolean;
  setShowTickets: (show: boolean) => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  showKpis,
  setShowKpis,
  showActivity,
  setShowActivity,
  showTickets,
  setShowTickets,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dashboard Settings</h4>
            <p className="text-sm text-muted-foreground">
              Customize your dashboard view.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="kpi-ribbon">KPI Ribbon</Label>
              <Switch id="kpi-ribbon" checked={showKpis} onCheckedChange={setShowKpis} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-workload">Ticket Workload</Label>
              <Switch id="ticket-workload" checked={showTickets} onCheckedChange={setShowTickets} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity-pulse">Activity Pulse</Label>
              <Switch id="activity-pulse" checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardSettings;
