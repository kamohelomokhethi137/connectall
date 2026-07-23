import { apiFetch, API_BASE_URL } from "./api";

// --- Friends -----------------------------------------------------------

export const discoverUsers = (q) => apiFetch(`/api/chat/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const getUserProfile = (targetUuid) => apiFetch(`/api/chat/users/${targetUuid}/profile`);
export const listFriends = () => apiFetch("/api/chat/friends");
export const sendFriendRequest = (targetUuid) =>
  apiFetch("/api/chat/friends/request", { method: "POST", body: { target_uuid: targetUuid } });
export const respondFriendRequest = (requestId, action) =>
  apiFetch("/api/chat/friends/respond", { method: "POST", body: { request_id: requestId, action } });

// --- Rooms ---------------------------------------------------------------

export const listRooms = () => apiFetch("/api/chat/rooms");
export const openDmRoom = (targetUuid) =>
  apiFetch("/api/chat/rooms/dm", { method: "POST", body: { target_uuid: targetUuid } });
export const createGroupRoom = (name, memberUuids) =>
  apiFetch("/api/chat/rooms/group", { method: "POST", body: { name, member_uuids: memberUuids } });

// --- Messages --------------------------------------------------------------

export const fetchMessages = (roomUuid, beforeId) =>
  apiFetch(`/api/chat/rooms/${roomUuid}/messages${beforeId ? `?before_id=${beforeId}` : ""}`);
export const sendMessage = (roomUuid, body) =>
  apiFetch(`/api/chat/rooms/${roomUuid}/messages`, { method: "POST", body: { body } });

// --- Realtime --------------------------------------------------------------

// The Flask API and this WebSocket share the same host/port - just swap
// the http(s) scheme for ws(s). Browsers can't set custom headers on a
// WebSocket handshake, so the Bearer token rides along as a query param
// instead (see app/chat/ws.py for the server side of this).
function wsUrl(roomUuid) {
  const token = localStorage.getItem("connectall_token") || "";
  const base = API_BASE_URL.replace(/^http/, "ws");
  return `${base}/ws/chat/${roomUuid}?token=${encodeURIComponent(token)}`;
}

// Returns a small controller object rather than the raw WebSocket so
// callers don't need to know about reconnect/backoff logic.
export function connectRoomSocket(roomUuid, { onMessage, onTyping, onOpen, onClose }) {
  let socket = null;
  let closedByCaller = false;
  let retryDelay = 1000;

  function open() {
    socket = new WebSocket(wsUrl(roomUuid));

    socket.onopen = () => {
      retryDelay = 1000;
      onOpen?.();
    };

    socket.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload.type === "message") onMessage?.(payload.data);
      if (payload.type === "typing") onTyping?.(payload.data);
    };

    socket.onclose = () => {
      onClose?.();
      if (closedByCaller) return;
      // Simple capped exponential backoff - a dropped connection (sleep/
      // wifi hiccup) shouldn't need a manual page refresh to recover.
      setTimeout(open, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    };
  }

  open();

  return {
    sendTyping() {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "typing" }));
      }
    },
    close() {
      closedByCaller = true;
      socket?.close();
    },
  };
}
