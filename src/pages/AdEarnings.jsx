import { useState, useEffect, useCallback } from "react";
import { FiDollarSign } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdEarnings } from "../lib/ads";

const TYPE_LABELS = {
  BANNER: "Banner", VIDEO: "Video", REWARDED: "Rewarded",
  PLAYABLE: "Playable", SURVEY: "Survey", SPONSORED: "Sponsored",
  INTERSTITIAL: "Interstitial",
};

const cardColors = ["bg-navy", "bg-teal", "bg-gold", "bg-navy-light"];

export default function AdEarnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdEarnings();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load your ad earnings.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <DashboardLayout title="My Ad Earnings">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="My Ad Earnings">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Ad Earnings">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-navy rounded-2xl p-5 text-white">
          <FiDollarSign size={22} className="mb-4 opacity-80" aria-hidden="true" />
          <p className="font-display font-semibold text-2xl">R{data.total.toFixed(2)}</p>
          <p className="text-xs text-white/60 mt-1">Lifetime ad earnings</p>
        </div>
        {data.by_type.map((row, i) => (
          <div key={row.ad_type} className={`${cardColors[(i + 1) % 4]} rounded-2xl p-5 text-white`}>
            <p className="font-display font-semibold text-2xl">R{row.amount.toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-1">{TYPE_LABELS[row.ad_type] || row.ad_type}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
        {data.history.length === 0 ? (
          <p className="text-center text-ink-soft py-10">No ad interactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">Event</th>
                  <th className="p-4 font-medium">Earned</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0">
                    <td className="p-4">
                      <span className="bg-paper text-ink px-2 py-1 rounded text-xs">{r.event}</span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-teal-dark">
                      +R{r.user_earned.toFixed(4)}
                    </td>
                    <td className="p-4 text-ink-soft text-xs">
                      {new Date(r.created_at).toLocaleString(undefined, {
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
