import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiCreditCard } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import {
  fetchPaymentMethods, addPaymentMethod, togglePaymentMethod, deletePaymentMethod,
} from "../lib/adminPaymentMethods";

const TYPES = [
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
];

const initialForm = { name: "", method_type: "mobile_money", account_number: "", account_name: "", instructions: "" };

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchPaymentMethods();
      setMethods(data.methods);
    } catch (err) {
      toast.error(err.message || "Couldn't load payment methods.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim() || !form.account_number.trim()) {
        toast.error("Name and account number are required.");
        return;
      }
      setCreating(true);
      try {
        const data = await addPaymentMethod(form);
        setMethods((prev) => [data.method, ...(prev || [])]);
        setForm(initialForm);
        toast.success("Payment method added.");
      } catch (err) {
        toast.error(err.message || "Couldn't add that payment method.");
      } finally {
        setCreating(false);
      }
    },
    [form]
  );

  const handleToggle = useCallback(async (id) => {
    setBusyId(id);
    try {
      const data = await togglePaymentMethod(id);
      setMethods((prev) => prev.map((m) => (m.id === id ? data.method : m)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that method.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this payment method?")) return;
    setBusyId(id);
    try {
      await deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success("Payment method deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that method.");
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <DashboardLayout title="Payment Methods">
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiPlus className="text-teal-dark" /> Add a payment destination
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name (e.g. M-Pesa)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <select
            value={form.method_type}
            onChange={(e) => setForm((f) => ({ ...f, method_type: e.target.value }))}
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Account number"
            value={form.account_number}
            onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <input
            type="text"
            placeholder="Account name"
            value={form.account_name}
            onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <textarea
            placeholder="Instructions for users (optional)"
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            rows={2}
            className="md:col-span-2 rounded-lg border border-ink/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
          />
        </div>
        <div className="mt-4 max-w-xs">
          <SubmitButton loading={creating}>Add method</SubmitButton>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        {methods === null && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-ink/5 rounded animate-pulse" />
            ))}
          </div>
        )}

        {methods && methods.length === 0 && (
          <p className="text-center text-ink-soft py-10">No payment methods yet.</p>
        )}

        {methods && methods.length > 0 && (
          <ul className="divide-y divide-ink/5">
            {methods.map((m) => (
              <li key={m.id} className="flex items-center gap-4 p-4">
                <span className="w-10 h-10 rounded-lg bg-navy/5 text-navy flex items-center justify-center shrink-0">
                  <FiCreditCard size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">
                    {m.name}{" "}
                    <span className="text-ink-soft/60 font-normal text-xs">
                      ({TYPES.find((t) => t.value === m.method_type)?.label || m.method_type})
                    </span>
                  </p>
                  <p className="text-xs text-ink-soft">
                    {m.account_number}{m.account_name ? ` · ${m.account_name}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(m.id)}
                  disabled={busyId === m.id}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded ${
                    m.is_active ? "text-teal-dark bg-teal/10" : "text-ink-soft bg-ink/5"
                  }`}
                >
                  {m.is_active ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                  {m.is_active ? "Active" : "Disabled"}
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={busyId === m.id}
                  className="text-red-500 hover:text-red-600 disabled:opacity-40"
                  aria-label="Delete method"
                >
                  <FiTrash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
