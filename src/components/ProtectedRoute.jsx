import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Wraps a route to require authentication.
 * Optional: pass `allowedRoles` array to restrict by role.
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // While restoring session from localStorage, show nothing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-sm font-body-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to /login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}
