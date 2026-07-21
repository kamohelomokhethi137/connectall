import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LedgerCard from "../components/LedgerCard";
import Mark from "../components/Mark";
import Footer from "../components/Footer";
import NativeAd from "../components/NativeAd";
import AdBanner from "../components/AdBanner";
import SocialBarAd from "../components/SocialBarAd";
import TypewriterHighlight from "../components/TypewriterHighlight";
import CyclingCTA from "../components/CyclingCTA";
import { 
  HiLink, 
  HiWallet, 
  HiDocument, 
  HiShoppingBag, 
  HiSignal, 
  HiBell 
} from "react-icons/hi2";

const features = [
  {
    title: "Smart links",
    desc: "Shorten URLs, track clicks, and earn automatically.",
    icon: HiLink,
  },
  {
    title: "Smart link pay",
    desc: "Wallet-to-wallet transfers, QR payments, and mobile money.",
    icon: HiWallet,
  },
  {
    title: "File sharing",
    desc: "Send files, videos, and voice notes to anyone instantly.",
    icon: HiDocument,
  },
  {
    title: "Marketplace",
    desc: "Discover and engage with products. Like, comment, and shop.",
    icon: HiShoppingBag,
  },
  {
    title: "Live streaming",
    desc: "Watch live broadcasts with real-time viewer counts.",
    icon: HiSignal,
  },
  {
    title: "Smart notifications",
    desc: "Stay informed with instant alerts, even when the app is closed.",
    icon: HiBell,
  },
];

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
              One platform. <br />
              <span className="text-teal-light">Endless</span> Possibilities.
            </h1>
            <TypewriterHighlight
              className="text-white/60 text-lg mt-6 max-w-lg leading-relaxed"
              speed={22}
              segments={[
                { text: "ConnectAll Technologies brings " },
                { text: "Smart links", highlight: true },
                { text: ", " },
                { text: "Mobile payments", highlight: true },
                { text: ", " },
                { text: "Chatting", highlight: true },
                { text: ", and " },
                { text: "Live streaming", highlight: true },
                { text: " into one place." },
              ]}
            />
            <div className="flex flex-wrap gap-4 mt-8">
              <CyclingCTA
                to="/register"
                phrases={["Get started free", "Login now"]}
                interval={2800}
                className="bg-teal hover:bg-teal-light text-navy font-semibold px-6 py-3.5 rounded-lg transition-colors"
              />
              <a
                href="/how-it-works"
                className="border border-white/20 hover:border-white/40 text-white font-medium px-6 py-3.5 rounded-lg transition-colors"
              >
                How it works
              </a>
            </div>
          </div>
          <LedgerCard />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-12 -mb-8">
        <NativeAd />
      </div>

      {/* Features as statement */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 max-w-4xl mx-auto">
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

          {/* SPLIT ROW COLS GRID AD WRAPPER ENTRY */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start max-w-6xl mx-auto">
            {/* Left Column: Reusable App Features Cards Block */}
            <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden w-full">
              {features.map((f, i) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`flex items-center gap-5 px-6 sm:px-8 py-6 ${
                      i !== features.length - 1
                        ? "border-b border-dashed border-ink/10"
                        : ""
                    }`}
                  >
                    <span className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                      <IconComponent className="w-5 h-5" />
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
                );
              })}
            </div>

            {/* Right Column: 160x300 Pinned Vertical Skyscraper Card Banner Slot */}
            <div className="hidden lg:block shrink-0 sticky top-24 bg-white p-3 rounded-2xl border border-ink/5 shadow-sm">
              <span className="text-[10px] font-mono tracking-wider text-ink-soft/50 uppercase block text-center mb-2">
                Sponsored
              </span>
              <AdBanner />
            </div>
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
              Ready to get started?
            </h2>
            <p className="text-white/55 mt-3 max-w-md mx-auto">
              Join ConnectAll Technologies today and experience an all-in-one digital platform.
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