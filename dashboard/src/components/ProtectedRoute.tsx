import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const location = useLocation();

  if (!token) {
    // If no access token exists in localStorage, redirect to landing/welcome page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
