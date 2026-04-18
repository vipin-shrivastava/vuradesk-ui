import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useDashboardStore } from '@/hooks/useDashboardStore';
import KpiRibbon from '@/components/dashboard/KpiRibbon';
import TicketWorkload from '@/components/dashboard/TicketWorkload';
import ActivityPulse from '@/components/dashboard/ActivityPulse';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import QuickActions from '@/components/dashboard/QuickActions';
import AgentsOnline from '@/components/dashboard/AgentsOnline';
import ActiveStage from '@/components/dashboard/ActiveStage'; // Import ActiveStage
import axiosClient from '@/api/axiosClient';
import { Button } from '@/components/ui/button'; // Import Button
import { ArrowRight } from 'lucide-react'; // Import ArrowRight

const DashboardV2: React.FC = () => {
  const {
    showKpis,
    setShowKpis,
    showActivity,
    setShowActivity,
    showTickets,
    setShowTickets,
  } = useDashboardStore();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get('http://localhost:8080/api/dashboard/summary');
        const data = response.data;
        setDashboardData({
          kpis: {
            newTickets: { value: data.openTicketsCount, change: '+15%' },
            unassigned: { value: data.highPriorityTicketsCount, change: '' },
            avgResponseTime: { value: '1.2h', change: '+2%' },
            openTickets: { value: data.openTicketsCount, change: '' },
          },
          ticketWorkload: data.recentTickets,
          activityPulse: data.recentActivities,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DashboardSettings
          showKpis={showKpis}
          setShowKpis={setShowKpis}
          showActivity={showActivity}
          setShowActivity={setShowActivity}
          showTickets={showTickets}
          setShowTickets={setShowTickets}
        />
      </div>

      <QuickActions />

      {showKpis && dashboardData && <KpiRibbon data={dashboardData.kpis} />}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={showActivity ? 'lg:col-span-4' : 'lg:col-span-6'}>
          {showTickets && dashboardData && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Ticket Workload</h2>
                <Button variant="ghost" asChild>
                  <Link to="/inbox?tab=all">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <TicketWorkload data={dashboardData.ticketWorkload} onTicketSelect={handleTicketSelect} />
            </div>
          )}
        </div>
        <div className={showActivity ? 'lg:col-span-5' : 'lg:col-span-6'}>
          <ActiveStage ticket={selectedTicket} />
        </div>
        {showActivity && (
          <div className="lg:col-span-3 space-y-6">
            {dashboardData && <ActivityPulse data={dashboardData.activityPulse} />}
            <AgentsOnline />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardV2;
