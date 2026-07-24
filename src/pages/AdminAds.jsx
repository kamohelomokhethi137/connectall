import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiPause, FiX, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminAds, approveAd, pauseAd, rejectAd, deleteAd } from "../lib/admin";

const statusStyles = {
  ACTIVE: "bg-teal/10 text-teal-dark",
  PENDING: "bg-gold/10 text-gold-dark",
  PAUSED: "bg-paper text-ink-soft",
  REJECTED: "bg-red-50 text-red-500",
};

function AdRow({ ad, onApprove, onPause, onReject, onDelete, busy }) {
  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="p-4">
        <p className="font-medium text-ink text-sm">{ad.title}</p>
        <p className="text-xs text-ink-soft">{ad.advertiser_name}</p>
      </td>
      <td className="p-4 text-xs text-ink-soft capitalize">{ad.ad_type.toLowerCase()}</td>
      <td className="p-4 text-xs text-ink-soft">R{ad.spent_total.toFixed(2)} / R{ad.total_budget.toFixed(2)}</td>
      <td className="p-4 text-xs text-ink-soft">{ad.impressions} views \u00b7 {ad.clicks} clicks</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-xs ${statusStyles[ad.status] || "bg-paper text-ink"}`}>{ad.status}</span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          {ad.status === "PENDING" && (
            <>
              <button onClick={() => onApprove(ad.id)} disabled={busy === ad.id} className="text-teal-dark hover:text-teal-light disabled:opacity-40" aria-label="Approve"><FiCheck size={15} /></button>
              <button onClick={() => onReject(ad.id)} disabled={busy === ad.id} className="text-red-500 hover:text-red-600 disabled:opacity-40" aria-label="Reject"><FiX size={15} /></button>
            </>
          )}
          {ad.status === "ACTIVE" && (
            <button onClick={() => onPause(ad.id)} disabled={busy === ad.id} className="text-gold-dark hover:opacity-80 disabled:opacity-40" aria-label="Pause"><FiPause size={15} /></button>
          )}
          <button onClick={() => onDelete(ad.id)} disabled={busy === ad.id} className="text-red-500 hover:text-red-600 disabled:opacity-40" aria-label="Delete"><FiTrash2 size={15} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminAds() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchAdminAds();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load ads.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = useCallback(
    (fn, successMsg) => async (id) => {
      setBusy(id);
      try {
        const res = await fn(id);
        load();
        toast.success(successMsg);
        return res;
      } catch (err) {
        toast.error(err.message || "That action couldn't be completed.");
      } finally {
        setBusy(null);
      }
    },
    [load]
  );

  const handleApprove = act(approveAd, "Ad approved.");
  const handlePause = act(pauseAd, "Ad paused.");
  const handleReject = act(rejectAd, "Ad rejected.");
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this ad?")) return;
    setBusy(id);
    try {
      await deleteAd(id);
      load();
      toast.success("Ad deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that ad.");
    } finally {
      setBusy(null);
    }
  }, [load]);

  if (error) {
    return (
      <DashboardLayout title="Manage Ads">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Manage Ads">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  const sections = [
    ["Pending review", data.pending],
    ["Active", data.active],
    ["Other", data.other],
  ];

  return (
    <DashboardLayout title="Manage Ads">
      {sections.map(([label, ads]) => (
        <div key={label} className="bg-surface rounded-2xl border border-ink/5 overflow-hidden mb-6">
          <h2 className="font-display font-semibold text-ink p-5 pb-0">{label} ({ads.length})</h2>
          {ads.length === 0 ? (
            <p className="text-center text-ink-soft py-8">Nothing here.</p>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm mt-3">
              <tbody>
                {ads.map((ad) => (
                  <AdRow key={ad.id} ad={ad} onApprove={handleApprove} onPause={handlePause}
                         onReject={handleReject} onDelete={handleDelete} busy={busy} />
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      ))}
    </DashboardLayout>
  );
}
