import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiTarget } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchPlayStatus, spinGame } from "../lib/gamification";

export default function Play() {
  const [alreadyPlayed, setAlreadyPlayed] = useState(null);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchPlayStatus();
      setAlreadyPlayed(data.already_played);
    } catch (err) {
      setError(err.message || "Couldn't load the game.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSpin = useCallback(async () => {
    setSpinning(true);
    try {
      const data = await spinGame();
      setLastWin(data.won);
      setAlreadyPlayed(true);
      toast.success(`🎉 You won ${data.won} points!`);
    } catch (err) {
      toast.error(err.message || "Couldn't spin right now.");
    } finally {
      setSpinning(false);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Play & Earn">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Play & Earn">
      <div className="max-w-md mx-auto bg-surface rounded-2xl border border-ink/5 p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-dark mx-auto flex items-center justify-center text-navy mb-5">
          <FiTarget size={36} aria-hidden="true" />
        </div>
        <h2 className="font-display font-semibold text-xl text-ink mb-2">Spin & Earn</h2>
        <p className="text-sm text-ink-soft mb-6">
          Spin once a day for a chance to win up to 50 points, free.
        </p>

        {lastWin !== null && (
          <p className="text-teal-dark font-semibold mb-4">You won {lastWin} points! 🎉</p>
        )}

        {alreadyPlayed === null ? (
          <div className="h-11 rounded-lg bg-paper animate-pulse" />
        ) : alreadyPlayed && lastWin === null ? (
          <p className="text-sm text-ink-soft py-2">
            You've already played today. Come back tomorrow!
          </p>
        ) : (
          <SubmitButton loading={spinning} onClick={handleSpin} disabled={alreadyPlayed}>
            Spin now
          </SubmitButton>
        )}
      </div>
    </DashboardLayout>
  );
}
