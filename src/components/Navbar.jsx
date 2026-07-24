import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Mark from "./Mark";

const links = [
  { label: "Features", to: "/#features" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Live", to: "/live" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${
        scrolled ? "shadow-lg shadow-navy-dark/20" : ""
      }`}
      style={{
        background: "rgba(18, 18, 18, 0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Mark className="w-6 h-6 text-teal-light" />
          <span className="font-display font-semibold text-lg tracking-tight">
            ConnectAll
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-white/85 hover:text-white transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-teal hover:bg-teal-light text-navy px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Get started free
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d={open ? "M6 6L18 18M6 18L18 6" : "M4 7H20M4 12H20M4 17H20"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div         className="md:hidden bg-navy-dark/95 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-white/80 text-sm"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-white/10" />
          <Link to="/login" className="text-white/80 text-sm" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-teal text-navy text-center font-semibold text-sm px-4 py-2.5 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  );
}
