import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import {
  fetchAdminTokenPackages, addTokenPackage, toggleTokenPackage,
  addSubscriptionPlan, toggleSubscriptionPlan,
} from "../lib/admin";

export default function AdminTokens() {
  const [packages, setPackages] = useState(null);
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  const [pkgForm, setPkgForm] = useState({ name: "", tokens: "", price: "" });
  const [planForm, setPlanForm] = useState({ name: "", description: "", token_cost: "", duration_days: 30 });
  const [addingPkg, setAddingPkg] = useState(false);
  const [addingPlan, setAddingPlan] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdminTokenPackages();
      setPackages(data.packages);
      setPlans(data.plans);
    } catch (err) {
      setError(err.message || "Couldn't load tokens & plans.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddPkg = useCallback(
    async (e) => {
      e.preventDefault();
      if (!pkgForm.name.trim()) {
        toast.error("Package name is required.");
        return;
      }
      setAddingPkg(true);
      try {
        const res = await addTokenPackage(pkgForm);
        setPackages((prev) => [...prev, res.package].sort((a, b) => a.price - b.price));
        setPkgForm({ name: "", tokens: "", price: "" });
        toast.success("Token package created.");
      } catch (err) {
        toast.error(err.message || "Couldn't create that package.");
      } finally {
        setAddingPkg(false);
      }
    },
    [pkgForm]
  );

  const handleAddPlan = useCallback(
    async (e) => {
      e.preventDefault();
      if (!planForm.name.trim()) {
        toast.error("Plan name is required.");
        return;
      }
      setAddingPlan(true);
      try {
        const res = await addSubscriptionPlan(planForm);
        setPlans((prev) => [...prev, res.plan].sort((a, b) => a.token_cost - b.token_cost));
        setPlanForm({ name: "", description: "", token_cost: "", duration_days: 30 });
        toast.success("Subscription plan created.");
      } catch (err) {
        toast.error(err.message || "Couldn't create that plan.");
      } finally {
        setAddingPlan(false);
      }
    },
    [planForm]
  );

  const handleTogglePkg = useCallback(async (id) => {
    try {
      const res = await toggleTokenPackage(id);
      setPackages((prev) => prev.map((p) => (p.id === id ? res.package : p)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that package.");
    }
  }, []);

  const handleTogglePlan = useCallback(async (id) => {
    try {
      const res = await toggleSubscriptionPlan(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? res.plan : p)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that plan.");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Tokens & Plans">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!packages) {
    return (
      <DashboardLayout title="Tokens & Plans">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tokens & Plans">
      <h2 className="font-display font-semibold text-ink mb-3">Token Packages</h2>
      <div className="bg-surface rounded-2xl border border-ink/5 p-5 mb-4">
        <form onSubmit={handleAddPkg} className="grid sm:grid-cols-4 gap-3">
          <input value={pkgForm.name} onChange={(e) => setPkgForm((f) => ({ ...f, name: e.target.value }))}
                 placeholder="Name" required
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={pkgForm.tokens} onChange={(e) => setPkgForm((f) => ({ ...f, tokens: e.target.value }))}
                 type="number" min="0" placeholder="Tokens"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={pkgForm.price} onChange={(e) => setPkgForm((f) => ({ ...f, price: e.target.value }))}
                 type="number" step="0.01" min="0" placeholder="Price (R)"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <SubmitButton loading={addingPkg}><FiPlus className="inline mr-1" size={14} />Add</SubmitButton>
        </form>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {packages.map((p) => (
          <div key={p.id} className="bg-surface rounded-2xl border border-ink/5 p-5">
            <p className="font-medium text-ink">{p.name}</p>
            <p className="text-2xl font-display font-semibold text-ink mt-1">{p.tokens} tokens</p>
            <p className="text-sm text-ink-soft mb-3">R{p.price.toFixed(2)}</p>
            <button onClick={() => handleTogglePkg(p.id)}
                    className={`px-2 py-1 rounded text-xs ${p.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
              {p.is_active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold text-ink mb-3">Subscription Plans</h2>
      <div className="bg-surface rounded-2xl border border-ink/5 p-5 mb-4">
        <form onSubmit={handleAddPlan} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={planForm.name} onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                 placeholder="Name" required
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={planForm.token_cost} onChange={(e) => setPlanForm((f) => ({ ...f, token_cost: e.target.value }))}
                 type="number" min="0" placeholder="Token cost"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={planForm.duration_days} onChange={(e) => setPlanForm((f) => ({ ...f, duration_days: e.target.value }))}
                 type="number" min="1" placeholder="Duration (days)"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <SubmitButton loading={addingPlan}><FiPlus className="inline mr-1" size={14} />Add</SubmitButton>
          <input value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                 placeholder="Description"
                 className="sm:col-span-2 lg:col-span-4 h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
        </form>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-surface rounded-2xl border border-ink/5 p-5">
            <p className="font-medium text-ink">{p.name}</p>
            <p className="text-xs text-ink-soft mt-1 mb-3">{p.description}</p>
            <p className="text-xs text-ink-soft mb-3">{p.token_cost} tokens \u00b7 {p.duration_days} days</p>
            <button onClick={() => handleTogglePlan(p.id)}
                    className={`px-2 py-1 rounded text-xs ${p.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
              {p.is_active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
