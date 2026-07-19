import { apiFetch } from "./api";

export const fetchAdFeed = () => apiFetch("/api/ads");
export const recordAdInteraction = (adId, event) =>
  apiFetch(`/api/ads/${adId}/interact`, { method: "POST", body: { event } });
export const fetchAdEarnings = () => apiFetch("/api/ads/earnings");
