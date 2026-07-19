import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiShield, FiCreditCard, FiUserCheck, FiHeart, FiBell } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchNotifications } from "../lib/activity";

const categoryIcons = {
  security: FiShield,
  payment: FiCreditCard,
  admin: FiUserCheck,
  social: FiHeart,
};

const categoryColors = {
  security: "bg-red-50 text-red-500",
  payment: "bg-teal/10 text-teal-dark",
  admin: "bg-navy/10 text-navy",
  social: "bg-gold/15 text-gold-dark",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.message || "Couldn't load your notifications.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout title="Notifications">
      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        {error && <p className="p-5 text-ink-soft">{error}</p>}

        {!error && notifications === null && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-ink/5 rounded animate-pulse" />
            ))}
          </div>
        )}

        {notifications && notifications.length === 0 && (
          <p className="text-center text-ink-soft py-16">No notifications yet.</p>
        )}

        {notifications && notifications.length > 0 && (
          <ul className="divide-y divide-ink/5">
            {notifications.map((n) => {
              const Icon = categoryIcons[n.category] || FiBell;
              const colorClass = categoryColors[n.category] || "bg-ink/5 text-ink-soft";
              return (
                <li
                  key={n.id}
                  className={`flex gap-3 p-4 items-start ${!n.is_read ? "bg-paper/60" : ""}`}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{n.title}</p>
                    <p className="text-ink-soft text-sm mt-0.5">{n.message}</p>
                    <p className="text-ink-soft/60 text-xs mt-1">
                      {new Date(n.created_at).toLocaleString(undefined, {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {n.link && (
                    <Link
                      to={n.link}
                      className="self-center text-xs font-semibold text-teal-dark border border-teal-dark/30 rounded px-2.5 py-1 hover:bg-teal/5 shrink-0"
                    >
                      View
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
