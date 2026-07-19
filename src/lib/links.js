import { apiFetch, API_BASE_URL } from "./api";

export const fetchLinks = () => apiFetch("/api/links");
export const createLink = (title, originalUrl) =>
  apiFetch("/api/links", { method: "POST", body: { title, original_url: originalUrl } });
export const deleteLink = (id) => apiFetch(`/api/links/${id}`, { method: "DELETE" });

// The QR code image itself is served by the existing Flask HTML route
// (returns a PNG, not JSON), so it's just an absolute URL for an <img src>,
// not a JSON fetch.
export const qrImageUrl = (id) => `${API_BASE_URL}/links/${id}/qr`;
