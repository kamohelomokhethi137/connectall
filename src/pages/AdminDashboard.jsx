import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers, FiUserCheck, FiSlash, FiFileText, FiShoppingBag, FiRadio, FiMail,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminDashboard } from "../lib/dashboard";

const kpiRow1 = [
  { key: "total_users", label: "Total Users", icon: FiUsers, bg: "bg-navy" },
  { key: "total_admins", label: "Admins", icon: FiUserCheck, bg: "bg-teal" },
  { key: "blocked_users", label: "Blocked Users", icon: FiSlash, bg: "bg-gold" },
  { key: "pending_transactions", label: "Pending Transactions", icon: FiFileText, bg: "bg-navy-light" },
];

const kpiRow2 = [
  { key: "products", label: "Marketplace Products", icon: FiShoppingBag, bg: "bg-navy" },
  { key: "live_now", label: "Live Now", icon: FiRadio, bg: "bg-teal" },
  { key: "unresolved_messages", label: "Unresolved Messages", icon: FiMail, bg: "bg-gold" },
];

function formatLogTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdminDashboard();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load the admin panel.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <DashboardLayout title="Admin Panel">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiRow1.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.key} className={`${kpi.bg} rounded-2xl p-5 text-white`}>
              <Icon size={22} className="mb-4 opacity-80" aria-hidden="true" />
              <p className="font-display font-semibold text-2xl">{data.stats[kpi.key]}</p>
              <p className="text-xs text-white/60 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {kpiRow2.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.key} className={`${kpi.bg} rounded-2xl p-5 text-white`}>
              <Icon size={22} className="mb-4 opacity-80" aria-hidden="true" />
              <p className="font-display font-semibold text-2xl">{data.stats[kpi.key]}</p>
              <p className="text-xs text-white/60 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">
            Recently Registered
          </h2>
          <ul className="divide-y divide-ink/5">
            {data.recent_users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-ink">
                  @{u.username}{" "}
                  <span className="text-ink-soft/70 text-xs">({u.role})</span>
                </span>
                <Link
                  to={`/admin/users/${u.id}`}
                  className="text-xs font-semibold text-teal-dark border border-teal-dark/30 rounded px-2.5 py-1 hover:bg-teal/5"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">
            Recent Admin Actions
          </h2>
          {data.recent_logs.length === 0 ? (
            <p className="text-sm text-ink-soft">No actions logged yet.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {data.recent_logs.map((log) => (
                <li key={log.id} className="py-2.5">
                  <p className="text-xs text-ink-soft/70">{formatLogTime(log.created_at)}</p>
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{log.actor_username}</span>{" "}
                    — {log.action}
                    {log.target_username && <> on @{log.target_username}</>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
