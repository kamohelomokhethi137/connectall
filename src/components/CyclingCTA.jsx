import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A <Link> whose visible label cycles through `phrases`, crossfading
 * between them. All phrases are stacked in the same CSS grid cell so the
 * button's width is fixed to the widest phrase from the first render —
 * no layout shift when the text swaps.
 *
 * Performance / accessibility:
 * - Swap animates opacity + transform only (compositor-only, no reflow).
 * - Uses setTimeout (not setInterval) chained per-cycle, and skips a tick
 *   if the tab is backgrounded (document.hidden) — never runs invisibly.
 * - prefers-reduced-motion: cycling stops entirely, first phrase stays put.
 * - Accessible name for the link comes from a single aria-label that
 *   updates with the current phrase; the visual spans are aria-hidden so
 *   screen readers get one clean announcement, not every frame of the fade.
 */
const CyclingCTA = ({
  to,
  phrases = ['Get started free', 'Login now'],
  interval = 2800,
  className = '',
  ...rest
}) => {
  const [index, setIndex] = useState(0);
  const reduceMotionRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion();
    if (reduceMotionRef.current || phrases.length < 2) return;

    const tick = () => {
      if (!document.hidden) {
        setIndex(i => (i + 1) % phrases.length);
      }
      timerRef.current = setTimeout(tick, interval);
    };
    timerRef.current = setTimeout(tick, interval);
    return () => clearTimeout(timerRef.current);
  }, [phrases.length, interval]);

  return (
    <Link to={to} aria-label={phrases[index]} className={`cta-stack ${className}`} {...rest}>
      {phrases.map((phrase, i) => (
        <span
          key={phrase}
          aria-hidden="true"
          className={`cta-item ${i === index ? 'cta-active' : 'cta-inactive'}`}
        >
          {phrase}
        </span>
      ))}
      <style>{`
        .cta-stack {
          display: inline-grid;
        }
        .cta-item {
          grid-area: 1 / 1;
          white-space: nowrap;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .cta-active {
          opacity: 1;
          transform: translateY(0);
        }
        .cta-inactive {
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .cta-item { transition: none; }
        }
      `}</style>
    </Link>
  );
};

export default CyclingCTA;
