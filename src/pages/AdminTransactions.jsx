import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminTransactions, approveTransaction, rejectTransaction } from "../lib/admin";

const statusStyles = {
  COMPLETED: "bg-teal/10 text-teal-dark",
  PENDING: "bg-gold/10 text-gold-dark",
  REJECTED: "bg-red-50 text-red-500",
};

function Row({ t, onApprove, onReject, busy }) {
  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="p-4">
        <p className="font-medium text-ink text-xs">@{t.username}</p>
        <p className="text-xs text-ink-soft">{t.tx_type.replace(/_/g, " ")}</p>
      </td>
      <td className="p-4 font-mono font-semibold text-ink">R{t.amount.toFixed(2)}</td>
      <td className="p-4 text-xs text-ink-soft truncate max-w-[220px]">{t.note}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-xs capitalize ${statusStyles[t.status] || "bg-paper text-ink"}`}>
          {t.status.toLowerCase()}
        </span>
      </td>
      <td className="p-4 text-ink-soft text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
      {t.status === "PENDING" && (
        <td className="p-4">
          <div className="flex gap-2">
            <button onClick={() => onApprove(t.id)} disabled={busy === t.id}
                    className="w-7 h-7 rounded-lg bg-teal/10 text-teal-dark flex items-center justify-center disabled:opacity-40" aria-label="Approve">
              <FiCheck size={14} />
            </button>
            <button onClick={() => onReject(t.id)} disabled={busy === t.id}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-40" aria-label="Reject">
              <FiX size={14} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function AdminTransactions() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdminTransactions();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load transactions.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = useCallback(async (id) => {
    setBusy(id);
    try {
      const res = await approveTransaction(id);
      setData((prev) => ({
        pending: prev.pending.filter((t) => t.id !== id),
        recent: [res.transaction, ...prev.recent],
      }));
      toast.success("Transaction approved.");
    } catch (err) {
      toast.error(err.message || "Couldn't approve that transaction.");
    } finally {
      setBusy(null);
    }
  }, []);

  const handleReject = useCallback(async (id) => {
    setBusy(id);
    try {
      const res = await rejectTransaction(id);
      setData((prev) => ({
        pending: prev.pending.filter((t) => t.id !== id),
        recent: [res.transaction, ...prev.recent],
      }));
      toast.success("Transaction rejected.");
    } catch (err) {
      toast.error(err.message || "Couldn't reject that transaction.");
    } finally {
      setBusy(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Transactions">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Transactions">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transactions">
      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden mb-6">
        <h2 className="font-display font-semibold text-ink p-5 pb-0">Pending ({data.pending.length})</h2>
        {data.pending.length === 0 ? (
          <p className="text-center text-ink-soft py-8">Nothing pending review.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
            <tbody>
              {data.pending.map((t) => (
                <Row key={t.id} t={t} onApprove={handleApprove} onReject={handleReject} busy={busy} />
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        <h2 className="font-display font-semibold text-ink p-5 pb-0">Recent</h2>
        {data.recent.length === 0 ? (
          <p className="text-center text-ink-soft py-8">No transaction history yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
            <tbody>
              {data.recent.map((t) => (
                <Row key={t.id} t={t} onApprove={handleApprove} onReject={handleReject} busy={busy} />
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </DashboardLayout>
  );
}
