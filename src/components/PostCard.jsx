import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiMessageCircle, FiTrash2, FiX } from "react-icons/fi";
import { useAuth } from "../lib/AuthContext";
import { toggleLike, fetchComments, addComment, deleteComment, deletePost } from "../lib/posts";
import { resolveMediaUrl } from "../lib/api";
import toast from "react-hot-toast";
import { EASE_PREMIUM } from "../lib/motionVariants";

function CommentItem({ comment, postUuid, onDeleted }) {
  const { user } = useAuth();
  const handleDelete = async () => {
    try {
      await deleteComment(postUuid, comment.id);
      onDeleted?.(comment.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex gap-2 py-2">
      <span className="w-7 h-7 rounded-full bg-navy text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
        {comment.author.username?.[0]?.toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink">@{comment.author.username}</p>
        <p className="text-sm text-ink-soft">{comment.body}</p>
      </div>
      {comment.is_mine && (
        <button onClick={handleDelete} className="text-ink-soft/40 hover:text-coral-dark shrink-0">
          <FiX size={12} />
        </button>
      )}
    </div>
  );
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const isAuthor = user?.uuid === post.author.uuid;

  const handleLike = useCallback(async () => {
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      const res = await toggleLike(post.uuid);
      setLiked(res.liked);
      setLikeCount(res.like_count);
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  }, [post.uuid, liked]);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(post.uuid);
      onDeleted?.(post.uuid);
      toast.success("Post deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openComments = useCallback(async () => {
    if (showComments && comments) {
      setShowComments(false);
      return;
    }
    if (!comments) {
      try {
        const res = await fetchComments(post.uuid);
        setComments(res.comments);
      } catch (err) {
        toast.error(err.message);
        return;
      }
    }
    setShowComments(true);
  }, [post.uuid, showComments, comments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const body = commentDraft.trim();
    if (!body) return;
    setSendingComment(true);
    try {
      const res = await addComment(post.uuid, body);
      setComments((prev) => [...(prev || []), res.comment]);
      setCommentDraft("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingComment(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-ink/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center shrink-0">
            {post.author.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">@{post.author.username}</p>
            <p className="text-[11px] text-ink-soft">{relativeTime(post.created_at)}</p>
          </div>
        </div>
        {isAuthor && (
          <button onClick={handleDelete} className="text-ink-soft/30 hover:text-coral-dark p-1">
            <FiTrash2 size={13} />
          </button>
        )}
      </div>

      {/* Body */}
      {post.body && (
        <div className="px-4 pb-2">
          <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{post.body}</p>
        </div>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`grid gap-0.5 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.media.map((m, i) =>
            m.media_type === "video" ? (
              <video
                key={i}
                src={resolveMediaUrl(m.url)}
                controls
                className="w-full max-h-96 object-cover bg-ink/5"
              />
            ) : (
              <img
                key={i}
                src={resolveMediaUrl(m.url)}
                className="w-full max-h-96 object-cover bg-ink/5"
              />
            )
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-ink/5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            liked ? "text-coral" : "text-ink-soft hover:text-coral"
          }`}
        >
          <FiHeart size={14} fill={liked ? "currentColor" : "none"} />
          {likeCount > 0 && likeCount}
        </button>
        <button
          onClick={openComments}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-teal-dark transition-colors"
        >
          <FiMessageCircle size={14} />
          {post.comment_count > 0 && post.comment_count}
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ease: EASE_PREMIUM, duration: 0.2 }}
            className="border-t border-ink/5 overflow-hidden"
          >
            <div className="px-4 py-2 max-h-64 overflow-y-auto divide-y divide-ink/5">
              {comments === null ? (
                <div className="h-10 bg-paper animate-pulse rounded-lg" />
              ) : comments.length === 0 ? (
                <p className="text-xs text-ink-soft text-center py-3">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <CommentItem key={c.id} comment={c} postUuid={post.uuid} onDeleted={handleCommentDeleted} />
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex items-center gap-2 px-4 pb-3 pt-1">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-8 rounded-lg bg-paper border border-ink/5 px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal/30"
              />
              <button
                type="submit"
                disabled={sendingComment || !commentDraft.trim()}
                className="h-8 px-3 rounded-lg bg-teal hover:bg-teal-light disabled:opacity-40 text-navy text-xs font-semibold"
              >
                Post
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
