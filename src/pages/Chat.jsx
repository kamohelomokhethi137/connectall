import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiSearch, FiUserPlus, FiUsers, FiSend, FiPaperclip, FiCheck, FiX,
  FiMessageCircle, FiPlus, FiChevronLeft, FiClock, FiLink,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../lib/AuthContext";
import {
  discoverUsers, getUserProfile, listFriends, sendFriendRequest, respondFriendRequest,
  listRooms, openDmRoom, createGroupRoom, fetchMessages, sendMessage,
  connectRoomSocket,
} from "../lib/chat";
import { fadeIn, EASE_PREMIUM } from "../lib/motionVariants";

function initialOf(name) {
  return (name || "?")[0]?.toUpperCase();
}

function Avatar({ username, size = 36 }) {
  return (
    <div
      className="rounded-full bg-navy text-white font-semibold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialOf(username)}
    </div>
  );
}

// Small pill button whose label/action depends on where the viewer stands
// with this person - keeps the "add / pending / message" logic in one
// place instead of duplicating it in the discover list, profile modal, etc.
function RelationAction({ relation, username, uuid, onAdd, onMessage, size = "sm" }) {
  const cls = size === "sm"
    ? "text-xs px-2.5 py-1.5"
    : "text-sm px-4 py-2";

  if (relation === "self") return null;
  if (relation === "friends") {
    return (
      <button
        onClick={() => onMessage(uuid)}
        className={`font-semibold bg-teal text-navy rounded-md hover:bg-teal-light flex items-center gap-1 ${cls}`}
      >
        <FiMessageCircle size={12} /> Message
      </button>
    );
  }
  if (relation === "pending_outgoing") {
    return (
      <span className={`font-semibold text-ink-soft bg-paper rounded-md flex items-center gap-1 ${cls}`}>
        <FiClock size={12} /> Pending
      </span>
    );
  }
  if (relation === "pending_incoming") {
    return (
      <span className={`font-semibold text-teal-dark bg-teal/10 rounded-md ${cls}`}>
        Check requests
      </span>
    );
  }
  return (
    <button
      onClick={() => onAdd(uuid, username)}
      className={`font-semibold bg-teal text-navy rounded-md hover:bg-teal-light flex items-center gap-1 ${cls}`}
    >
      <FiUserPlus size={12} /> Add
    </button>
  );
}

