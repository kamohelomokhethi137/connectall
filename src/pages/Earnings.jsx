import { useState, useEffect, useCallback, useMemo } from "react";
import { FiMousePointer, FiSquare, FiUsers, FiGift, FiDollarSign } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchEarnings } from "../lib/activity";

const sourceIcons = {
  CLICK: FiMousePointer,
  QR: FiSquare,
  REFERRAL: FiUsers,
  BONUS: FiGift,
};

const cardColors = ["bg-navy", "bg-teal", "bg-gold", "bg-navy-light"];

export default function Earnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchEarnings();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load your earnings.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const breakdownEntries = useMemo(
    () => (data ? Object.entries(data.breakdown) : []),
    [data]
  );

  if (error) {
    return (
      <DashboardLayout title="Earnings">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Earnings">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Earnings">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {breakdownEntries.length === 0 && (
          <p className="text-ink-soft col-span-full">No earnings yet.</p>
        )}
        {breakdownEntries.map(([source, amount], i) => {
          const Icon = sourceIcons[source] || FiDollarSign;
          return (
            <div key={source} className={`${cardColors[i % 4]} rounded-2xl p-5 text-white`}>
              <Icon size={22} className="mb-4 opacity-80" aria-hidden="true" />
              <p className="font-display font-semibold text-2xl">R{amount.toFixed(2)}</p>
              <p className="text-xs text-white/60 mt-1">From {source}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
        {data.earnings.length === 0 ? (
          <p className="text-center text-ink-soft py-10">No earnings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">Source</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((e) => (
                  <tr key={e.id} className="border-b border-ink/5 last:border-0">
                    <td className="p-4">
                      <span className="bg-paper text-ink px-2 py-1 rounded text-xs">
                        {e.source}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-teal-dark">
                      +R{e.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="bg-teal/10 text-teal-dark px-2 py-1 rounded text-xs capitalize">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 text-ink-soft text-xs">
                      {new Date(e.created_at).toLocaleString(undefined, {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
