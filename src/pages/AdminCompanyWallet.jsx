import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiBriefcase } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchCompanyWallet, companyWalletWithdraw, companyWalletTransfer } from "../lib/admin";

export default function AdminCompanyWallet() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("withdraw");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [account, setAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchCompanyWallet();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load the company wallet.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        if (tab === "withdraw") {
          const res = await companyWalletWithdraw(numAmount, method, account);
          setData((prev) => ({ ...prev, balance: res.balance }));
          toast.success("Withdrawal recorded.");
        } else {
          const res = await companyWalletTransfer(numAmount, recipient);
          setData((prev) => ({ ...prev, balance: res.balance }));
          toast.success(`R${numAmount.toFixed(2)} transferred to @${recipient}.`);
        }
        setAmount(""); setMethod(""); setAccount(""); setRecipient("");
        load();
      } catch (err) {
        toast.error(err.message || "That request couldn't be completed.");
      } finally {
        setSubmitting(false);
      }
    },
    [tab, amount, method, account, recipient, load]
  );

  if (error) {
    return (
      <DashboardLayout title="Company Wallet">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Company Wallet">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company Wallet">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-2xl p-6 text-white flex items-center gap-4">
          <FiBriefcase size={26} className="opacity-80" />
          <div>
            <p className="text-xs text-white/60">Available balance</p>
            <p className="font-display font-semibold text-3xl">R{data.balance.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-ink/5 p-6 flex items-center gap-4">
          <FiBriefcase size={26} className="text-teal-dark" />
          <div>
            <p className="text-xs text-ink-soft">Lifetime revenue</p>
            <p className="font-display font-semibold text-2xl text-ink">R{data.lifetime.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-ink/5 p-5">
          <div className="flex gap-1 mb-4 bg-paper rounded-lg p-1">
            {["withdraw", "transfer"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-md capitalize transition-colors ${tab === t ? "bg-surface text-teal-dark shadow-sm" : "text-ink-soft"}`}>
                {t}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                   placeholder="Amount (R)" required
                   className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
            {tab === "withdraw" ? (
              <>
                <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Method (e.g. Bank transfer)"
                       className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
                <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account / reference"
                       className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
              </>
            ) : (
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient username" required
                     className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
            )}
            <SubmitButton loading={submitting}>{tab === "withdraw" ? "Record withdrawal" : "Send"}</SubmitButton>
          </form>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <h2 className="font-display font-semibold text-ink p-5 pb-0">Ledger</h2>
          <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
            <tbody>
              {data.ledger.slice(0, 30).map((t) => (
                <tr key={t.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 text-xs text-ink-soft">{t.tx_type.replace(/_/g, " ")}</td>
                  <td className={`p-4 font-mono font-semibold ${t.amount < 0 ? "text-red-500" : "text-teal-dark"}`}>
                    {t.amount < 0 ? "-" : "+"}R{Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-xs text-ink-soft truncate max-w-[220px]">{t.note}</td>
                  <td className="p-4 text-xs text-ink-soft">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </DashboardLayout>
  );
}
