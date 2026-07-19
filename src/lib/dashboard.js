import { apiFetch } from "./api";

export const fetchUserDashboard = () => apiFetch("/api/main/dashboard");
export const fetchAdminDashboard = () => apiFetch("/api/admin/dashboard");
