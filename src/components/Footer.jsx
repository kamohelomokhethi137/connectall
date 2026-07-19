import Mark from "./Mark";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Live", href: "/live" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact us", href: "/contact" },
];

const socials = [
  {
    label: "Twitter",
    href: "#",
    path: "M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.6 11.6 0 013 4.9a4.1 4.1 0 001.3 5.5c-.6 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 01-1.9.1 4.1 4.1 0 003.8 2.9A8.3 8.3 0 012 18.4a11.6 11.6 0 006.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 8a4 4 0 100 8 4 4 0 000-8zM17 6.5h.01",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M6.5 9H3v12h3.5V9zM4.7 3a2 2 0 100 4 2 2 0 000-4zM21 14.3V21h-3.5v-6.2c0-1.6-.6-2.6-2-2.6-1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V21H10s.1-11.3 0-12.5h3.5v1.8a3.5 3.5 0 013-1.9c2.1 0 3.7 1.4 3.7 4.4z",
  },
  {
    label: "GitHub",
    href: "#",
    path: "M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.3-.2-4.6-1.1-4.6-5a4 4 0 011-2.7c-.1-.2-.5-1.3.1-2.8 0 0 .9-.3 2.9 1a10 10 0 015.2 0c2-1.3 2.9-1 2.9-1 .6 1.5.2 2.6.1 2.8a4 4 0 011 2.7c0 3.9-2.3 4.8-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10 10 0 0012 2z",
  },
];

export default function Footer({ contactEmail = "support@connectall.io" }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="/" className="flex items-center gap-2">
              <Mark className="w-6 h-6 text-teal-light" />
              <span className="font-display font-semibold text-lg">
                ConnectAll
              </span>
            </a>
            <p className="text-white/45 text-sm mt-3 leading-relaxed">
              ConnectAll Technologies. Smart links, payments, marketplace,
              and live streaming in one place.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal-light mb-4">
              Product
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal-light mb-4">
              Company
            </p>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal-light mb-4">
              Connect
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-white/45 text-sm mt-4">{contactEmail}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-white/10 mt-12 pt-6">
          <p className="text-center text-white/35 text-xs font-mono">
            © {year} ConnectAll Technologies (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
