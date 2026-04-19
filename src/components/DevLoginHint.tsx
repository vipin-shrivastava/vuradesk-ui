import React, { useState } from 'react';
import { Button } from './ui/button';
import { Lightbulb, X } from 'lucide-react';

const DevLoginHint: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (import.meta.env.MODE !== 'development' || !isVisible) {
    return null;
  }

  const roles = [
    { name: 'Super Admin', email: 'superadmin@vuradesk.com', pass: 'password' },
    { name: 'Admin', email: 'admin@vuradesk.com', pass: 'password' },
    { name: 'Agent', email: 'agent@vuradesk.com', pass: 'password' },
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <Lightbulb className="h-5 w-5 mr-2" />
            <h4 className="font-bold">Development Login Hints</h4>
          </div>
          <ul className="text-xs space-y-1">
            {roles.map(role => (
              <li key={role.name}>
                <strong>{role.name}:</strong> {role.email} / {role.pass}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DevLoginHint;
