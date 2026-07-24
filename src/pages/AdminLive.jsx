import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiRadio, FiSquare } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchAdminStreams, startStream, endStream } from "../lib/admin";

export default function AdminLive() {
  const [streams, setStreams] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [starting, setStarting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdminStreams();
      setStreams(data.streams);
    } catch (err) {
      setError(err.message || "Couldn't load live streams.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = useCallback(
    async (e) => {
      e.preventDefault();
      if (!title.trim()) {
        toast.error("Give your stream a title.");
        return;
      }
      setStarting(true);
      try {
        const res = await startStream(title.trim(), description.trim());
        setStreams((prev) => [res.stream, ...prev]);
        setTitle(""); setDescription("");
        toast.success("You're live!");
      } catch (err) {
        toast.error(err.message || "Couldn't start that stream.");
      } finally {
        setStarting(false);
      }
    },
    [title, description]
  );

  const handleEnd = useCallback(async (id) => {
    setBusyId(id);
    try {
      const res = await endStream(id);
      setStreams((prev) => prev.map((s) => (s.id === id ? res.stream : s)));
      toast.success("Stream ended.");
    } catch (err) {
      toast.error(err.message || "Couldn't end that stream.");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Manage Live">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Live">
      <div className="bg-surface rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiRadio className="text-red-500" /> Go live
        </h2>
        <form onSubmit={handleStart} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Stream title" required
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <SubmitButton loading={starting}>Start stream</SubmitButton>
        </form>
      </div>

      {!streams ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-surface border border-ink/5 animate-pulse" />)}
        </div>
      ) : streams.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No streams yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((s) => (
            <div key={s.id} className="bg-surface rounded-2xl border border-ink/5 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="text-xs text-ink-soft mt-0.5 line-clamp-2">{s.description}</p>
                </div>
                {s.is_live && <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-500 shrink-0">LIVE</span>}
              </div>
              <p className="text-xs text-ink-soft mb-3">{s.viewer_count} watching</p>
              <div className="flex items-center gap-3">
                <Link to={`/live/${s.id}`} className="text-xs font-semibold text-teal-dark hover:underline">Watch</Link>
                {s.is_live && (
                  <button onClick={() => handleEnd(s.id)} disabled={busyId === s.id}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-40">
                    <FiSquare size={11} /> End
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
