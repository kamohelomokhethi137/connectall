import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

/**
 * Gate for pages that require a logged-in session (e.g. watching a live
 * stream). This is a UX convenience, NOT the security boundary - it just
 * stops a logged-out person from ever seeing the page's markup or
 * triggering its data fetches from the UI. The real enforcement has to
 * live server-side: every API route this page calls (GET the stream,
 * POST heartbeat, POST leave) must independently require an
 * authenticated session, exactly like the current Flask
 * @login_required decorator does. Someone could always call those
 * endpoints directly with curl, bypassing this component entirely -
 * so if the backend ever trusted "the frontend already checked",
 * that would be the vulnerability.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
