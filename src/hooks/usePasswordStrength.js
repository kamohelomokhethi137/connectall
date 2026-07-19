import { useMemo } from "react";

// Pure scoring function, kept outside the component so it's not
// recreated on every render.
function scorePassword(password) {
  if (!password) return { score: 0, label: "", hints: [] };

  let score = 0;
  const hints = [];

  if (password.length >= 8) score += 1;
  else hints.push("Use at least 8 characters");

  if (/[A-Z]/.test(password)) score += 1;
  else hints.push("Add an uppercase letter");

  if (/[0-9]/.test(password)) score += 1;
  else hints.push("Add a number");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else hints.push("Add a symbol");

  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score], hints };
}

export function usePasswordStrength(password) {
  // useMemo means this only recomputes when the password itself
  // changes, not on every unrelated re-render of the form.
  return useMemo(() => scorePassword(password), [password]);
}
