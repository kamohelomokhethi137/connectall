import { useEffect, useRef, useState, useMemo } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * segments: [{ text: string, highlight?: boolean }, ...]
 *   The paragraph broken into pieces. Pieces with highlight:true get the
 *   highlight class and a one-time "pop" animation as soon as typing
 *   finishes that piece.
 *
 * speed: ms per character.
 * startDelay: ms to wait after the element enters view before typing starts.
 * as: tag to render ('p', 'span', 'div'...). Defaults to 'p'.
 *
 * Performance notes:
 * - Only starts once the element is in the viewport (IntersectionObserver),
 *   so it costs nothing while scrolled past.
 * - Uses requestAnimationFrame with elapsed-time stepping rather than
 *   setInterval, so it naturally pauses when the tab is backgrounded and
 *   doesn't drift.
 * - setState is only called when the visible character count actually
 *   changes (throttled to `speed`), not on every animation frame.
 * - The highlight "pop" animates transform + opacity only — both are
 *   compositor-only properties, so it never triggers layout or paint of
 *   surrounding content.
 * - Respects prefers-reduced-motion: renders the full final text
 *   immediately with no animation loop at all.
 */
const TypewriterHighlight = ({
  segments,
  speed = 26,
  startDelay = 250,
  className = '',
  highlightClassName = 'twh-highlight',
  cursorClassName = 'twh-cursor',
  showCursor = true,
  as = 'p',
  onDone
}) => {
  const containerRef = useRef(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const reduceMotionRef = useRef(false);

  const { fullText, boundaries } = useMemo(() => {
    let text = '';
    const b = [];
    segments.forEach(seg => {
      const start = text.length;
      text += seg.text;
      b.push({ start, end: text.length, highlight: !!seg.highlight });
    });
    return { fullText: text, boundaries: b };
  }, [segments]);

  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion();
    if (reduceMotionRef.current) {
      setRevealedCount(fullText.length);
      setStarted(true);
      setDone(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fullText.length]);

  useEffect(() => {
    if (!started || reduceMotionRef.current) return;

    const tick = t => {
      if (startTimeRef.current === null) startTimeRef.current = t + startDelay;
      const elapsed = t - startTimeRef.current;
      if (elapsed >= 0) {
        const count = Math.min(fullText.length, Math.floor(elapsed / speed));
        setRevealedCount(prev => (count !== prev ? count : prev));
        if (count >= fullText.length) {
          setDone(true);
          onDone?.();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [started, fullText.length, speed, startDelay, onDone]);

  const Tag = as;

  return (
    <Tag ref={containerRef} className={className} role="text" aria-label={fullText}>
      <span aria-hidden="true">
        {boundaries.map((b, i) => {
          if (revealedCount <= b.start) return null;
          const end = Math.min(b.end, revealedCount);
          const text = fullText.slice(b.start, end);
          const segDone = end >= b.end;
          return (
            <span
              key={i}
              className={b.highlight ? `${highlightClassName}${segDone ? ' twh-pop' : ''}` : undefined}
            >
              {text}
            </span>
          );
        })}
        {showCursor && !done && <span className={cursorClassName} />}
      </span>
      <style>{`
        .twh-highlight {
          color: #7DE0D6; /* teal-light-ish, adjust to your palette */
          font-weight: 600;
        }
        .twh-pop {
          animation: twh-pop-in 0.35s ease-out;
        }
        @keyframes twh-pop-in {
          0% { opacity: 0.55; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        .twh-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          margin-left: 2px;
          vertical-align: -0.15em;
          background: currentColor;
          animation: twh-blink 1s steps(1, jump-none) infinite;
        }
        @keyframes twh-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .twh-cursor { display: none; }
          .twh-pop { animation: none; }
        }
      `}</style>
    </Tag>
  );
};

export default TypewriterHighlight;
