import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FiActivity, FiLink2, FiCreditCard, FiDollarSign, FiMessageCircle, FiShoppingBag,
  FiRadio, FiCheckSquare, FiAward, FiTag, FiTrendingUp, FiBell, FiUser,
  FiSettings, FiLock, FiExternalLink, FiShield, FiUsers, FiFileText,
  FiVideo, FiVolume2, FiBriefcase, FiMail, FiClipboard, FiLogOut, FiMenu, FiX,
} from "react-icons/fi";
import Mark from "./Mark";
import { useAuth } from "../lib/AuthContext";

const mainNav = [
  { label: "Dashboard", to: "/dashboard", icon: FiActivity },
  { label: "Smart Links", to: "/links", icon: FiLink2 },
  { label: "Bio Page", to: "/bio-editor", icon: FiUser },
  { label: "Earnings", to: "/earnings", icon: FiDollarSign },
  { label: "Wallet & Payments", to: "/wallet", icon: FiCreditCard },
  { label: "Chatrooms", to: "/files", icon: FiMessageCircle },
  { label: "Marketplace", to: "/marketplace", icon: FiShoppingBag },
  { label: "Live", to: "/live", icon: FiRadio },
  { label: "Daily Tasks", to: "/tasks", icon: FiCheckSquare },
  { label: "Play & Earn", to: "/play", icon: FiTarget },
  { label: "Upgrade", to: "/upgrade", icon: FiAward },
  { label: "Ads Earn Cash", to: "/ads", icon: FiTag },
  { label: "My Ad Earnings", to: "/ads/earnings", icon: FiTrendingUp },
  { label: "Notifications", to: "/notifications", icon: FiBell },
];

const accountNav = [
  { label: "Profile", to: "/profile", icon: FiUser },
  { label: "Settings", to: "/settings", icon: FiSettings },
  { label: "Change Password", to: "/change-password", icon: FiLock },
];

const adminNav = [
  { label: "Admin Panel", to: "/admin", icon: FiShield },
  { label: "Manage Users", to: "/admin/users", icon: FiUsers },
  { label: "Payment Methods", to: "/admin/payment-methods", icon: FiCreditCard },
  { label: "Transactions", to: "/admin/transactions", icon: FiFileText },
  { label: "Manage Marketplace", to: "/admin/marketplace", icon: FiShoppingBag },
  { label: "Manage Live", to: "/admin/live", icon: FiVideo },
  { label: "Manage Tasks", to: "/admin/tasks", icon: FiCheckSquare },
  { label: "Tokens & Plans", to: "/admin/tokens", icon: FiDollarSign },
  { label: "Manage Ads", to: "/admin/ads", icon: FiVolume2 },
  { label: "Advertisers", to: "/admin/advertisers", icon: FiBriefcase },
  { label: "Ad Budgets", to: "/admin/ad-budgets", icon: FiFileText },
  { label: "Company Wallet", to: "/admin/company-wallet", icon: FiBriefcase },
  { label: "Contact Messages", to: "/admin/messages", icon: FiMail },
];

function FiTarget(props) {
  // Feather doesn't ship a dice icon; a target reads well for "play & earn"
  return <FiCheckSquare {...props} />;
}

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-teal/10 text-teal-dark font-semibold"
            : "text-white/65 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={16} aria-hidden="true" />
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
    <aside className="w-64 bg-navy shrink-0 h-full overflow-y-auto flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2">
        <Mark className="w-6 h-6 text-teal-light" />
        <span className="font-display font-semibold text-white">ConnectAll</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 pb-6" onClick={onNavigate}>
        {mainNav.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}

        <hr className="border-white/10 my-3" />
        {accountNav.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
        <a
          href="/bio-preview"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors"
        >
          <FiExternalLink size={16} aria-hidden="true" />
          View Bio Page
        </a>

        {isAdmin && (
          <>
            <hr className="border-white/10 my-3" />
            <p className="px-3 pb-1 text-[11px] font-mono uppercase tracking-widest text-teal-light">
              Admin
            </p>
            {adminNav.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </>
        )}

        {isSuperAdmin && (
          <NavItem
            item={{ label: "Audit Log", to: "/admin/audit-log", icon: FiClipboard }}
          />
        )}

        <hr className="border-white/10 my-3" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors"
        >
          <FiLogOut size={16} aria-hidden="true" />
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default function DashboardLayout({ title, children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <div className="h-screen flex bg-paper overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
     <header className="h-16 bg-paper border-b border-ink/5 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-ink-soft p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="font-display font-semibold text-ink hidden sm:block">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && !user.is_verified && (
              <Link
                to="/verify-email"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-gold/15 text-gold-dark px-2.5 py-1 rounded-full"
              >
                Verify email
              </Link>
            )}
            <Link to="/notifications" className="relative text-ink-soft hover:text-ink">
              <FiBell size={19} />
            </Link>
            {user && (
              <>
                <span className="hidden md:inline font-mono text-sm font-semibold text-ink">
                  R{Number(user.balance || 0).toFixed(2)}
                </span>
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center"
                >
                  {user.username?.[0]?.toUpperCase()}
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
