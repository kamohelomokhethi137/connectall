import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBell, FiLogOut, FiMenu, FiGrid, FiChevronDown, FiExternalLink, FiShield, FiSun, FiMoon,
} from "react-icons/fi";
import Mark from "./Mark";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import {
  navGroups, quickNavKeys, accountNav, adminNav, auditNavItem, bioPageExternalLink,
} from "../lib/navConfig";
import { EASE_PREMIUM } from "../lib/motionVariants";

// Sidebar renders on a dark navy panel, so each group gets a bright
// "light" tint that reads well there; the top-bar "more" menu sits on a
// white panel and uses the darker/"dark" tint instead. One semantic hue
// per group (not per item) keeps this disciplined rather than a rainbow.
const GROUP_STYLES = {
  neutral: {
    sidebarChip: "bg-white/10 text-white/80",
    sidebarActive: "bg-white/10 text-white",
    eyebrow: "text-white/35",
    lightChip: "bg-ink/5 text-ink-soft",
    quickActive: "text-ink border-ink",
  },
  teal: {
    sidebarChip: "bg-teal/20 text-teal-light",
    sidebarActive: "bg-teal/20 text-teal-light",
    eyebrow: "text-teal-light/70",
    lightChip: "bg-teal/12 text-teal-dark",
    quickActive: "text-teal-dark border-teal-dark",
  },
  gold: {
    sidebarChip: "bg-gold/20 text-gold-light",
    sidebarActive: "bg-gold/20 text-gold-light",
    eyebrow: "text-gold-light/70",
    lightChip: "bg-gold/15 text-gold-dark",
    quickActive: "text-gold-dark border-gold-dark",
  },
  coral: {
    sidebarChip: "bg-coral/15 text-coral-light",
    sidebarActive: "bg-coral/15 text-coral-light",
    eyebrow: "text-coral-light/70",
    lightChip: "bg-coral/15 text-coral-dark",
    quickActive: "text-coral-dark border-coral-dark",
  },
};

// Closes a floating panel (dropdown/menu) on an outside click or Escape -
// shared by the profile menu and the "more" grid menu below.
function useDismiss(onDismiss) {
  const ref = useRef(null);
  useEffect(() => {
    function handlePointer(e) {
      if (ref.current && !ref.current.contains(e.target)) onDismiss();
    }
    function handleKey(e) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onDismiss]);
  return ref;
}

function SidebarNavItem({ item, colorKey, onNavigate }) {
  const Icon = item.icon;
  const styles = GROUP_STYLES[colorKey];
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors ${
          isActive ? `${styles.sidebarActive} font-semibold` : "text-white/60 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${styles.sidebarChip}`}>
        <Icon size={14} aria-hidden="true" />
      </span>
      {item.label}
    </NavLink>
  );
}

function Sidebar({ isAdmin, isSuperAdmin, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-navy-dark shrink-0 h-full overflow-y-auto flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2">
        <Mark className="w-6 h-6 text-teal-light" />
        <span className="font-display font-semibold text-white">ConnectAll</span>
      </div>

      <nav className="flex-1 px-3 pb-6" onClick={onNavigate}>
        {navGroups.map((group) => (
          <div key={group.key} className="mb-4">
            <p className={`px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-widest ${GROUP_STYLES[group.color].eyebrow}`}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarNavItem key={item.label} item={item} colorKey={group.color} />
              ))}
            </div>
          </div>
        ))}

        <hr className="border-white/10 my-3" />
        <div className="space-y-0.5">
          {accountNav.map((item) => (
            <SidebarNavItem key={item.label} item={item} colorKey="neutral" />
          ))}
          <a
            href={bioPageExternalLink.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/10 text-white/80">
              <FiExternalLink size={14} aria-hidden="true" />
            </span>
            {bioPageExternalLink.label}
          </a>
        </div>

        {isAdmin && (
          <>
            <hr className="border-white/10 my-3" />
            <p className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-teal-light/70 flex items-center gap-1">
              <FiShield size={11} /> Admin
            </p>
            <div className="space-y-0.5">
              {adminNav.map((item) => (
                <SidebarNavItem key={item.label} item={item} colorKey="neutral" />
              ))}
              {isSuperAdmin && <SidebarNavItem item={auditNavItem} colorKey="neutral" />}
            </div>
          </>
        )}

        <hr className="border-white/10 my-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/10 text-white/80">
            <FiLogOut size={14} aria-hidden="true" />
          </span>
          Logout
        </button>
      </nav>
    </aside>
  );
}

