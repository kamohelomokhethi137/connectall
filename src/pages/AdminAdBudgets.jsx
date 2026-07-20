import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdvertiserDeposits, confirmDeposit, rejectDeposit } from "../lib/admin";

export default function AdminAdBudgets() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdvertiserDeposits();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load ad budget deposits.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = useCallback(async (id) => {
    setBusy(id);
    try {
      const res = await confirmDeposit(id);
      setData((prev) => ({
        pending: prev.pending.filter((d) => d.id !== id),
        recent: [res.deposit, ...prev.recent],
      }));
      toast.success("Deposit confirmed and credited.");
    } catch (err) {
      toast.error(err.message || "Couldn't confirm that deposit.");
    } finally {
      setBusy(null);
    }
  }, []);

  const handleReject = useCallback(async (id) => {
    setBusy(id);
    try {
      const res = await rejectDeposit(id);
      setData((prev) => ({
        pending: prev.pending.filter((d) => d.id !== id),
        recent: [res.deposit, ...prev.recent],
      }));
      toast.success("Deposit rejected.");
    } catch (err) {
      toast.error(err.message || "Couldn't reject that deposit.");
    } finally {
      setBusy(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Ad Budgets">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Ad Budgets">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ad Budgets">
      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden mb-6">
        <h2 className="font-display font-semibold text-ink p-5 pb-0">Pending deposits ({data.pending.length})</h2>
        {data.pending.length === 0 ? (
          <p className="text-center text-ink-soft py-8">Nothing pending.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
            <tbody>
              {data.pending.map((d) => (
                <tr key={d.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium text-ink text-sm">{d.advertiser_name}</td>
                  <td className="p-4 font-mono font-semibold text-ink">R{d.amount.toFixed(2)}</td>
                  <td className="p-4 text-xs text-ink-soft">{d.method} \u00b7 {d.reference}</td>
                  <td className="p-4 text-xs text-ink-soft">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirm(d.id)} disabled={busy === d.id}
                              className="w-7 h-7 rounded-lg bg-teal/10 text-teal-dark flex items-center justify-center disabled:opacity-40" aria-label="Confirm"><FiCheck size={14} /></button>
                      <button onClick={() => handleReject(d.id)} disabled={busy === d.id}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-40" aria-label="Reject"><FiX size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        <h2 className="font-display font-semibold text-ink p-5 pb-0">Recent</h2>
        {data.recent.length === 0 ? (
          <p className="text-center text-ink-soft py-8">No history yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
            <tbody>
              {data.recent.map((d) => (
                <tr key={d.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium text-ink text-sm">{d.advertiser_name}</td>
                  <td className="p-4 font-mono font-semibold text-ink">R{d.amount.toFixed(2)}</td>
                  <td className="p-4 text-xs text-ink-soft">{d.method} \u00b7 {d.reference}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${d.status === "CONFIRMED" ? "bg-teal/10 text-teal-dark" : "bg-red-50 text-red-500"}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </DashboardLayout>
  );
}
