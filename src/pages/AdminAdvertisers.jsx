import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdvertisers, toggleAdvertiser } from "../lib/admin";

export default function AdminAdvertisers() {
  const [advertisers, setAdvertisers] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdvertisers();
      setAdvertisers(data.advertisers);
    } catch (err) {
      setError(err.message || "Couldn't load advertisers.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = useCallback(async (id) => {
    try {
      const res = await toggleAdvertiser(id);
      setAdvertisers((prev) => prev.map((a) => (a.id === id ? res.advertiser : a)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that advertiser.");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Advertisers">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!advertisers) {
    return (
      <DashboardLayout title="Advertisers">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Advertisers">
      {advertisers.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No advertisers registered yet.</p>
      ) : (
        <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b border-ink/5">
                <th className="p-4 font-medium">Business</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Budget balance</th>
                <th className="p-4 font-medium">Total spent</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.map((a) => (
                <tr key={a.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4">
                    <p className="font-medium text-ink">{a.business_name}</p>
                    <p className="text-xs text-ink-soft">{a.email}</p>
                  </td>
                  <td className="p-4 text-ink-soft text-xs">{a.contact_name || "\u2014"} {a.phone ? `\u00b7 ${a.phone}` : ""}</td>
                  <td className="p-4 font-mono text-ink">R{a.balance.toFixed(2)}</td>
                  <td className="p-4 font-mono text-ink-soft">R{a.total_spent.toFixed(2)}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(a.id)}
                            className={`px-2 py-1 rounded text-xs ${a.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
                      {a.is_active ? "Active" : "Suspended"}
                    </button>
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
