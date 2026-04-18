import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TicketDetails } from '@/hooks/useTicket'; // Ensure TicketDetails is imported
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface TicketContextType {
  ticket: TicketDetails | null;
  setTicket: (ticket: TicketDetails | null) => void;
  isSwitchingRole: boolean;
  setIsSwitchingRole: (isSwitching: boolean) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const { activeRole } = useAuth(); // Get activeRole from AuthContext

  // Effect to reset ticket state when activeRole changes
  useEffect(() => {
    // Only reset if activeRole has actually changed and is not null initially
    // This prevents resetting on initial render if activeRole is already set
    if (activeRole) {
      setTicket(null);
    }
  }, [activeRole, setTicket]); // Depend on activeRole and setTicket

  return (
    <TicketContext.Provider value={{ ticket, setTicket, isSwitchingRole, setIsSwitchingRole }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useSharedTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useSharedTicket must be used within a TicketProvider');
  }
  return context;
};
