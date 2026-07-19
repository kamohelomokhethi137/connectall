import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiClock } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminTransactions, approveTransaction, rejectTransaction } from "../lib/adminTransactions";

const statusColors = {
  PENDING: "bg-gold/15 text-gold-dark",
  COMPLETED: "bg-teal/10 text-teal-dark",
  REJECTED: "bg-red-50 text-red-500",
};

const typeLabels = {
  DEPOSIT: "Deposit",
  WITHDRAWAL: "Withdrawal",
  TRANSFER_OUT: "Transfer sent",
  TRANSFER_IN: "Transfer received",
  QR_PAYMENT: "QR payment",
  EARNING: "Earning payout",
};

function TxnRow({ txn, onApprove, onReject, busy }) {
  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="p-4">
        <p className="font-medium text-ink text-sm">@{txn.username}</p>
        <p className="text-xs text-ink-soft font-mono">{txn.reference}</p>
      </td>
      <td className="p-4 text-sm text-ink">{typeLabels[txn.tx_type] || txn.tx_type}</td>
      <td className="p-4 font-mono font-semibold text-ink text-sm">R{txn.amount.toFixed(2)}</td>
      <td className="p-4 text-sm text-ink-soft">{txn.method_name || "—"}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-xs ${statusColors[txn.status] || "bg-ink/5 text-ink-soft"}`}>
          {txn.status}
        </span>
      </td>
      <td className="p-4 text-ink-soft text-xs">
        {new Date(txn.created_at).toLocaleString(undefined, {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        })}
      </td>
      {onApprove && (
        <td className="p-4 text-right">
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onApprove(txn.id)}
              disabled={busy}
              className="w-8 h-8 rounded-lg bg-teal/10 text-teal-dark hover:bg-teal/20 disabled:opacity-40 flex items-center justify-center"
              aria-label="Approve"
            >
              <FiCheck size={15} />
            </button>
            <button
              onClick={() => onReject(txn.id)}
              disabled={busy}
              className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 flex items-center justify-center"
              aria-label="Reject"
            >
              <FiX size={15} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function AdminTransactions() {
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await fetchAdminTransactions();
      setData(d);
    } catch (err) {
      toast.error(err.message || "Couldn't load transactions.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = useCallback(async (id) => {
    setBusyId(id);
    try {
      await approveTransaction(id);
      toast.success("Transaction approved.");
      load();
    } catch (err) {
      toast.error(err.message || "Couldn't approve that transaction.");
    } finally {
      setBusyId(null);
    }
  }, [load]);

  const handleReject = useCallback(async (id) => {
    if (!window.confirm("Reject this transaction? Withdrawals will be refunded to the user's balance.")) return;
    setBusyId(id);
    try {
      await rejectTransaction(id);
      toast.success("Transaction rejected.");
      load();
    } catch (err) {
      toast.error(err.message || "Couldn't reject that transaction.");
    } finally {
      setBusyId(null);
    }
  }, [load]);

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
        <div className="p-4 border-b border-ink/5 flex items-center gap-2">
          <FiClock className="text-gold-dark" />
          <h2 className="font-display font-semibold text-ink">
            Pending review ({data.pending.length})
          </h2>
        </div>
        {data.pending.length === 0 ? (
          <p className="text-center text-ink-soft py-8">No pending transactions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Requested</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.pending.map((t) => (
                  <TxnRow key={t.id} txn={t} onApprove={handleApprove} onReject={handleReject} busy={busyId === t.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        <div className="p-4 border-b border-ink/5">
          <h2 className="font-display font-semibold text-ink">Recent history</h2>
        </div>
        {data.recent.length === 0 ? (
          <p className="text-center text-ink-soft py-8">No transaction history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((t) => (
                  <TxnRow key={t.id} txn={t} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
