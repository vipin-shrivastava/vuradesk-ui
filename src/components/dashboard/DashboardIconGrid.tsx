import React from 'react';
import { Users, UserRound, Ticket, Search, Upload, Settings, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

interface GridItemProps {
  title: string;
  icon: React.ElementType;
  link: string;
}

const GridItem: React.FC<GridItemProps> = ({ title, icon: Icon, link }) => {
  return (
    <Link to={link} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-blue/10 text-primary-blue mb-2">
        <Icon className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <span className="text-sm font-medium text-slate-700 text-center">{title}</span>
    </Link>
  );
};

const DashboardIconGrid: React.FC = () => {
  const sections = [
    {
      title: "User Management",
      items: [
        { title: "Agents", icon: Users, link: "/api/users?type=agent" },
        { title: "Customers", icon: UserRound, link: "/api/users?type=customer" },
      ],
    },
    {
      title: "Ticket Operations",
      items: [
        { title: "Ticket Types", icon: Ticket, link: "/api/tickets/types" }, // Assuming a link for ticket types
        { title: "Search Tickets", icon: Search, link: "/api/tickets/search" },
      ],
    },
    {
      title: "System Tools",
      items: [
        { title: "Data Import", icon: Upload, link: "/api/migration/status/new" }, // Placeholder for new job
        { title: "Settings", icon: Settings, link: "/settings" }, // Example
        { title: "Dashboard", icon: LayoutDashboard, link: "/dashboard" }, // Example
      ],
    },
  ];

  return (
    <div className="p-4 space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{section.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {section.items.map((item, itemIndex) => (
              <GridItem key={itemIndex} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardIconGrid;
