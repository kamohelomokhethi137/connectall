import Mark from "./Mark";

export default function TopBar() {
  return (
    <header className="bg-navy">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-white">
          <Mark className="w-6 h-6 text-teal-light" />
          <span className="font-display font-semibold text-lg tracking-tight">
            ConnectAll
          </span>
        </a>
        <a
          href="/login"
          className="text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Log in
        </a>
      </div>
    </header>
  );
}
