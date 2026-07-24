import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiRadio } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CardSkeletonGrid } from "../components/Skeleton";
import { fetchLiveStreams } from "../lib/live";

export default function Live() {
  const [streams, setStreams] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchLiveStreams();
      setStreams(data.streams || []);
    } catch (err) {
      setError(err.message || "Couldn't load live streams.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-navy pt-32 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-display font-semibold text-3xl text-white flex items-center justify-center gap-2">
            <FiRadio className="text-red-400" aria-hidden="true" />
            Live now
          </h1>
          <p className="text-white/55 mt-2">
            Watch live broadcasts from ConnectAll Technologies.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        {streams === null && !error && <CardSkeletonGrid count={3} />}

        {error && (
          <div className="text-center py-16">
            <p className="text-ink-soft">{error}</p>
            <button
              onClick={load}
              className="mt-4 text-sm font-semibold text-teal-dark hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {streams && streams.length === 0 && (
          <p className="text-center text-ink-soft py-16">
            No one is live right now. Check back soon.
          </p>
        )}

        {streams && streams.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((s) => (
              <Link
                key={s.id}
                to={`/live/${s.id}`}
                className="bg-surface rounded-2xl border border-ink/5 overflow-hidden hover:shadow-lg hover:shadow-navy-dark/5 transition-shadow relative"
              >
                <span className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface animate-pulse" />
                  Live
                </span>
                <div className="h-32 bg-navy flex items-center justify-center">
                  <FiRadio className="text-white/30" size={36} aria-hidden="true" />
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                    {s.description}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-soft mt-3">
                    <FiEye size={13} aria-hidden="true" />
                    {s.viewer_count} watching · hosted by @{s.host_username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
