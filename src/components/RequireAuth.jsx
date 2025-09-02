// src/components/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route guard for protected pages.
 *
 * Props:
 * - isLoading?: boolean        // optional: pass true while your app is hydrating auth (e.g., fetching /profile/view)
 * - requiredRole?: string      // optional: restrict route to a specific role (e.g., "admin")
 * - redirectTo?: string        // optional: path to send unauthenticated users (default: "/login")
 *
 * Usage:
 * <RequireAuth isLoading={checkingFromApp} requiredRole="admin">
 *   <AdminPage />
 * </RequireAuth>
 */
const RequireAuth = ({ children, isLoading = false, requiredRole, redirectTo = "/login" }) => {
  const user = useSelector((s) => s.user);
  const location = useLocation();

  // Optional loading (while session is being checked)
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // If not logged in → send to login, preserving the intended destination
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Optional role check
  if (requiredRole && user?.role !== requiredRole) {
    // You can change this to a dedicated "Unauthorized" page if you prefer
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
