import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import {
  FiDollarSign, FiLink2, FiMousePointer, FiMessageCircle, FiUsers, FiPlus,
  FiArrowRight, FiCheckSquare, FiAward, FiTrendingUp, FiRadio, FiCreditCard,
} from "react-icons/fi";
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

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon: Icon, label, value, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 bg-surface rounded-xl border border-ink/5 p-4 hover:border-teal/30 hover:shadow-sm transition-all"
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-lg text-ink group-hover:text-teal-dark transition-colors">
          {value}
        </p>
        <p className="text-xs text-ink-soft">{label}</p>
      </div>
      <FiArrowRight size={15} className="text-ink-soft/40 group-hover:text-teal-dark transition-colors shrink-0" />
    </Link>
  );
}

function EarningHero({ balance, linksCount, totalClicks }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal via-teal-dark to-navy rounded-2xl p-6 sm:p-8 text-white">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/60">Earning dashboard</span>
        </div>
        <h2 className="font-display font-semibold text-2xl sm:text-3xl mt-2 leading-tight">
          Your earnings at a glance
        </h2>
        <p className="text-white/70 text-sm mt-1.5 max-w-md">
          Turn your traffic into income. Every link, task, and stream adds to your balance.
        </p>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-6">
          <div>
            <p className="font-display font-semibold text-xl sm:text-2xl">{balance}</p>
            <p className="text-[11px] text-white/60 font-mono uppercase tracking-wider mt-0.5">Balance</p>
          </div>
          <div>
            <p className="font-display font-semibold text-xl sm:text-2xl">{linksCount}</p>
            <p className="text-[11px] text-white/60 font-mono uppercase tracking-wider mt-0.5">Smart Links</p>
          </div>
          <div>
            <p className="font-display font-semibold text-xl sm:text-2xl">{totalClicks}</p>
            <p className="text-[11px] text-white/60 font-mono uppercase tracking-wider mt-0.5">Total Clicks</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/links"
            className="inline-flex items-center gap-1.5 bg-white text-teal-dark font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
          >
            Create Link <FiPlus size={14} />
          </Link>
          <Link
            to="/wallet"
            className="inline-flex items-center gap-1.5 bg-white/15 text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Withdraw <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
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
    return () => { active = false; };
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
    <m.div variants={nm(fadeUp)}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
          <FiMessageCircle className="text-teal-dark" size={20} /> Chatrooms
        </h2>
        <Link
          to="/files"
          className="text-xs font-semibold text-teal-dark hover:underline flex items-center gap-1 bg-teal/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Open Chatrooms <FiArrowRight size={13} />
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
        {incoming.length > 0 && (
          <div className="bg-paper border-b border-ink/5 px-5 py-3">
            <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <FiUsers className="text-teal-dark" size={14} /> Friend Requests ({incoming.length})
            </p>
            <div className="space-y-2 mt-2">
              {incoming.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-surface rounded-lg p-2.5 text-xs">
                  <span className="font-medium text-ink truncate">@{r.from.username}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleRespond(r.id, "accept")} className="px-2.5 py-1 rounded bg-teal text-navy font-semibold hover:bg-teal-light transition-colors">Accept</button>
                    <button onClick={() => handleRespond(r.id, "decline")} className="px-2 py-1 rounded bg-paper text-ink-soft hover:bg-ink/10 transition-colors">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rooms === null ? (
          <div className="p-5 grid sm:grid-cols-2 gap-3">
            <div className="h-16 bg-paper animate-pulse rounded-xl" />
            <div className="h-16 bg-paper animate-pulse rounded-xl" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center">
            <FiMessageCircle size={32} className="mx-auto text-ink-soft/30 mb-2" />
            <p className="text-sm font-medium text-ink">No active conversations yet</p>
            <p className="text-xs text-ink-soft mt-0.5">Start chatting or create a group room with your friends!</p>
            <Link to="/files" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-teal text-navy px-3.5 py-2 rounded-lg hover:bg-teal-light transition-colors">
              Start a Conversation <FiPlus size={13} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {rooms.slice(0, 4).map((room) => {
              const title = room.type === "GROUP" ? room.name : room.other_member?.username || "Direct Chat";
              return (
                <Link
                  key={room.uuid}
                  to={`/files?room=${room.uuid}`}
                  className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-paper/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {title[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-teal-dark transition-colors">{title}</p>
                    <p className="text-xs text-ink-soft truncate">{room.last_message ? room.last_message.body : "No messages yet"}</p>
                  </div>
                  <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider shrink-0">
                    {room.type === "GROUP" ? "Group" : "DM"}
                  </span>
                  <FiArrowRight size={14} className="text-ink-soft/30 group-hover:text-teal-dark transition-colors shrink-0" />
                </Link>
              );
            })}
            {rooms.length > 4 && (
              <Link to="/files" className="block text-center text-xs font-semibold text-teal-dark py-3 hover:bg-paper/60 transition-colors">
                View all {rooms.length} conversations <FiArrowRight size={12} className="inline" />
              </Link>
            )}
          </div>
        )}
      </div>
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

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.chart_labels.map((label, i) => ({
      day: label.slice(5),
      earnings: data.chart_values[i],
    }));
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
        <div className="h-40 rounded-2xl bg-surface border border-ink/5 animate-pulse mb-4" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface border border-ink/5 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const quickStats = [
    { icon: FiDollarSign, label: "Wallet Balance", value: `R${Number(data.balance).toFixed(2)}`, to: "/wallet", color: "bg-teal" },
    { icon: FiLink2, label: "Smart Links", value: data.links_count, to: "/links", color: "bg-navy" },
    { icon: FiMousePointer, label: "Total Clicks", value: data.total_clicks, to: "/links", color: "bg-gold" },
    { icon: FiRadio, label: "Live Streams", value: data.live_count || 0, to: "/live", color: "bg-coral" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <LazyMotion features={domAnimation}>
        <m.div initial="hidden" animate="show" variants={nm(staggerContainer(0.08))}>
          {/* Greeting */}
          <m.div variants={nm(fadeUp)} className="mb-5">
            <h2 className="font-display font-semibold text-2xl text-ink">
              {greeting()}, {user?.username}
            </h2>
            <p className="text-ink-soft text-sm mt-0.5">Here's what's happening with your account today.</p>
          </m.div>

          {/* Hero Earning Section */}
          <m.div variants={nm(fadeUp)} className="mb-5">
            <EarningHero
              balance={`R${Number(data.balance).toFixed(2)}`}
              linksCount={data.links_count}
              totalClicks={data.total_clicks}
            />
          </m.div>

          {/* Quick Stats Row - clickable cards */}
          <m.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            variants={nm(staggerContainer(0.06))}
          >
            {quickStats.map((stat) => (
              <m.div key={stat.label} variants={nm(fadeUp)}>
                <StatCard {...stat} />
              </m.div>
            ))}
          </m.div>

          {/* Ad Banner */}
          <m.div variants={nm(fadeUp)} className="my-5 bg-surface rounded-2xl border border-ink/5 p-4 touch-pan-y">
            <div className="flex justify-center" style={{ pointerEvents: "none" }}>
              <div style={{ pointerEvents: "auto" }}>
                <AdBanner />
              </div>
            </div>
          </m.div>

          {/* Chatroom Widget - front and center */}
          <div className="mb-5">
            <DashboardChatWidget nm={nm} shouldReduceMotion={shouldReduceMotion} />
          </div>

          {/* Earnings Chart + Top Links */}
          <div className="grid lg:grid-cols-3 gap-4 mb-5">
            <m.div variants={nm(fadeUp)} className="lg:col-span-2 bg-surface rounded-2xl border border-ink/5 p-5">
              <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-teal-dark" size={18} /> Earnings — Last 7 Days
              </h2>
              {chartData.length === 0 ? (
                <p className="text-sm text-ink-soft py-12 text-center">No earnings yet this week.</p>
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
                    <Line type="monotone" dataKey="earnings" stroke="#17A398" strokeWidth={2.5} dot={{ r: 4, fill: "#17A398" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </m.div>

            <m.div variants={nm(fadeUp)} className="bg-surface rounded-2xl border border-ink/5 p-5">
              <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                <FiLink2 className="text-teal-dark" size={18} /> Top Links
                <Link to="/links" className="ml-auto text-xs font-semibold text-teal-dark hover:underline">View all</Link>
              </h2>
              {data.top_links.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  No links yet.{" "}
                  <Link to="/links" className="text-teal-dark font-semibold hover:underline">Create your first one</Link>.
                </p>
              ) : (
                <ul className="divide-y divide-ink/5">
                  {data.top_links.slice(0, 5).map((link) => (
                    <li key={link.id}>
                      <Link to="/links" className="flex items-center justify-between py-2.5 hover:bg-paper/50 -mx-2 px-2 rounded-lg transition-colors">
                        <span className="flex items-center gap-2 text-sm text-ink truncate">
                          <FiLink2 size={14} className="text-teal-dark shrink-0" />
                          <span className="truncate">{link.title}</span>
                        </span>
                        <span className="text-xs text-ink-soft bg-paper px-2 py-1 rounded shrink-0 ml-2">{link.clicks} clicks</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </m.div>
          </div>

          {/* Native Ad */}
          <m.div variants={nm(fadeUp)} className="mb-5 touch-pan-y" style={{ pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto" }}>
              <NativeAd />
            </div>
          </m.div>

          {/* Action Cards */}
          <m.div className="grid lg:grid-cols-2 gap-4" variants={nm(staggerContainer(0.08))}>
            <m.div variants={nm(fadeUp)} className="bg-gradient-to-br from-teal to-teal-dark rounded-2xl p-6 text-white">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <FiCheckSquare /> Daily Tasks
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Earn points and tokens by logging in, creating links, watching live streams, and more.
              </p>
              <m.div className="inline-block" whileHover={shouldReduceMotion ? undefined : tapScale.whileHover} whileTap={shouldReduceMotion ? undefined : tapScale.whileTap} transition={tapScale.transition}>
                <Link to="/tasks" className="inline-flex items-center gap-1.5 bg-white text-teal-dark font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                  View Tasks <FiArrowRight size={14} />
                </Link>
              </m.div>
            </m.div>

            <m.div variants={nm(fadeUp)} className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-navy">
              <h3 className="font-display font-semibold flex items-center gap-2 mb-2">
                <FiAward /> {data.is_premium_active ? "Premium Active" : "Go Premium"}
              </h3>
              <p className="text-sm text-navy/80 mb-4">
                {data.is_premium_active
                  ? "Enjoy unlimited links and priority placement."
                  : "Buy tokens and subscribe to unlock unlimited smart links and more."}
              </p>
              <m.div className="inline-block" whileHover={shouldReduceMotion ? undefined : tapScale.whileHover} whileTap={shouldReduceMotion ? undefined : tapScale.whileTap} transition={tapScale.transition}>
                <Link to="/upgrade" className="inline-flex items-center gap-1.5 bg-navy text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors">
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
