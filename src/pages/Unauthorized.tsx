import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center bg-uv-navy p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-white">403 - Unauthorized</h1>
        <p className="mt-4 text-lg text-slate-300">
          You do not have permission to access this page.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="mt-6 bg-uv-blue hover:bg-uv-blue-hover text-white"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
