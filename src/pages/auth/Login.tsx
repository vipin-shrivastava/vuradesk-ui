import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import { Mail } from 'lucide-react'; // Using Mail icon as a placeholder for a logo

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen grid place-items-center bg-uv-navy p-4">
      <Card className="w-full max-w-md border-uv-border shadow-sm rounded-sm overflow-hidden">
        {/* Thick top border / header section */}
        <div className="h-2 bg-uv-blue"></div> {/* This creates the thick top border effect */}
        <CardHeader className="bg-uv-bg pt-2 pb-4 border-b border-uv-border"> {/* Adjusted padding and added bottom border */}
          <div className="flex flex-col items-center gap-1"> {/* New wrapper for header content */}
            {/* Placeholder for VuraDesk Logo */}
            <Mail className="h-10 w-10 text-uv-blue" />
            <CardTitle className="text-xl font-bold text-slate-800">Login to VuraDesk</CardTitle> {/* Reduced text size */}
            <p className="text-sm text-slate-500">Enter your credentials to access your account</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
