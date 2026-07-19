import { memo } from "react";
import { usePasswordStrength } from "../hooks/usePasswordStrength";

const barColors = ["bg-ink/10", "bg-red-400", "bg-gold", "bg-gold", "bg-teal"];

function PasswordStrengthBase({ password }) {
  const { score, label, hints } = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? barColors[score] : "bg-ink/10"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-xs text-ink-soft">{label}</p>
        {hints[0] && <p className="text-xs text-ink-soft/70">{hints[0]}</p>}
      </div>
    </div>
  );
}

// Re-renders only when the password prop actually changes, not when
// sibling fields (email, phone, etc.) update on the same form.
export default memo(PasswordStrengthBase);
