import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import DashboardTicketTable from '@/components/dashboard/DashboardTicketTable';
import DashboardActivityFeed from '@/components/dashboard/DashboardActivityFeed';
import WidgetSettingsDialog from '@/components/dashboard/WidgetSettingsDialog'; // Import the new dialog
import { fetchTicketSummary, TicketSummary } from '@/services/ticketService';
import { Menu } from 'lucide-react';

type WidgetId = 'statCards' | 'ticketTable' | 'activityFeed';

const Dashboard: React.FC = () => {
  const [ticketSummary, setTicketSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWidgets, setActiveWidgets] = useState<Record<WidgetId, boolean>>({
    statCards: true,
    ticketTable: true,
    activityFeed: true,
  });

  // --- START: UNIQUE TEST STRING ---
  console.log("VuraDesk Dashboard - Code Version: 2024-07-29-TEST-1");
  // --- END: UNIQUE TEST STRING ---

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        const summary = await fetchTicketSummary();
        setTicketSummary(summary);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  const handleToggleWidget = (widgetId: WidgetId) => {
    setActiveWidgets(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-uv-bg p-8 flex items-center justify-center">
        <p className="text-xl text-slate-700">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-uv-bg p-8 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!ticketSummary) {
    return (
      <div className="min-h-screen bg-uv-bg p-8 flex items-center justify-center">
        <p className="text-xl text-slate-700">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-uv-bg">
      {/* Left Sidebar */}
      <aside className="w-16 bg-uv-navy text-white flex flex-col items-center py-4 rounded-tr-sm rounded-br-sm shadow-lg">
        <Menu className="h-6 w-6 text-white mb-8 cursor-pointer" strokeWidth={1.5} />
        <WidgetSettingsDialog
          activeWidgets={activeWidgets}
          onToggleWidget={handleToggleWidget}
        />
        {/* Add more sidebar icons/links here */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <DashboardHeader />
        {/* --- START: UNIQUE VISUAL TEST STRING --- */}
        <h1 style={{ color: 'red', fontSize: '30px', textAlign: 'center', padding: '20px', backgroundColor: 'yellow' }}>
          VuraDesk Dashboard - TEST VERSION 2024-07-29-1
        </h1>
        {/* --- END: UNIQUE VISUAL TEST STRING --- */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Center Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {activeWidgets.statCards && (
              <DashboardStatCards
                totalTickets={ticketSummary.totalTickets}
                openTickets={ticketSummary.openTickets}
                inProgressTickets={ticketSummary.inProgressTickets}
                closedTickets={ticketSummary.closedTickets}
                resolvedTickets={ticketSummary.resolvedTickets}
              />
            )}
            {activeWidgets.ticketTable && <DashboardTicketTable />}
          </div>

          {/* Right Activity Feed */}
          <div className="lg:col-span-1">
            {activeWidgets.activityFeed && <DashboardActivityFeed />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
