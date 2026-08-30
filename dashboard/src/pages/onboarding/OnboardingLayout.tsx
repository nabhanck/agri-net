import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';

export const OnboardingLayout: React.FC = () => {
  const location = useLocation();

  // Determine current step based on route
  const getStepNumber = () => {
    const path = location.pathname;
    if (path.includes('/farm-identity')) return 1;
    if (path.includes('/crop-selection')) return 2;
    if (path.includes('/crop-details')) return 3;
    if (path.includes('/soil')) return 4;
    if (path.includes('/irrigation')) return 5;
    if (path.includes('/practice')) return 6;
    if (path.includes('/ready')) return 7;
    return 1;
  };

  const currentStep = getStepNumber();
  const isStartScreen = location.pathname === '/onboarding/start';
  const isReadyScreen = location.pathname === '/onboarding/ready';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-100">
      <div className="w-full max-w-2xl">
        {/* Progress Bar (show for steps 1-6) */}
        {!isStartScreen && !isReadyScreen && (
          <ProgressBar currentStep={currentStep} totalSteps={6} />
        )}

        {/* Dynamic Step Content */}
        <Outlet />
      </div>
    </div>
  );
};
