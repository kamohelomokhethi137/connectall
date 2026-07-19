import { useState, useEffect, useRef, useMemo } from "react";

const entries = [
  { label: "Smart links", tag: "TRACKED", icon: "link" },
  { label: "Wallet transfer", tag: "INSTANT", icon: "wallet" },
  { label: "File share", tag: "SECURE", icon: "file" },
  { label: "Marketplace order", tag: "LIVE", icon: "store" },
  { label: "Live stream", tag: "ON AIR", icon: "broadcast" },
  { label: "Notification", tag: "SYNCED", icon: "bell" },
];

const icons = {
  link: <path d="M9 12a3 3 0 003 3h1a3 3 0 000-6h-1M11 12a3 3 0 00-3-3H7a3 3 0 000 6h1" strokeLinecap="round" />,
  wallet: <path d="M4 8h13a3 3 0 013 3v5a3 3 0 01-3 3H6a2 2 0 01-2-2V8zM4 8V6a2 2 0 012-2h9M15 13h2" strokeLinecap="round" strokeLinejoin="round" />,
  file: <path d="M7 4h6l4 4v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1zM13 4v4h4" strokeLinecap="round" strokeLinejoin="round" />,
  store: <path d="M5 9l1-4h12l1 4M5 9v9a1 1 0 001 1h12a1 1 0 001-1V9M5 9h14M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />,
  broadcast: <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM8.5 10.5a5 5 0 000 7M15.5 10.5a5 5 0 010 7M6 8a8 8 0 000 12M18 8a8 8 0 010 12" strokeLinecap="round" />,
  bell: <path d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8zM10 17.5a2 2 0 004 0" strokeLinecap="round" strokeLinejoin="round" />,
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[name]}
    </svg>
  );
}

export default function LedgerCard() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || paused) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % entries.length);
    }, 2200);
    return () => clearInterval(intervalRef.current);
  }, [reducedMotion, paused]);

  const current = useMemo(() => entries[index], [index]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-x-4 -top-2 h-4 bg-navy-dark rounded-t-2xl" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl shadow-navy-dark/40 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="flex justify-center -mt-px">
          <div className="flex gap-2 py-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-paper" />
            ))}
          </div>
        </div>

        <div className="px-6 pt-2 pb-5 border-b border-dashed border-ink/15">
          <p className="font-mono text-[11px] tracking-widest text-ink-soft uppercase">
            Account activity
          </p>
          <p className="font-display font-semibold text-ink text-lg mt-1">
            Everything, one place
          </p>
        </div>

        {reducedMotion ? (
          /* Static fallback: no motion, full list shown at once */
          <ul className="divide-y divide-dashed divide-ink/10">
            {entries.map((e) => (
              <li key={e.label} className="flex items-center gap-3 px-6 py-3.5">
                <span className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center text-navy shrink-0">
                  <Icon name={e.icon} />
                </span>
                <span className="text-sm font-medium text-ink flex-1">{e.label}</span>
                <span className="font-mono text-[10px] tracking-wider text-teal-dark bg-teal/10 px-2 py-1 rounded">
                  {e.tag}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {/* Screen readers get the full list once, instead of the
                animation re-announcing a new item every 2.2s */}
            <ul className="sr-only">
              {entries.map((e) => (
                <li key={e.label}>{e.label}: {e.tag}</li>
              ))}
            </ul>

            {/* Animated single-line "printing" ticker, hidden from assistive tech */}
            <div className="px-6 py-6 h-[76px] flex items-center" aria-hidden="true">
              <div
                key={index}
                className="flex items-center gap-3 w-full"
                style={{ animation: "ledgerPrint 2200ms ease-out" }}
              >
                <span className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center text-navy shrink-0">
                  <Icon name={current.icon} />
                </span>
                <span className="text-sm font-medium text-ink flex-1">
                  {current.label}
                </span>
                <span className="font-mono text-[10px] tracking-wider text-teal-dark bg-teal/10 px-2 py-1 rounded shrink-0">
                  {current.tag}
                </span>
              </div>
            </div>
          </>
        )}

        {!reducedMotion && (
          <div className="flex justify-center gap-1.5 pb-4">
            {entries.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-teal" : "w-1 bg-ink/15"
                }`}
              />
            ))}
          </div>
        )}

        <div className="px-6 py-4 bg-paper flex items-center justify-between">
          <span className="font-mono text-[11px] text-ink-soft uppercase tracking-widest">
            Status
          </span>
          <span className="font-mono text-[11px] text-teal-dark font-semibold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            All systems running
          </span>
        </div>
      </div>

      <style>{`
        @keyframes ledgerPrint {
          0% { opacity: 0; transform: translateY(8px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
