import { apiFetch } from "./api";

export const fetchAdminTransactions = () => apiFetch("/api/admin/transactions");
export const approveTransaction = (id) =>
  apiFetch(`/api/admin/transactions/${id}/approve`, { method: "POST" });
export const rejectTransaction = (id) =>
  apiFetch(`/api/admin/transactions/${id}/reject`, { method: "POST" });
