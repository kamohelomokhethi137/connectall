import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { FiCreditCard, FiLink2, FiMousePointer, FiBell, FiCheckSquare, FiAward, FiArrowRight, FiMessageCircle, FiUsers, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import { fetchUserDashboard } from "../lib/dashboard";
import { listRooms, listFriends, respondFriendRequest } from "../lib/chat";
import AdBanner from "../components/AdBanner";
import NativeAd from "../components/NativeAd";
import { fadeUp, staggerContainer, noMotion, tapScale } from "../lib/motionVariants";

// One semantic color per KPI, matching the same palette used across the
// dashboard nav: teal for money, navy for structure/reach, gold for
// growth, coral for things needing attention.
const kpiStyles = [
  { bg: "bg-teal", ring: "bg-white/15", icon: FiCreditCard },
  { bg: "bg-navy", ring: "bg-white/10", icon: FiLink2 },
  { bg: "bg-gold", ring: "bg-white/20", icon: FiMousePointer },
  { bg: "bg-coral", ring: "bg-white/15", icon: FiBell },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardChatWidget({ nm, shouldReduceMotion }) {
  const [rooms, setRooms] = useState(null);
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([listRooms(), listFriends()])
      .then(([roomsRes, friendsRes]) => {
        if (active) {
          setRooms(roomsRes.rooms || []);
          setIncoming(friendsRes.incoming_requests || []);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleRespond = async (id, action) => {
    try {
      await respondFriendRequest(id, action);
      setIncoming((prev) => prev.filter((r) => r.id !== id));
      toast.success(action === "accept" ? "Friend request accepted!" : "Request declined.");
    } catch (e) {
      toast.error(e.message || "Failed to respond");
    }
  };

  return (
    <m.div variants={nm(fadeUp)} className="bg-surface rounded-2xl border border-ink/5 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal"></span>
          </span>
          <h2 className="font-display font-semibold text-ink flex items-center gap-2 text-base">
            <FiMessageCircle className="text-teal-dark" size={18} /> Chatrooms & Community Hub
          </h2>
        </div>
        <Link
          to="/files"
          className="text-xs font-semibold text-teal-dark hover:underline flex items-center gap-1 bg-teal/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Open Chatrooms <FiArrowRight size={13} />
        </Link>
      </div>

      {incoming.length > 0 && (
        <div className="mb-4 bg-paper rounded-xl p-3 border border-ink/5">
          <p className="text-xs font-semibold text-ink mb-2 flex items-center gap-1.5">
            <FiUsers className="text-teal-dark" size={14} /> Friend Requests ({incoming.length})
          </p>
          <div className="space-y-2">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-surface rounded-lg p-2 text-xs">
                <span className="font-medium text-ink truncate">@{r.from.username}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRespond(r.id, "accept")}
                    className="px-2.5 py-1 rounded bg-teal text-navy font-semibold hover:bg-teal-light transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, "decline")}
                    className="px-2 py-1 rounded bg-paper text-ink-soft hover:bg-ink/10 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rooms === null ? (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-16 bg-paper animate-pulse rounded-xl" />
          <div className="h-16 bg-paper animate-pulse rounded-xl" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-6 text-center bg-paper/50 rounded-xl border border-dashed border-ink/10">
          <FiMessageCircle size={24} className="mx-auto text-ink-soft/40 mb-2" />
          <p className="text-sm font-medium text-ink">No active conversations yet</p>
          <p className="text-xs text-ink-soft mt-0.5">Start chatting or create a group room with your friends!</p>
          <Link
            to="/files"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-teal text-navy px-3.5 py-2 rounded-lg hover:bg-teal-light transition-colors"
          >
            Start a Conversation <FiPlus size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.slice(0, 6).map((room) => {
            const title = room.type === "GROUP" ? room.name : room.other_member?.username || "Direct Chat";
            return (
              <m.div
                key={room.uuid}
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                className="group relative bg-paper hover:bg-teal/5 border border-ink/5 hover:border-teal/30 rounded-xl p-3.5 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {title[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink truncate group-hover:text-teal-dark transition-colors">
                      {title}
                    </p>
                    <p className="text-[11px] text-ink-soft truncate mt-0.5">
                      {room.last_message ? room.last_message.body : "No messages yet"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-ink/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider">
                    {room.type === "GROUP" ? "Group Room" : "Direct Chat"}
                  </span>
                  <Link
                    to={`/files?room=${room.uuid}`}
                    className="text-xs font-semibold text-teal-dark group-hover:underline flex items-center gap-1"
                  >
                    Chat <FiArrowRight size={11} />
                  </Link>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </m.div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const nm = (variant) => noMotion(variant, shouldReduceMotion);

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
        <div className="h-8 w-56 rounded-lg bg-white/60 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* domAnimation covers the transform/opacity animations used here
          without pulling in the full Framer Motion feature set. */}
      <LazyMotion features={domAnimation}>
        <m.div initial="hidden" animate="show" variants={nm(staggerContainer(0.08))}>
          {/* Greeting */}
          <m.div variants={nm(fadeUp)} className="mb-6">
            <h2 className="font-display font-semibold text-2xl text-ink">
              {greeting()}, {user?.username}
            </h2>
            <p className="text-ink-soft text-sm mt-1">Here's what's happening with your account today.</p>
          </m.div>

          {/* Top Banner Ad - with scroll fix */}
          <m.div variants={nm(fadeUp)} className="mb-4 bg-surface rounded-2xl border border-ink/5 p-4 touch-pan-y">
            <div className="flex justify-center" style={{ pointerEvents: "none" }}>
              <div style={{ pointerEvents: "auto" }}>
                <AdBanner />
              </div>
            </div>
          </m.div>

          {/* KPI cards */}
          <m.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={nm(staggerContainer(0.06))}
          >
            {kpis.map((kpi, i) => {
              const Icon = kpiStyles[i].icon;
              return (
                <m.div
                  key={kpi.label}
                  variants={nm(fadeUp)}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`${kpiStyles[i].bg} rounded-2xl p-5 text-white`}
                >
                  <span className={`inline-flex w-9 h-9 rounded-xl ${kpiStyles[i].ring} items-center justify-center mb-4`}>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <p className="font-display font-semibold text-2xl">{kpi.value}</p>
                  <p className="text-xs text-white/70 mt-1">{kpi.label}</p>
                </m.div>
              );
            })}
          </m.div>

          {/* Chatrooms & Community Hub Widget */}
          <DashboardChatWidget nm={nm} shouldReduceMotion={shouldReduceMotion} />

          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            {/* Earnings chart */}
            <m.div variants={nm(fadeUp)} className="lg:col-span-2 bg-surface rounded-2xl border border-ink/5 p-5">
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
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#10192B10"} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: isDark ? "#94A3B8" : "#4A5568" }} />
                    <YAxis tick={{ fontSize: 12, fill: isDark ? "#94A3B8" : "#4A5568" }} />
                    <Tooltip
                      formatter={(v) => [`R${v}`, "Earnings"]}
                      contentStyle={{ borderRadius: 8, fontSize: 13, background: isDark ? "#1E293B" : "#fff", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", color: isDark ? "#F1F5F9" : "#10192B" }}
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
            </m.div>

            {/* Top links */}
            <m.div variants={nm(fadeUp)} className="bg-surface rounded-2xl border border-ink/5 p-5">
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
            </m.div>
          </div>

          {/* Native Ad between content sections - with scroll fix */}
          <m.div variants={nm(fadeUp)} className="mt-4 touch-pan-y" style={{ pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto" }}>
              <NativeAd />
            </div>
          </m.div>

          {/* Promo cards */}
          <m.div className="grid lg:grid-cols-2 gap-4 mt-4" variants={nm(staggerContainer(0.08))}>
            <m.div variants={nm(fadeUp)} className="bg-gradient-to-br from-teal to-teal-dark rounded-2xl p-6 text-white">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <FiCheckSquare aria-hidden="true" /> Daily Tasks
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Earn points and tokens by logging in, creating links, watching
                live streams, and more.
              </p>
              <m.div className="inline-block" whileHover={shouldReduceMotion ? undefined : tapScale.whileHover} whileTap={shouldReduceMotion ? undefined : tapScale.whileTap} transition={tapScale.transition}>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-1.5 bg-white text-teal-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                >
                  View Tasks <FiArrowRight size={14} />
                </Link>
              </m.div>
            </m.div>

            <m.div variants={nm(fadeUp)} className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-navy">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <FiAward aria-hidden="true" />
                {data.is_premium_active ? "Premium Active" : "Go Premium"}
              </h3>
              <p className="text-sm text-navy/80 mb-4">
                {data.is_premium_active
                  ? "Enjoy unlimited links and priority placement."
                  : "Buy tokens and subscribe to unlock unlimited smart links and more."}
              </p>
              <m.div className="inline-block" whileHover={shouldReduceMotion ? undefined : tapScale.whileHover} whileTap={shouldReduceMotion ? undefined : tapScale.whileTap} transition={tapScale.transition}>
                <Link
                  to="/upgrade"
                  className="inline-flex items-center gap-1.5 bg-navy text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors"
                >
                  {data.is_premium_active ? "Manage Plan" : "Upgrade Now"} <FiArrowRight size={14} />
                </Link>
              </m.div>
            </m.div>
          </m.div>
        </m.div>
      </LazyMotion>
    </DashboardLayout>
  );
}
