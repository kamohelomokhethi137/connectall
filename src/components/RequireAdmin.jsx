import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

/**
 * Gates admin-only pages. Like RequireAuth, this is UX only - the real
 * enforcement is @admin_required on the Flask side, which independently
 * re-checks current_user.role on every request. A regular user could
 * never see admin data even if they hit the API directly with curl and
 * somehow got past this component.
 */
export default function RequireAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
