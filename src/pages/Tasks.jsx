import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiGift, FiAward } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchTasks, claimTask } from "../lib/gamification";

function TaskCard({ row, onClaim, claiming }) {
  const pct = Math.min(100, Math.round((row.progress / Math.max(row.target_count, 1)) * 100));
  return (
    <div className="bg-surface rounded-2xl border border-ink/5 p-5 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-display font-semibold text-ink">{row.title}</p>
          <p className="text-xs text-ink-soft mt-0.5">{row.description}</p>
        </div>
        {row.completed && <FiCheckCircle className="text-teal-dark shrink-0" size={18} />}
      </div>

      <div className="mt-3">
        <div className="h-2 rounded-full bg-paper overflow-hidden">
          <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-ink-soft mt-1.5">
          {row.progress} / {row.target_count}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <FiAward size={13} className="text-gold-dark" /> {row.points_reward} pts
          </span>
          {row.tokens_reward > 0 && (
            <span className="flex items-center gap-1">
              <FiGift size={13} className="text-teal-dark" /> {row.tokens_reward} tokens
            </span>
          )}
        </div>
        <button
          onClick={() => onClaim(row.id)}
          disabled={!row.completed || row.claimed || claiming === row.id}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            row.claimed
              ? "bg-paper text-ink-soft cursor-default"
              : row.completed
              ? "bg-teal text-navy hover:bg-teal-light"
              : "bg-paper text-ink-soft/50 cursor-not-allowed"
          }`}
        >
          {row.claimed ? "Claimed" : "Claim"}
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message || "Couldn't load your tasks.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClaim = useCallback(async (id) => {
    setClaiming(id);
    try {
      const res = await claimTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, claimed: true } : t)));
      toast.success(res.message || "Reward claimed!");
    } catch (err) {
      toast.error(err.message || "Couldn't claim that reward.");
    } finally {
      setClaiming(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Daily Tasks">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!tasks) {
    return (
      <DashboardLayout title="Daily Tasks">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Daily Tasks">
      {tasks.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No tasks available right now. Check back soon!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((row) => (
            <TaskCard key={row.id} row={row} onClaim={handleClaim} claiming={claiming} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
