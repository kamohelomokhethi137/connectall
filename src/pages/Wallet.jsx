import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCreditCard, FiArrowDownCircle, FiArrowUpCircle, FiSend } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchWallet, depositFunds, withdrawFunds, transferFunds } from "../lib/wallet";

const TABS = [
  { key: "deposit", label: "Deposit", icon: FiArrowDownCircle },
  { key: "withdraw", label: "Withdraw", icon: FiArrowUpCircle },
  { key: "transfer", label: "Smart Link Pay", icon: FiSend },
];

const statusStyles = {
  COMPLETED: "bg-teal/10 text-teal-dark",
  PENDING: "bg-gold/10 text-gold-dark",
  REJECTED: "bg-red-50 text-red-500",
  APPROVED: "bg-teal/10 text-teal-dark",
};

export default function Wallet() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [methodId, setMethodId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchWallet();
      setData(d);
      if (d.methods.length > 0) setMethodId(String(d.methods[0].id));
    } catch (err) {
      setError(err.message || "Couldn't load your wallet.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setAmount("");
    setAccount("");
    setRecipient("");
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const numAmount = parseFloat(amount);
      if (!numAmount || numAmount <= 0) {
        toast.error("Enter a valid amount.");
        return;
      }
      setSubmitting(true);
      try {
        if (tab === "deposit") {
          const res = await depositFunds(numAmount, methodId || undefined);
          setData((prev) => ({ ...prev, balance: res.balance, transactions: [res.transaction, ...prev.transactions] }));
          toast.success(`Deposit of R${numAmount.toFixed(2)} submitted for confirmation.`);
        } else if (tab === "withdraw") {
          const res = await withdrawFunds(numAmount, methodId || undefined, account);
          setData((prev) => ({ ...prev, balance: res.balance, transactions: [res.transaction, ...prev.transactions] }));
          toast.success("Withdrawal request submitted.");
        } else {
          const res = await transferFunds(recipient, numAmount);
          setData((prev) => ({ ...prev, balance: res.balance }));
          toast.success(`R${numAmount.toFixed(2)} sent to @${recipient}.`);
          load();
        }
        resetForm();
      } catch (err) {
        toast.error(err.message || "That request couldn't be completed.");
      } finally {
        setSubmitting(false);
      }
    },
    [tab, amount, account, recipient, methodId, load]
  );

  if (error) {
    return (
      <DashboardLayout title="Wallet & Payments">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Wallet & Payments">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wallet & Payments">
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white mb-6 flex items-center gap-4">
        <FiCreditCard size={28} className="opacity-80" aria-hidden="true" />
        <div>
          <p className="text-xs text-white/60">Wallet Balance</p>
          <p className="font-display font-semibold text-3xl">R{Number(data.balance).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-surface rounded-2xl border border-ink/5 p-5">
          <div className="flex gap-1 mb-4 bg-paper rounded-lg p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  resetForm();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-md transition-colors ${
                  tab === t.key ? "bg-surface text-teal-dark shadow-sm" : "text-ink-soft"
                }`}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "transfer" && (
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient username"
                required
                className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            )}
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (R)"
              required
              className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
            {(tab === "deposit" || tab === "withdraw") && data.methods.length > 0 && (
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                {data.methods.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
            {tab === "withdraw" && (
              <>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="Account / number to receive funds"
                  required
                  className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                <p className="text-xs text-ink-soft">
                  Minimum withdrawal: R{Number(data.min_withdrawal).toFixed(2)}
                </p>
              </>
            )}
            <SubmitButton loading={submitting}>
              {tab === "deposit" ? "Deposit" : tab === "withdraw" ? "Request withdrawal" : "Send"}
            </SubmitButton>
          </form>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <h2 className="font-display font-semibold text-ink p-5 pb-0">Recent Transactions</h2>
          {data.transactions.length === 0 ? (
            <p className="text-center text-ink-soft py-10">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="text-left text-ink-soft border-b border-ink/5">
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t.id} className="border-b border-ink/5 last:border-0">
                      <td className="p-4">
                        <p className="font-medium text-ink text-xs">{t.tx_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-ink-soft truncate max-w-[200px]">{t.note}</p>
                      </td>
                      <td className="p-4 font-mono font-semibold text-ink">R{t.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${statusStyles[t.status] || "bg-paper text-ink"}`}>
                          {t.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4 text-ink-soft text-xs">
                        {new Date(t.created_at).toLocaleDateString(undefined, {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
