import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LedgerCard from "../components/LedgerCard";
import Mark from "../components/Mark";
import Footer from "../components/Footer";

const features = [
  {
    title: "Smart links",
    desc: "Shorten URLs, track clicks, and earn automatically.",
    icon: "link",
  },
  {
    title: "Smart link pay",
    desc: "Wallet-to-wallet transfers, QR payments, and mobile money.",
    icon: "wallet",
  },
  {
    title: "Chats",
    desc: "videos, and voice notes to anyone instantly.",
    icon: "file",
  },
  {
    title: "Marketplace",
    desc: "Discover and engage with products. Like, comment, and shop.",
    icon: "store",
  },
  {
    title: "Live streaming",
    desc: "Watch live broadcasts with real-time viewer counts.",
    icon: "broadcast",
  },
  {
    title: "Smart notifications",
    desc: "Stay informed with instant alerts, even when the app is closed.",
    icon: "bell",
  },
];

const iconPaths = {
  link: "M9 12a3 3 0 003 3h1a3 3 0 000-6h-1M11 12a3 3 0 00-3-3H7a3 3 0 000 6h1",
  wallet: "M4 8h13a3 3 0 013 3v5a3 3 0 01-3 3H6a2 2 0 01-2-2V8zM4 8V6a2 2 0 012-2h9M15 13h2",
  file: "M7 4h6l4 4v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1zM13 4v4h4",
  store: "M5 9l1-4h12l1 4M5 9v9a1 1 0 001 1h12a1 1 0 001-1V9M5 9h14M9 19v-5h6v5",
  broadcast: "M12 15a3 3 0 100-6 3 3 0 000 6zM8.5 10.5a5 5 0 000 7M15.5 10.5a5 5 0 010 7M6 8a8 8 0 000 12M18 8a8 8 0 010 12",
  bell: "M6 8a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8zM10 17.5a2 2 0 004 0",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <Navbar />

        <div className="relative max-w-6xl mx-auto px-6 pt-36 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
           

            <h1 className="font-display font-semibold text-4xl sm:text-5xl text-white mt-6 leading-tight">
              One Platform.
              <br />
              <span className="text-teal-light">Endless</span> Possibilities.
            </h1>

           <p className="text-white/60 text-lg mt-6 max-w-lg leading-relaxed">
  ConnectAll Technologies brings{" "}
  <span className="text-teal-light font-medium">Smart links</span>,{" "}
  <span className="text-teal-light font-medium">Mobile payments</span>,{" "}
  <span className="text-teal-light font-medium">Chatting</span> and{" "}
  <span className="text-teal-light font-medium">Live streaming</span>{" "}
  into one <span className="text-teal-light font-medium">Place</span>, and{" "}
  <span className="text-teal-light font-medium">Start Earning</span>.
</p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/register"
                className="bg-teal hover:bg-teal-light text-navy font-semibold px-6 py-3.5 rounded-lg transition-colors"
              >
                Get started free
              </Link>
              <a
                href="/how-it-works"
                className="border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3.5 rounded-lg transition-colors"
              >
                How it works
              </a>
            </div>

            <div className="flex gap-10 mt-14 font-mono">
              <div>
                <p className="text-2xl font-semibold text-teal-light">
                  240+
                </p>
                <p className="text-xs text-white/45 uppercase tracking-widest mt-1">
                  Marketplace items
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gold">3</p>
                <p className="text-xs text-white/45 uppercase tracking-widest mt-1">
                  Live now
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-teal-light">
                  99.9%
                </p>
                <p className="text-xs text-white/45 uppercase tracking-widest mt-1">
                  Uptime
                </p>
              </div>
            </div>
          </div>

          <LedgerCard />
        </div>
      </section>

      {/* Features as statement */}
      <section id="features" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-widest text-teal-dark">
              What's included
            </p>
            <h2 className="font-display font-semibold text-3xl text-ink mt-2">
              Everything you need, built in
            </h2>
            <p className="text-ink-soft mt-2">
              One platform for communication, payments, and business.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`flex items-center gap-5 px-6 sm:px-8 py-6 ${
                  i !== features.length - 1
                    ? "border-b border-dashed border-ink/10"
                    : ""
                }`}
              >
                <span className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d={iconPaths[f.icon]}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="font-display font-semibold text-ink">
                    {f.title}
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5">{f.desc}</p>
                </div>
                <span className="hidden sm:inline font-mono text-xs text-ink-soft/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto relative bg-navy rounded-2xl px-8 py-14 text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <span className="inline-flex w-12 h-12 rounded-full border border-gold/40 items-center justify-center text-gold mb-6">
              <Mark className="w-6 h-6" />
            </span>
            <h2 className="font-display font-semibold text-3xl text-white">
              Ready to get started and Earn?
            </h2>
            <p className="text-white/55 mt-3 max-w-md mx-auto">
              Join ConnectAll Technologies today and experience an
              all-in-one digital platform.
            </p>
            <Link
              to="/register"
              className="inline-block mt-8 bg-teal hover:bg-teal-light text-navy font-semibold px-8 py-3.5 rounded-lg transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
