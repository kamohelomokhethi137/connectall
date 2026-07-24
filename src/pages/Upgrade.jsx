import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiAward, FiZap, FiCheck } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchUpgrade, buyTokens, subscribePlan } from "../lib/gamification";

export default function Upgrade() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchUpgrade();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load upgrade options.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBuy = useCallback(async (pkg) => {
    setBusyId(`pkg-${pkg.id}`);
    try {
      const res = await buyTokens(pkg.id);
      setData((prev) => ({ ...prev, balance: res.balance, tokens: res.tokens }));
      toast.success(`Purchased ${pkg.tokens} tokens!`);
    } catch (err) {
      toast.error(err.message || "Couldn't complete that purchase.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleSubscribe = useCallback(async (plan) => {
    setBusyId(`plan-${plan.id}`);
    try {
      const res = await subscribePlan(plan.id);
      setData((prev) => ({
        ...prev, tokens: res.tokens, is_premium_active: res.is_premium_active,
        active_sub_expires_at: res.expires_at,
      }));
      toast.success(`Subscribed to ${plan.name}!`);
    } catch (err) {
      toast.error(err.message || "Couldn't activate that plan.");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Upgrade">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Upgrade">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Upgrade">
      <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-navy mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiAward size={26} aria-hidden="true" />
          <div>
            <p className="font-display font-semibold">
              {data.is_premium_active ? "Premium Active" : "Not yet Premium"}
            </p>
            {data.active_sub_expires_at && (
              <p className="text-xs text-navy/70">
                Until {new Date(data.active_sub_expires_at).toLocaleDateString(undefined, {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="text-sm font-semibold">
          Balance: R{Number(data.balance).toFixed(2)} · {data.tokens} tokens
        </div>
      </div>

      <h2 className="font-display font-semibold text-ink mb-3">Token Packages</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.packages.length === 0 && <p className="text-ink-soft col-span-full">No packages available.</p>}
        {data.packages.map((pkg) => (
          <div key={pkg.id} className="bg-surface rounded-2xl border border-ink/5 p-5 flex flex-col">
            <FiZap className="text-teal-dark mb-3" size={20} aria-hidden="true" />
            <p className="font-display font-semibold text-ink">{pkg.name}</p>
            <p className="text-2xl font-display font-semibold text-ink mt-1">{pkg.tokens} tokens</p>
            <p className="text-sm text-ink-soft mb-4">R{pkg.price.toFixed(2)}</p>
            <button
              onClick={() => handleBuy(pkg)}
              disabled={busyId === `pkg-${pkg.id}`}
              className="mt-auto h-10 rounded-lg bg-teal hover:bg-teal-light disabled:opacity-50 text-navy font-semibold text-sm transition-colors"
            >
              {busyId === `pkg-${pkg.id}` ? "Purchasing…" : "Buy"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold text-ink mb-3">Subscription Plans</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.plans.length === 0 && <p className="text-ink-soft col-span-full">No plans available.</p>}
        {data.plans.map((plan) => (
          <div key={plan.id} className="bg-surface rounded-2xl border border-ink/5 p-5 flex flex-col">
            <p className="font-display font-semibold text-ink flex items-center gap-2">
              <FiCheck className="text-teal-dark" size={16} /> {plan.name}
            </p>
            <p className="text-sm text-ink-soft mt-1 mb-4">{plan.description}</p>
            <p className="text-xs text-ink-soft mb-4">
              {plan.token_cost} tokens · {plan.duration_days} days
            </p>
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={busyId === `plan-${plan.id}`}
              className="mt-auto h-10 rounded-lg bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {busyId === `plan-${plan.id}` ? "Activating…" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
