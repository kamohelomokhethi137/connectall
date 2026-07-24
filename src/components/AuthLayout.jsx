import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Mark from "../components/Mark";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      <Navbar />

      {/* Soft ambient glow behind the card, subtle and restrained */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(23,163,152,0.10) 0%, rgba(23,163,152,0) 70%)",
        }}
      />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Mark className="w-8 h-8 text-navy dark:text-teal-light" />
          <span className="font-display font-semibold text-xl text-ink">
            ConnectAll
          </span>
        </Link>

        <div className="w-full max-w-md bg-surface rounded-2xl shadow-[0_1px_2px_rgba(16,25,43,0.04),0_16px_40px_rgba(16,25,43,0.08)] border border-ink/5 px-8 py-10 sm:px-10">
          <div className="text-center mb-8">
            <h1 className="font-display font-semibold text-2xl text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="text-ink-soft text-sm mt-2">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && <div className="mt-6 text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  );
}
