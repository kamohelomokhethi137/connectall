// Shared Framer Motion variants for the marketing site.
//
// Rules these follow, on purpose:
// - Only ever animate `opacity`, `x`, `y`, `scale` — all compositor-only
//   properties. Never `width`/`height`/`top`/`left`, which force layout.
// - Every scroll-triggered reveal uses `viewport={{ once: true }}` at the
//   call site, so it fires once and never re-triggers on scroll-back —
//   that's the usual source of janky, expensive repeated animation.
// - `useReducedMotion()` (from framer-motion) should gate these at the
//   call site: pass the flag in and use `noMotion(variant)` below to get
//   an instant, motion-free version instead of skipping animation setup
//   entirely — keeps every component's JSX identical either way.

export const EASE_PREMIUM = [0.16, 1, 0.3, 1]; // expo-out, reads as "settling", not "bouncing"

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_PREMIUM } }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE_PREMIUM } }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } }
});

// Strips motion from a variant pair while keeping the same shape, so
// components don't need an if/else branch — just build variants with
// `noMotion(fadeUp, shouldReduceMotion)` and render normally.
export const noMotion = (variant, shouldReduce) => {
  if (!shouldReduce) return variant;
  return {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { duration: 0 } }
  };
};

// Subtle, cheap hover/tap micro-interaction for buttons/links — scale only.
export const tapScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.15, ease: EASE_PREMIUM }
};
