import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FiRadio, FiEye } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { fetchStream, sendHeartbeat, leaveStream } from "../lib/live";

const HEARTBEAT_INTERVAL_MS = 8000;

export default function LiveWatch() {
  const { id } = useParams();
  const [stream, setStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const ping = useCallback(async () => {
    try {
      const data = await sendHeartbeat(id);
      setViewerCount(data.viewer_count);
      if (!data.is_live) {
        clearInterval(intervalRef.current);
      }
    } catch {
      // A missed heartbeat isn't worth interrupting the viewer over;
      // it'll just retry on the next tick.
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchStream(id);
        if (!cancelled) {
          setStream(data.stream);
          setViewerCount(data.stream.viewer_count);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load this stream.");
      }
    })();

    ping();
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    // Best-effort: tell the backend we've left as soon as the tab closes
    // or we navigate away, so the viewer count drops promptly rather than
    // waiting for the heartbeat to just go stale.
    const handleUnload = () => {
      navigator.sendBeacon?.(`/api/live/streams/${id}/leave`, "");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      leaveStream(id).catch(() => {});
    };
  }, [id, ping]);

  if (error) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <p className="text-ink-soft">{error}</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
          <div className="relative bg-navy-dark aspect-video flex items-center justify-center">
            <FiRadio className="text-white/25" size={56} aria-hidden="true" />
            <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-surface animate-pulse" />
              Live
            </span>
            <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 text-white text-xs font-mono px-2.5 py-1 rounded">
              <FiEye size={13} aria-hidden="true" />
              {viewerCount} watching
            </span>
          </div>
          <div className="p-5">
            <h1 className="font-display font-semibold text-lg text-ink">
              {stream.title}
            </h1>
            <p className="text-ink-soft text-sm mt-1">{stream.description}</p>
            <p className="text-xs text-ink-soft/70 mt-3">
              Hosted by @{stream.host_username}
            </p>
          </div>
        </div>

        <Link
          to="/live"
          className="inline-block mt-6 text-sm font-semibold text-teal-dark hover:underline"
        >
          Back to all live streams
        </Link>
      </main>
    </div>
  );
}