function ProfileModal({ uuid, onClose, onAdd, onMessage }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setError(null);
    getUserProfile(uuid)
      .then((res) => { if (!cancelled) setProfile(res.profile); })
      .catch((err) => { if (!cancelled) setError(err.message || "Couldn't load that profile."); });
    return () => { cancelled = true; };
  }, [uuid]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ ease: EASE_PREMIUM, duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[85vh] overflow-y-auto p-5"
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-ink-soft hover:text-ink" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        {error && <p className="text-sm text-ink-soft text-center py-6">{error}</p>}

        {!error && !profile && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 rounded-full bg-paper animate-pulse" />
            <div className="h-4 w-24 rounded bg-paper animate-pulse" />
          </div>
        )}

        {profile && (
          <div className="flex flex-col items-center text-center gap-2 -mt-2">
            <Avatar username={profile.username} size={64} />
            <p className="font-display font-semibold text-ink text-lg">@{profile.username}</p>
            {profile.member_since && (
              <p className="text-xs text-ink-soft">
                Member since {new Date(profile.member_since).toLocaleDateString([], { year: "numeric", month: "long" })}
              </p>
            )}

            <div className="pt-1">
              <RelationAction
                relation={profile.relation}
                username={profile.username}
                uuid={profile.uuid}
                onAdd={onAdd}
                onMessage={(u) => { onMessage(u); onClose(); }}
                size="md"
              />
            </div>

            {profile.bio?.headline && (
              <p className="text-sm font-medium text-ink pt-3">{profile.bio.headline}</p>
            )}
            {profile.bio?.bio_text && (
              <p className="text-sm text-ink-soft whitespace-pre-wrap">{profile.bio.bio_text}</p>
            )}
            {profile.bio?.links?.length > 0 && (
              <div className="w-full pt-2 space-y-1.5">
                {profile.bio.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-teal-dark bg-paper rounded-lg px-3 py-2 hover:bg-teal/10"
                  >
                    <FiLink size={13} /> <span className="truncate">{l.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function RoomListItem({ room, active, onClick, onAvatarClick }) {
  const title = room.type === "GROUP" ? room.name : room.other_member?.username || "Unknown";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        active ? "bg-teal/10" : "hover:bg-paper"
      }`}
    >
      {room.type === "GROUP" ? (
        <div className="w-9 h-9 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0">
          <FiUsers size={15} />
        </div>
      ) : (
        <span
          onClick={(e) => { e.stopPropagation(); onAvatarClick?.(room.other_member?.uuid); }}
          role="button"
        >
          <Avatar username={title} size={36} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">{title}</p>
        <p className="text-xs text-ink-soft truncate">
          {room.last_message ? room.last_message.body : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({ msg, mine, onSenderClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: EASE_PREMIUM }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          mine
            ? "bg-teal text-navy rounded-br-sm"
            : "bg-white border border-ink/5 text-ink rounded-bl-sm"
        }`}
      >
        {!mine && (
          <button
            onClick={() => onSenderClick?.(msg.sender_uuid)}
            className="text-[11px] font-semibold text-teal-dark mb-0.5 hover:underline"
          >
            {msg.sender_username}
          </button>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.deleted ? "Message deleted" : msg.body}</p>
        <p className={`text-[10px] mt-1 ${mine ? "text-navy/50" : "text-ink-soft"}`}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

function FindFriendsPanel({ onSent, onViewProfile, onMessage }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null); // null = loading, [] = no matches
  const [pendingUuid, setPendingUuid] = useState(null);
  const debounceRef = useRef(null);

  const runSearch = useCallback((query) => {
    discoverUsers(query.trim())
      .then((res) => setResults(res.users))
      .catch((err) => toast.error(err.message || "Couldn't search right now."));
  }, []);

  // Load the initial "people you may know" browse list once on mount,
  // then re-run (debounced) whenever the person types.
  useEffect(() => { runSearch(""); }, [runSearch]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 300);
    return () => clearTimeout(debounceRef.current);
  }, [q, runSearch]);

  const handleAdd = async (targetUuid, username) => {
    setPendingUuid(targetUuid);
    try {
      await sendFriendRequest(targetUuid);
      toast.success(`Friend request sent to @${username}.`);
      setResults((prev) => prev.map((u) => (u.uuid === targetUuid ? { ...u, relation: "pending_outgoing" } : u)));
      onSent?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPendingUuid(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={14} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find friends by username or ID"
          className="w-full h-10 rounded-lg border border-ink/10 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1.5">
        {results === null ? (
          <div className="h-10 rounded-lg bg-paper animate-pulse" />
        ) : results.length === 0 ? (
          <p className="text-xs text-ink-soft text-center py-4">No one matched that search.</p>
        ) : (
          results.map((u) => (
            <div key={u.uuid} className="flex items-center gap-2 bg-paper rounded-lg p-2">
              <button onClick={() => onViewProfile(u.uuid)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <Avatar username={u.username} size={28} />
                <span className="text-sm font-medium text-ink truncate">@{u.username}</span>
              </button>
              <RelationAction
                relation={u.relation}
                username={u.username}
                uuid={u.uuid}
                onAdd={pendingUuid ? () => {} : handleAdd}
                onMessage={onMessage}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [rooms, setRooms] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [mobileShowRoom, setMobileShowRoom] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [profileUuid, setProfileUuid] = useState(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);

  const loadSidebar = useCallback(async () => {
    try {
      const [roomsRes, friendsRes] = await Promise.all([listRooms(), listFriends()]);
      setRooms(roomsRes.rooms);
      setFriends(friendsRes.friends);
      setIncoming(friendsRes.incoming_requests);
    } catch (err) {
      toast.error(err.message || "Couldn't load your chats.");
    }
  }, []);

  useEffect(() => {
    loadSidebar();
  }, [loadSidebar]);

  const openRoom = useCallback(async (room) => {
    setActiveRoom(room);
    setMobileShowRoom(true);
    setMessages([]);
    setTypingUser(null);
    setShowGroupMembers(false);
    socketRef.current?.close();

    try {
      const res = await fetchMessages(room.uuid);
      setMessages(res.messages);
    } catch (err) {
      toast.error(err.message || "Couldn't load messages.");
    }

    socketRef.current = connectRoomSocket(room.uuid, {
      onMessage: (data) => {
        setMessages((prev) => [...prev, { ...data, is_mine: data.sender_uuid === user?.uuid }]);
      },
      onTyping: (data) => {
        setTypingUser(data.user_uuid);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      },
    });
  }, [user]);

  useEffect(() => {
    const roomUuid = searchParams.get("room");
    if (rooms && roomUuid && (!activeRoom || activeRoom.uuid !== roomUuid)) {
      const found = rooms.find((r) => r.uuid === roomUuid);
      if (found) openRoom(found);
    }
  }, [rooms, searchParams, activeRoom, openRoom]);

  useEffect(() => () => socketRef.current?.close(), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeRoom) return;
    setSending(true);
    setDraft("");
    try {
      const res = await sendMessage(activeRoom.uuid, body);
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      toast.error(err.message || "Couldn't send that message.");
      setDraft(body);
    } finally {
      setSending(false);
    }
  }, [draft, activeRoom]);

  const handleRespond = async (id, action) => {
    try {
      const res = await respondFriendRequest(id, action);
      setIncoming((prev) => prev.filter((r) => r.id !== id));
      if (action === "accept") {
        toast.success("You're connected!");
        loadSidebar();
      }
      void res;
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenDm = useCallback(async (targetUuid) => {
    try {
      const res = await openDmRoom(targetUuid);
      await loadSidebar();
      openRoom(res.room);
    } catch (err) {
      toast.error(err.message);
    }
  }, [loadSidebar, openRoom]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || groupMembers.length === 0) {
      toast.error("Give your group a name and pick at least one friend.");
      return;
    }
    try {
      const res = await createGroupRoom(groupName.trim(), groupMembers);
      toast.success("Group created!");
      setShowNewGroup(false);
      setGroupName("");
      setGroupMembers([]);
      await loadSidebar();
      openRoom(res.room);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const roomTitle = useMemo(() => {
    if (!activeRoom) return "";
    return activeRoom.type === "GROUP" ? activeRoom.name : activeRoom.other_member?.username;
  }, [activeRoom]);

  return (
    <DashboardLayout title="Chatrooms">
      <div className="flex flex-col md:flex-row gap-4 md:h-[calc(100vh-8rem)]">
        {/* Sidebar: find friends, requests, rooms */}
        <div className={`w-full md:w-80 md:shrink-0 flex-col gap-4 md:h-full md:overflow-y-auto md:pr-1 ${mobileShowRoom ? "hidden md:flex" : "flex"}`}>
          <div className="bg-white rounded-2xl border border-ink/5 p-4">
            <h2 className="text-sm font-display font-semibold text-ink mb-3 flex items-center gap-2">
              <FiUserPlus className="text-teal-dark" /> Find friends
            </h2>
            <FindFriendsPanel
              onSent={loadSidebar}
              onViewProfile={setProfileUuid}
              onMessage={handleOpenDm}
            />
          </div>

          {incoming.length > 0 && (
            <div className="bg-white rounded-2xl border border-ink/5 p-4">
              <h2 className="text-sm font-display font-semibold text-ink mb-2">Friend requests</h2>
              <ul className="space-y-2">
                {incoming.map((r) => (
                  <li key={r.id} className="flex items-center gap-2">
                    <button onClick={() => setProfileUuid(r.from.uuid)}>
                      <Avatar username={r.from.username} size={28} />
                    </button>
                    <button onClick={() => setProfileUuid(r.from.uuid)} className="text-sm text-ink flex-1 truncate text-left hover:underline">
                      @{r.from.username}
                    </button>
                    <button
                      onClick={() => handleRespond(r.id, "accept")}
                      className="w-7 h-7 rounded-full bg-teal/15 text-teal-dark flex items-center justify-center hover:bg-teal/25"
                      aria-label="Accept"
                    >
                      <FiCheck size={13} />
                    </button>
                    <button
                      onClick={() => handleRespond(r.id, "decline")}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                      aria-label="Decline"
                    >
                      <FiX size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-ink/5 p-4 md:flex-1 md:min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-semibold text-ink">Your chats</h2>
              <button
                onClick={() => setShowNewGroup((v) => !v)}
                className="text-xs font-semibold text-teal-dark hover:underline flex items-center gap-1"
              >
                <FiPlus size={13} /> Group
              </button>
            </div>

            <AnimatePresence>
              {showNewGroup && (
                <motion.form
                  variants={fadeIn}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  onSubmit={handleCreateGroup}
                  className="mb-3 p-3 bg-paper rounded-xl space-y-2"
                >
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name"
                    className="w-full h-9 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                  {friends.length === 0 ? (
                    <p className="text-xs text-ink-soft">Add some friends first to start a group.</p>
                  ) : (
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {friends.map((f) => (
                        <label key={f.uuid} className="flex items-center gap-2 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={groupMembers.includes(f.uuid)}
                            onChange={(e) =>
                              setGroupMembers((prev) =>
                                e.target.checked ? [...prev, f.uuid] : prev.filter((u) => u !== f.uuid)
                              )
                            }
                          />
                          @{f.username}
                        </label>
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full h-9 rounded-lg bg-teal hover:bg-teal-light text-navy text-xs font-semibold"
                  >
                    Create group
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="max-h-72 md:max-h-none md:flex-1 overflow-y-auto space-y-1">
              {rooms === null ? (
                <div className="h-32 rounded-xl bg-paper animate-pulse" />
              ) : rooms.length === 0 ? (
                <p className="text-sm text-ink-soft text-center py-8">
                  Find a friend above to start chatting.
                </p>
              ) : (
                rooms.map((room) => (
                  <RoomListItem
                    key={room.uuid}
                    room={room}
                    active={activeRoom?.uuid === room.uuid}
                    onClick={() => openRoom(room)}
                    onAvatarClick={setProfileUuid}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active conversation */}
        <div className={`flex-1 bg-white rounded-2xl border border-ink/5 flex-col min-h-0 h-[calc(100vh-8rem)] md:h-auto ${mobileShowRoom ? "flex" : "hidden md:flex"}`}>
          {!activeRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-ink-soft gap-2">
              <FiMessageCircle size={32} />
              <p className="text-sm">Pick a chat on the left to get started.</p>
            </div>
          ) : (
            <>
              <div className="h-14 px-4 border-b border-ink/5 flex items-center gap-3 shrink-0 relative">
                <button
                  onClick={() => setMobileShowRoom(false)}
                  className="md:hidden text-ink-soft"
                  aria-label="Back"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    activeRoom.type === "GROUP"
                      ? setShowGroupMembers((v) => !v)
                      : setProfileUuid(activeRoom.other_member?.uuid)
                  }
                  className="flex items-center gap-3 min-w-0"
                >
                  {activeRoom.type === "GROUP" ? (
                    <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center shrink-0">
                      <FiUsers size={14} />
                    </div>
                  ) : (
                    <Avatar username={roomTitle} size={32} />
                  )}
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-ink truncate">{roomTitle}</p>
                    {activeRoom.type === "GROUP" && (
                      <p className="text-xs text-ink-soft">{activeRoom.member_count} members</p>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {showGroupMembers && activeRoom.type === "GROUP" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-14 left-4 right-4 sm:right-auto sm:w-64 bg-white border border-ink/10 rounded-xl shadow-lg p-2 z-10 max-h-64 overflow-y-auto"
                    >
                      {activeRoom.members?.map((m) => (
                        <button
                          key={m.uuid}
                          onClick={() => { setProfileUuid(m.uuid); setShowGroupMembers(false); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-paper text-left"
                        >
                          <Avatar username={m.username} size={26} />
                          <span className="text-sm text-ink truncate">@{m.username}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <MessageBubble key={m.id} msg={m} mine={m.is_mine} onSenderClick={setProfileUuid} />
                  ))}
                </AnimatePresence>
                {typingUser && (
                  <p className="text-xs text-ink-soft italic">typing…</p>
                )}
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-ink/5 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled
                  title="File sharing is coming soon, right here in the chat"
                  className="w-10 h-10 rounded-full text-ink-soft/40 flex items-center justify-center cursor-not-allowed shrink-0"
                >
                  <FiPaperclip size={17} />
                </button>
                <input
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    socketRef.current?.sendTyping();
                  }}
                  placeholder="Type a message…"
                  className="flex-1 h-10 rounded-full border border-ink/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="w-10 h-10 rounded-full bg-teal hover:bg-teal-light disabled:opacity-40 text-navy flex items-center justify-center shrink-0"
                  aria-label="Send message"
                >
                  <FiSend size={15} />
                </motion.button>
              </form>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {profileUuid && (
          <ProfileModal
            uuid={profileUuid}
            onClose={() => setProfileUuid(null)}
            onAdd={async (targetUuid, username) => {
              try {
                await sendFriendRequest(targetUuid);
                toast.success(`Friend request sent to @${username}.`);
              } catch (err) {
                toast.error(err.message);
              }
            }}
            onMessage={handleOpenDm}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
