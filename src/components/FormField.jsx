import { useState, useId } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function FormField({
  label,
  icon: Icon,
  type = "text",
  error,
  ...inputProps
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  const isPassword = type === "password";
  const actualType = isPassword && show ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink block mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50"
            size={17}
          />
        )}
        <input
          id={id}
          type={actualType}
          className={`w-full h-11 rounded-lg border bg-surface text-sm text-ink placeholder:text-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors ${
            Icon ? "pl-11" : "pl-3.5"
          } ${isPassword ? "pr-11" : "pr-3.5"} ${
            error ? "border-red-400" : "border-ink/10"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50 hover:text-ink-soft"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
