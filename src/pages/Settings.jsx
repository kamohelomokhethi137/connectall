import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchSettings, updateSettings } from "../lib/profile";

const TOGGLES = [
  { key: "notify_email", label: "Email notifications", hint: "Get emailed about payments, security events, and account changes." },
  { key: "notify_push", label: "Push notifications", hint: "Receive browser push alerts for important updates." },
  { key: "notify_marketing", label: "Marketing emails", hint: "Occasional news about new features and promotions." },
  { key: "show_balance", label: "Show wallet balance", hint: "Display your balance on the dashboard instead of hiding it." },
  { key: "profile_public", label: "Public bio page", hint: "Let anyone visit your bio page at your public username URL." },
];

const THEMES = [
  { value: "teal", label: "Teal", swatch: "bg-teal" },
  { value: "gold", label: "Gold", swatch: "bg-gold" },
  { value: "navy", label: "Navy", swatch: "bg-navy" },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
        checked ? "bg-teal" : "bg-ink/15"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [themeColor, setThemeColor] = useState("teal");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchSettings();
      setSettings(data.settings);
      if (data.settings.theme_color) setThemeColor(data.settings.theme_color);
    } catch (err) {
      setError(err.message || "Couldn't load your settings.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        await updateSettings({ ...settings, theme_color: themeColor });
        toast.success("Settings saved.");
      } catch (err) {
        toast.error(err.message || "Couldn't save your settings.");
      } finally {
        setSaving(false);
      }
    },
    [settings, themeColor]
  );

  if (error) {
    return (
      <DashboardLayout title="Settings">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout title="Settings">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        <div className="bg-surface rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Notifications & Privacy</h2>
          <div className="divide-y divide-ink/5">
            {TOGGLES.map((t) => (
              <div key={t.key} className="flex items-center justify-between py-3.5 gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{t.hint}</p>
                </div>
                <Toggle checked={!!settings[t.key]} onChange={() => toggle(t.key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">Theme color</h2>
          <div className="flex gap-3">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setThemeColor(t.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                  themeColor === t.value ? "border-teal-dark bg-teal/5" : "border-ink/10"
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${t.swatch}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <SubmitButton loading={saving}>Save settings</SubmitButton>
      </form>
    </DashboardLayout>
  );
}
