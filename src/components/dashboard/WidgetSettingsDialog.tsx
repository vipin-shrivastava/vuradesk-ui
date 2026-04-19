import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

type WidgetId = 'statCards' | 'ticketTable' | 'activityFeed';

interface WidgetSettingsDialogProps {
  activeWidgets: Record<WidgetId, boolean>;
  onToggleWidget: (widgetId: WidgetId) => void;
}

const WidgetSettingsDialog: React.FC<WidgetSettingsDialogProps> = ({
  activeWidgets,
  onToggleWidget,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="mt-auto text-white hover:bg-uv-blue hover:text-white"
        >
          <Settings className="h-5 w-5" strokeWidth={1.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-sm">
        <DialogHeader>
          <DialogTitle>Manage Dashboard Widgets</DialogTitle>
          <DialogDescription>
            Toggle which widgets are visible on your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="stat-cards">KPI Stat Cards</Label>
            <Switch
              id="stat-cards"
              checked={activeWidgets.statCards}
              onCheckedChange={() => onToggleWidget('statCards')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ticket-table">Ticket Queue</Label>
            <Switch
              id="ticket-table"
              checked={activeWidgets.ticketTable}
              onCheckedChange={() => onToggleWidget('ticketTable')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="activity-feed">Activity Feed</Label>
            <Switch
              id="activity-feed"
              checked={activeWidgets.activityFeed}
              onCheckedChange={() => onToggleWidget('activityFeed')}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSettingsDialog;
