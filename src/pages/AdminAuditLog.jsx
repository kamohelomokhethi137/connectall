import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAuditLog } from "../lib/admin";

export default function AdminAuditLog() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAuditLog();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message || "Couldn't load the audit log.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <DashboardLayout title="Audit Log">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!logs) {
    return (
      <DashboardLayout title="Audit Log">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Audit Log">
      {logs.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No admin actions logged yet.</p>
      ) : (
        <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b border-ink/5">
                <th className="p-4 font-medium">Admin</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Target</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium text-ink">@{log.actor_username}</td>
                  <td className="p-4 text-xs text-ink-soft capitalize">{log.action.replace(/_/g, " ")}</td>
                  <td className="p-4 text-xs text-ink-soft">{log.target_username ? `@${log.target_username}` : "\u2014"}</td>
                  <td className="p-4 text-xs text-ink-soft truncate max-w-[220px]">{log.details}</td>
                  <td className="p-4 text-xs text-ink-soft">
                    {new Date(log.created_at).toLocaleString(undefined, {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
