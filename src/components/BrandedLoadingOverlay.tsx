import React from 'react';
import { cn } from '@/lib/utils';
import vuradeskLogo from '@/assets/logo.png'; // Assuming a logo for the spinner

interface BrandedLoadingOverlayProps {
  isVisible: boolean;
}

const BrandedLoadingOverlay: React.FC<BrandedLoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Placeholder for VuraDesk Logo/Spinner */}
        <div className="relative w-24 h-24 mb-4">
          <img src={vuradeskLogo} alt="VuraDesk Logo" className="w-full h-full object-contain animate-pulse-slow" />
          {/* Optional: Add a subtle spinner around the logo if needed */}
          <div className="absolute inset-0 border-4 border-uv-blue border-t-transparent rounded-full animate-spin-slow opacity-50"></div>
        </div>
        <p className="text-lg font-semibold text-uv-blue">Loading Workspace...</p>
      </div>
    </div>
  );
};

export default BrandedLoadingOverlay;
