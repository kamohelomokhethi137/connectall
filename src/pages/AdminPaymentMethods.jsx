import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchPaymentMethods, addPaymentMethod, togglePaymentMethod, deletePaymentMethod } from "../lib/admin";

const emptyForm = { name: "", method_type: "mobile_money", account_number: "", account_name: "", instructions: "" };

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchPaymentMethods();
      setMethods(data.methods);
    } catch (err) {
      setError(err.message || "Couldn't load payment methods.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim() || !form.account_number.trim()) {
        toast.error("Name and account number are required.");
        return;
      }
      setAdding(true);
      try {
        const res = await addPaymentMethod(form);
        setMethods((prev) => [res.method, ...prev]);
        setForm(emptyForm);
        toast.success("Payment method added.");
      } catch (err) {
        toast.error(err.message || "Couldn't add that method.");
      } finally {
        setAdding(false);
      }
    },
    [form]
  );

  const handleToggle = useCallback(async (id) => {
    try {
      const res = await togglePaymentMethod(id);
      setMethods((prev) => prev.map((m) => (m.id === id ? res.method : m)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that method.");
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this payment method?")) return;
    try {
      await deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success("Payment method deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that method.");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Payment Methods">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Methods">
      <div className="bg-surface rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiPlus className="text-teal-dark" /> Add payment method
        </h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                 placeholder="Name (e.g. M-Pesa)" required
                 className="h-11 rounded-lg border border-ink/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <select value={form.method_type} onChange={(e) => setForm((f) => ({ ...f, method_type: e.target.value }))}
                  className="h-11 rounded-lg border border-ink/10 px-3 text-sm text-ink bg-surface">
            <option value="mobile_money">Mobile Money</option>
            <option value="bank">Bank</option>
            <option value="card">Card</option>
          </select>
          <input value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
                 placeholder="Account number" required
                 className="h-11 rounded-lg border border-ink/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={form.account_name} onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
                 placeholder="Account name"
                 className="h-11 rounded-lg border border-ink/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <SubmitButton loading={adding}>Add</SubmitButton>
          <input value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                 placeholder="Instructions for users (optional)"
                 className="sm:col-span-2 lg:col-span-5 h-11 rounded-lg border border-ink/10 bg-surface px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
        </form>
      </div>

      {!methods ? (
        <div className="h-48 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      ) : (
        <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b border-ink/5">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Account</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium text-ink">{m.name}</td>
                  <td className="p-4 text-ink-soft capitalize">{m.method_type.replace("_", " ")}</td>
                  <td className="p-4 text-ink-soft">{m.account_number}{m.account_name ? ` (${m.account_name})` : ""}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(m.id)}
                            className={`px-2 py-1 rounded text-xs ${m.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
                      {m.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-600" aria-label="Delete">
                      <FiTrash2 size={15} />
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
