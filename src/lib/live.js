import { apiFetch } from "./api";

// Public - matches Flask's live_list (browsing is open to everyone)
export const fetchLiveStreams = () => apiFetch("/api/live/streams");

// Everything below requires an authenticated session server-side,
// matching Flask's @login_required on watch_live / heartbeat / leave.
// The frontend's RequireAuth guard stops a logged-out visitor from
// reaching this UI at all, but the backend must enforce it again
// independently - a direct API call has to be rejected the same way.
export const fetchStream = (id) => apiFetch(`/api/live/streams/${id}`);
export const sendHeartbeat = (id) =>
  apiFetch(`/api/live/streams/${id}/heartbeat`, { method: "POST" });
export const leaveStream = (id) =>
  apiFetch(`/api/live/streams/${id}/leave`, { method: "POST" });
