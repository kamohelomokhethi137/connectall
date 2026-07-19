import { apiFetch } from "./api";

export const fetchPaymentMethods = () => apiFetch("/api/admin/payment-methods");
export const addPaymentMethod = (fields) =>
  apiFetch("/api/admin/payment-methods", { method: "POST", body: fields });
export const togglePaymentMethod = (id) =>
  apiFetch(`/api/admin/payment-methods/${id}/toggle`, { method: "POST" });
export const deletePaymentMethod = (id) =>
  apiFetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
