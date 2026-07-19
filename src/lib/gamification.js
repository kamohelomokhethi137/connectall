import { apiFetch } from "./api";

export const fetchTasks = () => apiFetch("/api/tasks");
export const claimTask = (id) => apiFetch(`/api/tasks/${id}/claim`, { method: "POST" });

export const fetchPlayStatus = () => apiFetch("/api/play");
export const spinGame = () => apiFetch("/api/play/spin", { method: "POST" });

export const fetchUpgrade = () => apiFetch("/api/upgrade");
export const buyTokens = (packageId) =>
  apiFetch("/api/upgrade/buy-tokens", { method: "POST", body: { package_id: packageId } });
export const subscribePlan = (planId) =>
  apiFetch("/api/upgrade/subscribe", { method: "POST", body: { plan_id: planId } });
