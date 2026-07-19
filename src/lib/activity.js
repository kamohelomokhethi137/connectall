import { apiFetch } from "./api";

export const fetchEarnings = () => apiFetch("/api/earnings");
export const fetchNotifications = () => apiFetch("/api/notifications");
export const fetchUnreadCount = () => apiFetch("/api/notifications/unread-count");
