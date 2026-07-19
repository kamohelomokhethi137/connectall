import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiCreditCard, FiLink2, FiMousePointer, FiBell, FiCheckSquare, FiAward } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../lib/AuthContext";
import { fetchUserDashboard } from "../lib/dashboard";

const kpiStyles = [
  { bg: "bg-navy", icon: FiCreditCard },
  { bg: "bg-teal", icon: FiLink2 },
  { bg: "bg-gold", icon: FiMousePointer },
  { bg: "bg-navy-light", icon: FiBell },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchUserDashboard();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load your dashboard.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Only recompute the chart's shaped data when the raw values actually
  // change, not on every unrelated re-render of this page.
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.chart_labels.map((label, i) => ({
      day: label.slice(5), // MM-DD, trims the year for a tighter x-axis
      earnings: data.chart_values[i],
    }));
  }, [data]);

  const kpis = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Wallet Balance", value: `R${Number(data.balance).toFixed(2)}` },
      { label: "Smart Links", value: data.links_count },
      { label: "Total Clicks", value: data.total_clicks },
      { label: "Unread Notifications", value: data.unread_count },
    ];
  }, [data]);

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpiStyles[i].icon;
          return (
            <div key={kpi.label} className={`${kpiStyles[i].bg} rounded-2xl p-5 text-white`}>
              <Icon size={22} className="mb-4 opacity-80" aria-hidden="true" />
              <p className="font-display font-semibold text-2xl">{kpi.value}</p>
              <p className="text-xs text-white/60 mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        {/* Earnings chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">
            Earnings — Last 7 Days
          </h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-ink-soft py-12 text-center">
              No earnings yet this week.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#10192B10" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4A5568" }} />
                <YAxis tick={{ fontSize: 12, fill: "#4A5568" }} />
                <Tooltip
                  formatter={(v) => [`R${v}`, "Earnings"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#17A398"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#17A398" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top links */}
        <div className="bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-4">
            Top Performing Links
          </h2>
          {data.top_links.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No links yet.{" "}
              <Link to="/links" className="text-teal-dark font-semibold hover:underline">
                Create your first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {data.top_links.map((link) => (
                <li key={link.id} className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-sm text-ink truncate">
                    <FiLink2 size={14} className="text-teal-dark shrink-0" aria-hidden="true" />
                    <span className="truncate">{link.title}</span>
                  </span>
                  <span className="text-xs text-ink-soft bg-paper px-2 py-1 rounded shrink-0 ml-2">
                    {link.clicks} clicks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Promo cards */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-gradient-to-br from-teal to-teal-dark rounded-2xl p-6 text-white">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
            <FiCheckSquare aria-hidden="true" /> Daily Tasks
          </h3>
          <p className="text-sm text-white/80 mb-4">
            Earn points and tokens by logging in, creating links, watching
            live streams, and more.
          </p>
          <Link
            to="/tasks"
            className="inline-block bg-white text-teal-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            View Tasks
          </Link>
        </div>

        <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-navy">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
            <FiAward aria-hidden="true" />
            {data.is_premium_active ? "Premium Active" : "Go Premium"}
          </h3>
          <p className="text-sm text-navy/80 mb-4">
            {data.is_premium_active
              ? "Enjoy unlimited links and priority placement."
              : "Buy tokens and subscribe to unlock unlimited smart links and more."}
          </p>
          <Link
            to="/upgrade"
            className="inline-block bg-navy text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors"
          >
            {data.is_premium_active ? "Manage Plan" : "Upgrade Now"}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
