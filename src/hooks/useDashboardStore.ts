import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  showKpis: boolean;
  showActivity: boolean;
  showTickets: boolean;
  setShowKpis: (show: boolean) => void;
  setShowActivity: (show: boolean) => void;
  setShowTickets: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      showKpis: true,
      showActivity: true,
      showTickets: true,
      setShowKpis: (show) => set({ showKpis: show }),
      setShowActivity: (show) => set({ showActivity: show }),
      setShowTickets: (show) => set({ showTickets: show }),
    }),
    {
      name: 'dashboard-storage', // name of the item in the storage (must be unique)
    }
  )
);
