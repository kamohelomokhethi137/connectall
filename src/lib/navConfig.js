import {
  FiActivity, FiLink2, FiCreditCard, FiDollarSign, FiMessageCircle, FiShoppingBag,
  FiRadio, FiCheckSquare, FiAward, FiTag, FiTrendingUp, FiBell, FiUser,
  FiSettings, FiLock, FiExternalLink, FiShield, FiUsers, FiFileText,
  FiVideo, FiVolume2, FiBriefcase, FiMail, FiClipboard, FiCrosshair,
} from "react-icons/fi";

// Each group carries a `color` token (navy / teal / gold / coral) used to
// tint its icon chips consistently wherever it renders — sidebar section,
// "more" grid menu, anywhere else. One semantic color per group, not per
// item, keeps the palette disciplined instead of a rainbow of icons.
export const navGroups = [
  {
    key: "overview",
    label: "Overview",
    color: "neutral",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: FiActivity },
      { label: "Notifications", to: "/notifications", icon: FiBell },
    ],
  },
  {
    key: "money",
    label: "Money",
    color: "teal",
    items: [
      { label: "Wallet & Payments", to: "/wallet", icon: FiCreditCard },
      { label: "Earnings", to: "/earnings", icon: FiDollarSign },
      { label: "Smart Links", to: "/links", icon: FiLink2 },
    ],
  },
  {
    key: "grow",
    label: "Grow",
    color: "gold",
    items: [
      { label: "Daily Tasks", to: "/tasks", icon: FiCheckSquare },
      { label: "Play & Earn", to: "/play", icon: FiCrosshair },
      { label: "Ads Earn Cash", to: "/ads", icon: FiTag },
      { label: "My Ad Earnings", to: "/ads/earnings", icon: FiTrendingUp },
      { label: "Upgrade", to: "/upgrade", icon: FiAward },
    ],
  },
  {
    key: "connect",
    label: "Connect",
    color: "coral",
    items: [
      { label: "Chatrooms", to: "/files", icon: FiMessageCircle },
      { label: "Marketplace", to: "/marketplace", icon: FiShoppingBag },
      { label: "Live", to: "/live", icon: FiRadio },
      { label: "Bio Page", to: "/bio-editor", icon: FiUser },
    ],
  },
];

// The handful of destinations that get a persistent icon button in the
// top bar (Facebook-style quick nav) - deliberately short, everything
// else lives one tap away in the "more" grid menu.
export const quickNavKeys = ["/dashboard", "/files", "/marketplace", "/live", "/wallet"];

export const accountNav = [
  { label: "Profile", to: "/profile", icon: FiUser },
  { label: "Settings", to: "/settings", icon: FiSettings },
  { label: "Change Password", to: "/change-password", icon: FiLock },
];

export const adminNav = [
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

export const auditNavItem = { label: "Audit Log", to: "/admin/audit-log", icon: FiClipboard };
export const bioPageExternalLink = { label: "View Bio Page", href: "/bio-preview", icon: FiExternalLink };

// Tailwind can't see dynamically-built class strings, so every group
// color's classes are spelled out in full here rather than templated
// (e.g. `bg-${color}/10`), or the purge step would drop them.
export const groupColorClasses = {
  navy: { chipBg: "bg-navy/10", chipText: "text-navy", activeBg: "bg-navy/10", activeText: "text-navy" },
  teal: { chipBg: "bg-teal/10", chipText: "text-teal-dark", activeBg: "bg-teal/10", activeText: "text-teal-dark" },
  gold: { chipBg: "bg-gold/15", chipText: "text-gold-dark", activeBg: "bg-gold/15", activeText: "text-gold-dark" },
  coral: { chipBg: "bg-coral/15", chipText: "text-coral-dark", activeBg: "bg-coral/15", activeText: "text-coral-dark" },
};

export function findNavItemByPath(pathname) {
  for (const group of navGroups) {
    const item = group.items.find((i) => i.to === pathname);
    if (item) return { ...item, color: group.color };
  }
  return null;
}
