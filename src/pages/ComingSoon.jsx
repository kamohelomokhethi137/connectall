import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Mark from "../components/Mark";

export default function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
        <div className="text-center max-w-sm">
          <span className="inline-flex w-12 h-12 rounded-full bg-navy/5 items-center justify-center text-navy mb-6">
            <Mark className="w-6 h-6" />
          </span>
          <p className="font-mono text-xs uppercase tracking-widest text-teal-dark">
            In progress
          </p>
          <h1 className="font-display font-semibold text-2xl text-ink mt-2">
            {title}
          </h1>
          <p className="text-ink-soft text-sm mt-3 leading-relaxed">
            This page is being rebuilt right now. Check back shortly, or
            head back to the homepage.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 text-sm font-semibold text-teal-dark hover:underline"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