// The handful of quick-access icons in the top bar, Facebook-style -
// Top bar persistent icon navigation for Dashboard, Chatroom, Wallet, and Live stream.
function QuickNav({ pathname }) {
  const items = navGroups.flatMap((g) => g.items.filter((i) => quickNavKeys.includes(i.to)).map((i) => ({ ...i, color: g.color })));
  // Preserve the deliberate order set in quickNavKeys.
  items.sort((a, b) => quickNavKeys.indexOf(a.to) - quickNavKeys.indexOf(b.to));

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.to;
        const styles = GROUP_STYLES[item.color];
        return (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={`relative w-10 sm:w-14 h-10 sm:h-12 rounded-lg flex items-center justify-center transition-colors border-b-2 ${
              isActive ? styles.quickActive : "text-ink-soft/70 border-transparent hover:bg-paper hover:text-ink"
            }`}
          >
            <Icon size={19} aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

import { fetchNotifications, fetchUnreadCount } from "../lib/activity";

function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  const pollUnread = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      setUnreadCount(res.unread_count || 0);
    } catch (e) {
      // silent background fail
    }
  }, []);

  useEffect(() => {
    pollUnread();
    const interval = setInterval(pollUnread, 15000);
    return () => clearInterval(interval);
  }, [pollUnread]);

  const toggleMenu = async () => {
    if (!open) {
      setLoading(true);
      setOpen(true);
      try {
        const res = await fetchNotifications();
        setItems(res.notifications || []);
        setUnreadCount(0);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleMenu}
        aria-label="Notifications"
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          open ? "bg-ink/10 text-ink" : "text-ink-soft hover:bg-paper hover:text-ink"
        }`}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-surface shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: EASE_PREMIUM }}
              className="fixed top-16 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:translate-x-0 sm:w-80 max-h-[75vh] overflow-y-auto bg-surface rounded-2xl border border-ink/5 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-3.5 border-b border-ink/5 flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
                  <FiBell className="text-teal-dark" size={15} /> Notifications
                </h3>
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-xs text-teal-dark font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y divide-ink/5 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-2">
                    <div className="h-10 bg-paper animate-pulse rounded-lg" />
                    <div className="h-10 bg-paper animate-pulse rounded-lg" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-6 text-center text-xs text-ink-soft">
                    No new notifications right now.
                  </div>
                ) : (
                  items.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 hover:bg-paper/50 transition-colors">
                      <p className="text-xs font-semibold text-ink">{n.title}</p>
                      <p className="text-xs text-ink-soft mt-0.5 line-clamp-2">{n.message}</p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setOpen(false)}
                          className="inline-block text-[11px] font-semibold text-teal-dark hover:underline mt-1"
                        >
                          Check it out →
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-1 pr-2 h-10 rounded-full hover:bg-paper transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
          {user?.username?.[0]?.toUpperCase()}
        </span>
        <FiChevronDown size={14} className="text-ink-soft hidden sm:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE_PREMIUM }}
            className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl border border-ink/5 shadow-xl p-1.5 z-50"
          >
            <div className="px-3 py-2.5 mb-1 border-b border-ink/5">
              <p className="text-sm font-semibold text-ink truncate">@{user?.username}</p>
              <p className="font-mono text-xs text-teal-dark mt-0.5">
                R{Number(user?.balance || 0).toFixed(2)}
              </p>
            </div>
            {accountNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-paper transition-colors"
                >
                  <Icon size={15} className="text-ink-soft" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-coral-dark hover:bg-coral/10 transition-colors"
            >
              <FiLogOut size={15} aria-hidden="true" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BottomNav({ pathname }) {
  const items = navGroups.flatMap((g) =>
    g.items.filter((i) => quickNavKeys.includes(i.to)).map((i) => ({ ...i, color: g.color }))
  );
  items.sort((a, b) => quickNavKeys.indexOf(a.to) - quickNavKeys.indexOf(b.to));

  return (
    <nav className="h-14 bg-surface border-t border-ink/5 flex items-center justify-around px-4 z-50 shadow-lg fixed bottom-0 left-0 right-0 sm:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${
              isActive
                ? "text-teal-dark bg-teal/15 font-semibold shadow-sm"
                : "text-ink-soft hover:text-ink hover:bg-paper"
            }`}
          >
            <Icon size={21} />
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-ink-soft hover:bg-ink/5 hover:text-ink"
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

export default function DashboardLayout({ title, children, noSidebar = false, noPadding = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-paper overflow-hidden">
      {/* Desktop sidebar */}
      {!noSidebar && (
        <div className="hidden lg:block">
          <Sidebar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {!noSidebar && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2, ease: EASE_PREMIUM }}
                className="absolute inset-y-0 left-0"
              >
                <Sidebar
                  isAdmin={isAdmin}
                  isSuperAdmin={isSuperAdmin}
                  onNavigate={() => setMobileOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative h-16 bg-surface border-b border-ink/5 flex items-center justify-between px-2 sm:px-5 shrink-0 z-20 gap-2">
          {/* Left: Menu button */}
          <div className="flex items-center gap-1">
            <button
              className="lg:hidden text-ink-soft p-1.5 rounded-lg hover:bg-paper shrink-0 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
            <div className="hidden sm:flex">
              <QuickNav pathname={location.pathname} />
            </div>
            {/* Logo on mobile only (left side) */}
            <Link to="/feed" className="flex items-center gap-1.5 lg:hidden">
              <Mark className="w-6 h-6 text-teal-dark shrink-0" />
              <span className="font-display font-semibold text-base text-ink tracking-tight truncate max-w-[100px]">
                ConnectAll
              </span>
            </Link>
          </div>

          {/* Center: ConnectAll logo (desktop only) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center">
            <Link to="/feed" className="flex items-center gap-2">
              <Mark className="w-7 h-7 text-teal-dark" />
              <span className="font-display font-semibold text-lg text-ink tracking-tight">
                ConnectAll
              </span>
            </Link>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            {user && !user.is_verified && (
              <Link
                to="/verify-email"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium bg-gold/15 text-gold-dark px-2.5 py-1 rounded-full"
              >
                Verify email
              </Link>
            )}
            <NotificationMenu />
            {user && <ProfileMenu user={user} onLogout={handleLogout} />}
          </div>
        </header>

        <main className={`flex-1 min-h-0 overflow-hidden ${noPadding ? "" : "p-4 sm:p-6 pb-16"}`}>{children}</main>

        {/* Bottom Navigation - fixed to viewport on mobile */}
        <BottomNav pathname={location.pathname} />
      </div>
    </div>
  );
}
