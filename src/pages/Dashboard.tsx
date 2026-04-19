import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from '@/components/dashboard/customer/CustomerDashboard';
import AgentDashboard from '@/components/dashboard/agent/AgentDashboard';
import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import BrandedLoadingOverlay from '@/components/BrandedLoadingOverlay';

const Dashboard: React.FC = () => {
  const { activeRole, isSessionChecked } = useAuth();

  // Add a Loading Guard: Do not attempt to render anything until the AuthContext
  // has confirmed that it has checked the session.
  if (!isSessionChecked) {
    return <BrandedLoadingOverlay isVisible={true} />;
  }

  const renderDashboardByRole = () => {
    switch (activeRole) {
      case 'ADMIN':
      case 'SUB_ADMIN':
        return <AdminDashboard />;
      case 'AGENT':
        return <AgentDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      default:
        // If the session is checked but there's still no active role,
        // it's a valid loading state while the context redirects.
        console.warn(`No active role found after session check. Current activeRole: '${activeRole}'`);
        return <BrandedLoadingOverlay isVisible={true} />;
    }
  };

  return <>{renderDashboardByRole()}</>;
};

export default Dashboard;
