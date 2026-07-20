import { apiFetch } from "./api";

// Users
export const fetchAdminUsers = (q) => apiFetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const fetchAdminUserDetail = (id) => apiFetch(`/api/admin/users/${id}`);
export const editAdminUser = (id, patch) => apiFetch(`/api/admin/users/${id}/edit`, { method: "POST", body: patch });
export const blockUser = (id, reason) => apiFetch(`/api/admin/users/${id}/block`, { method: "POST", body: { reason } });
export const activateUser = (id) => apiFetch(`/api/admin/users/${id}/activate`, { method: "POST" });
export const muteUser = (id, hours, reason) =>
  apiFetch(`/api/admin/users/${id}/mute`, { method: "POST", body: { hours, reason } });
export const unmuteUser = (id) => apiFetch(`/api/admin/users/${id}/unmute`, { method: "POST" });
export const deleteUser = (id) => apiFetch(`/api/admin/users/${id}/delete`, { method: "POST" });
export const setUserRole = (id, role) => apiFetch(`/api/admin/users/${id}/set-role`, { method: "POST", body: { role } });

// Payment methods & transactions
export const fetchPaymentMethods = () => apiFetch("/api/admin/payment-methods");
export const addPaymentMethod = (data) => apiFetch("/api/admin/payment-methods", { method: "POST", body: data });
export const togglePaymentMethod = (id) => apiFetch(`/api/admin/payment-methods/${id}/toggle`, { method: "POST" });
export const deletePaymentMethod = (id) => apiFetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
export const fetchAdminTransactions = () => apiFetch("/api/admin/transactions");
export const approveTransaction = (id) => apiFetch(`/api/admin/transactions/${id}/approve`, { method: "POST" });
export const rejectTransaction = (id) => apiFetch(`/api/admin/transactions/${id}/reject`, { method: "POST" });

// Marketplace products
export const fetchAdminProducts = () => apiFetch("/api/admin/products");
export const addProduct = (formData) => apiFetch("/api/admin/products", { method: "POST", body: formData });
export const toggleProduct = (id) => apiFetch(`/api/admin/products/${id}/toggle`, { method: "POST" });
export const deleteProduct = (id) => apiFetch(`/api/admin/products/${id}/delete`, { method: "POST" });

// Live streams
export const fetchAdminStreams = () => apiFetch("/api/admin/live");
export const startStream = (title, description) =>
  apiFetch("/api/admin/live/start", { method: "POST", body: { title, description } });
export const endStream = (id) => apiFetch(`/api/admin/live/${id}/end`, { method: "POST" });

// Tasks, token packages, subscription plans
export const fetchAdminTasks = () => apiFetch("/api/admin/tasks");
export const addAdminTask = (data) => apiFetch("/api/admin/tasks", { method: "POST", body: data });
export const toggleAdminTask = (id) => apiFetch(`/api/admin/tasks/${id}/toggle`, { method: "POST" });
export const deleteAdminTask = (id) => apiFetch(`/api/admin/tasks/${id}/delete`, { method: "POST" });

export const fetchAdminTokenPackages = () => apiFetch("/api/admin/token-packages");
export const addTokenPackage = (data) => apiFetch("/api/admin/token-packages", { method: "POST", body: data });
export const toggleTokenPackage = (id) => apiFetch(`/api/admin/token-packages/${id}/toggle`, { method: "POST" });
export const addSubscriptionPlan = (data) => apiFetch("/api/admin/subscription-plans", { method: "POST", body: data });
export const toggleSubscriptionPlan = (id) => apiFetch(`/api/admin/subscription-plans/${id}/toggle`, { method: "POST" });

// Ads, advertisers, deposits
export const fetchAdminAds = () => apiFetch("/api/admin/ads");
export const approveAd = (id) => apiFetch(`/api/admin/ads/${id}/approve`, { method: "POST" });
export const pauseAd = (id) => apiFetch(`/api/admin/ads/${id}/pause`, { method: "POST" });
export const rejectAd = (id) => apiFetch(`/api/admin/ads/${id}/reject`, { method: "POST" });
export const deleteAd = (id) => apiFetch(`/api/admin/ads/${id}/delete`, { method: "POST" });

export const fetchAdvertisers = () => apiFetch("/api/admin/advertisers");
export const toggleAdvertiser = (id) => apiFetch(`/api/admin/advertisers/${id}/toggle`, { method: "POST" });

export const fetchAdvertiserDeposits = () => apiFetch("/api/admin/advertiser-deposits");
export const confirmDeposit = (id) => apiFetch(`/api/admin/advertiser-deposits/${id}/confirm`, { method: "POST" });
export const rejectDeposit = (id) => apiFetch(`/api/admin/advertiser-deposits/${id}/reject`, { method: "POST" });

// Company wallet
export const fetchCompanyWallet = () => apiFetch("/api/admin/company-wallet");
export const companyWalletWithdraw = (amount, method, account) =>
  apiFetch("/api/admin/company-wallet/withdraw", { method: "POST", body: { amount, method, account } });
export const companyWalletTransfer = (amount, recipient) =>
  apiFetch("/api/admin/company-wallet/transfer", { method: "POST", body: { amount, recipient } });

// Contact messages & audit log
export const fetchContactMessages = () => apiFetch("/api/admin/contact-messages");
export const resolveMessage = (id) => apiFetch(`/api/admin/contact-messages/${id}/resolve`, { method: "POST" });
export const fetchAuditLog = () => apiFetch("/api/admin/audit-log");
