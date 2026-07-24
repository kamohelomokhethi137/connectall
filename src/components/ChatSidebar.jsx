import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useAuth } from "../lib/AuthContext";
import { listRooms, fetchMessages, sendMessage, connectRoomSocket } from "../lib/chat";
import toast from "react-hot-toast";

function initialOf(name) {
  return (name || "?")[0]?.toUpperCase();
}

function ChatSidebarItem({ room, active, onClick, unread }) {
  const title = room.type === "GROUP" ? room.name : room.other_member?.username || "Unknown";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-colors ${
        active ? "bg-teal/10" : "hover:bg-ink/5"
      }`}
    >
      {room.type === "GROUP" ? (
        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0">
          <FiMessageCircle size={13} />
        </div>
      ) : (
        <span className="w-8 h-8 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initialOf(title)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink truncate">{title}</p>
        <p className="text-[10px] text-ink-soft truncate">
          {room.last_message ? room.last_message.body : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

export default function ChatSidebar({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  const loadRooms = useCallback(async () => {
    try {
      const res = await listRooms();
      setRooms(res.rooms);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 10000);
    return () => {
      clearInterval(interval);
      socketRef.current?.close();
    };
  }, [loadRooms]);

  const openRoom = useCallback(async (room) => {
    setActiveRoom(room);
    setMessages([]);
    socketRef.current?.close();
    try {
      const res = await fetchMessages(room.uuid);
      setMessages(res.messages);
    } catch {
      // silent
    }
    socketRef.current = connectRoomSocket(room.uuid, {
      onMessage: (data) => {
        setMessages((prev) => [...prev, { ...data, is_mine: data.sender_uuid === user?.uuid }]);
      },
    });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeRoom) return;
    setSending(true);
    setDraft("");
    try {
      const res = await sendMessage(activeRoom.uuid, body);
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      toast.error(err.message || "Couldn't send.");
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  const roomTitle = activeRoom?.type === "GROUP" ? activeRoom.name : activeRoom?.other_member?.username;

  return (
    <div className="w-80 bg-surface border-l border-ink/5 flex flex-col h-full">
      {/* Header */}
      <div className="h-14 px-4 border-b border-ink/5 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-display font-semibold text-ink flex items-center gap-2">
          <FiMessageCircle className="text-teal-dark" size={15} />
          Chats
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/files")}
            className="text-[11px] font-semibold text-teal-dark hover:underline"
          >
            Open full chat
          </button>
          {onClose && (
            <button onClick={onClose} className="text-ink-soft hover:text-ink p-1">
              <FiX size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Room list */}
      {!activeRoom && (
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {rooms === null ? (
            <div className="h-20 rounded-xl bg-paper animate-pulse" />
          ) : rooms.length === 0 ? (
            <p className="text-xs text-ink-soft text-center py-6">
              No conversations yet.
            </p>
          ) : (
            rooms.slice(0, 8).map((room) => (
              <ChatSidebarItem
                key={room.uuid}
                room={room}
                onClick={() => openRoom(room)}
              />
            ))
          )}
        </div>
      )}

      {/* Active conversation */}
      {activeRoom && (
        <>
          <div className="h-11 px-4 border-b border-ink/5 flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setActiveRoom(null); socketRef.current?.close(); }}
              className="text-[11px] font-semibold text-teal-dark hover:underline"
            >
              &larr; All chats
            </button>
            <span className="text-xs font-semibold text-ink truncate">{roomTitle}</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs leading-relaxed ${
                    m.is_mine
                      ? "bg-teal text-navy rounded-br-sm"
                      : "bg-paper text-ink rounded-bl-sm"
                  }`}
                >
                  {!m.is_mine && (
                    <p className="text-[10px] font-semibold text-teal-dark">{m.sender_username}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.deleted ? "deleted" : m.body}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-2 border-t border-ink/5 flex items-center gap-1.5 shrink-0">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message..."
              className="flex-1 h-8 rounded-full border border-ink/10 bg-paper px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="h-8 w-8 rounded-full bg-teal hover:bg-teal-light disabled:opacity-40 text-navy flex items-center justify-center shrink-0"
            >
              <FiMessageCircle size={12} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
