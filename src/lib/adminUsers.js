import { apiFetch } from "./api";

export const fetchAdminUsers = (q = "") =>
  apiFetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const fetchAdminUserDetail = (id) => apiFetch(`/api/admin/users/${id}`);
export const editAdminUser = (id, fields) =>
  apiFetch(`/api/admin/users/${id}/edit`, { method: "POST", body: fields });
export const blockUser = (id, reason) =>
  apiFetch(`/api/admin/users/${id}/block`, { method: "POST", body: { reason } });
export const activateUser = (id) =>
  apiFetch(`/api/admin/users/${id}/activate`, { method: "POST" });
export const muteUser = (id, hours, reason) =>
  apiFetch(`/api/admin/users/${id}/mute`, { method: "POST", body: { hours, reason } });
export const unmuteUser = (id) =>
  apiFetch(`/api/admin/users/${id}/unmute`, { method: "POST" });
export const deleteUser = (id) =>
  apiFetch(`/api/admin/users/${id}/delete`, { method: "POST" });
export const setUserRole = (id, role) =>
  apiFetch(`/api/admin/users/${id}/set-role`, { method: "POST", body: { role } });
