import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlay, FiExternalLink, FiDollarSign } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdFeed, recordAdInteraction } from "../lib/ads";
import { resolveMediaUrl } from "../lib/api";

const TYPE_LABELS = {
  BANNER: "Banner Ads",
  VIDEO: "Watch & Earn",
  REWARDED: "Rewarded Videos",
  PLAYABLE: "Playable Ads",
  SURVEY: "Surveys",
  SPONSORED: "Sponsored",
  INTERSTITIAL: "Interstitials",
};

function AdCard({ ad, onComplete, busy }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden flex flex-col">
      {ad.image_url && (
        <img src={resolveMediaUrl(ad.image_url)} alt={ad.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-medium text-ink text-sm">{ad.title}</p>
        <p className="text-xs text-ink-soft mt-1 flex-1 line-clamp-2">{ad.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-teal-dark font-semibold">
            +R{ad.cost_per_completion.toFixed(2)} on completion
          </span>
          <button
            onClick={() => onComplete(ad.id)}
            disabled={busy === ad.id}
            className="flex items-center gap-1.5 text-xs font-semibold bg-teal text-navy px-3 py-1.5 rounded-lg hover:bg-teal-light disabled:opacity-50"
          >
            {ad.target_url ? <FiExternalLink size={12} /> : <FiPlay size={12} />}
            {busy === ad.id ? "…" : ad.cta_text || "View"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Ads() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdFeed();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load ads right now.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = useCallback(
    async (adId) => {
      setBusy(adId);
      try {
        const res = await recordAdInteraction(adId, "COMPLETION");
        toast.success(`You earned R${res.user_earned.toFixed(2)}!`);
        load();
      } catch (err) {
        toast.error(err.message || "Couldn't record that interaction.");
      } finally {
        setBusy(null);
      }
    },
    [load]
  );

  if (error) {
    return (
      <DashboardLayout title="Ads Earn Cash">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Ads Earn Cash">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const types = Object.keys(data.ads_by_type);

  return (
    <DashboardLayout title="Ads Earn Cash">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-navy rounded-2xl p-5 text-white flex items-center gap-3">
          <FiDollarSign size={22} className="opacity-80" aria-hidden="true" />
          <div>
            <p className="font-display font-semibold text-xl">R{data.today_earnings.toFixed(2)}</p>
            <p className="text-xs text-white/60">Earned today</p>
          </div>
        </div>
        <div className="bg-teal rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiDollarSign size={22} className="opacity-80" aria-hidden="true" />
            <div>
              <p className="font-display font-semibold text-xl">R{data.total_earnings.toFixed(2)}</p>
              <p className="text-xs text-white/70">Lifetime earnings</p>
            </div>
          </div>
          <Link to="/ads/earnings" className="text-xs font-semibold underline">
            View history
          </Link>
        </div>
      </div>

      {types.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No ads available right now. Check back later!</p>
      ) : (
        types.map((type) => (
          <div key={type} className="mb-8">
            <h2 className="font-display font-semibold text-ink mb-3">{TYPE_LABELS[type] || type}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.ads_by_type[type].map((ad) => (
                <AdCard key={ad.id} ad={ad} onComplete={handleComplete} busy={busy} />
              ))}
            </div>
          </div>
        ))
      )}
    </DashboardLayout>
  );
}
