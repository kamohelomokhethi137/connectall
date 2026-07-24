import { useState, useRef } from "react";
import { FiImage, FiVideo, FiX } from "react-icons/fi";
import { useAuth } from "../lib/AuthContext";
import { createPost } from "../lib/posts";
import toast from "react-hot-toast";

export default function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [media, setMedia] = useState([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  const previewUrls = media.map((f) => URL.createObjectURL(f));

  const handleAttach = (e) => {
    const files = Array.from(e.target.files || []);
    setMedia((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = "";
  };

  const removeMedia = (idx) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text && media.length === 0) return;
    setSending(true);
    try {
      const res = await createPost(text, media);
      toast.success("Posted!");
      setBody("");
      setMedia([]);
      onPosted?.(res.post);
    } catch (err) {
      toast.error(err.message || "Couldn't post.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-ink/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="flex-1 resize-none bg-transparent text-sm text-ink placeholder-ink-soft/60 focus:outline-none leading-relaxed"
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative shrink-0">
              {media[i]?.type?.startsWith("video/") ? (
                <video src={url} className="w-24 h-24 rounded-lg object-cover" />
              ) : (
                <img src={url} className="w-24 h-24 rounded-lg object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeMedia(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink/70 text-white flex items-center justify-center"
              >
                <FiX size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-ink/5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink px-2 py-1.5 rounded-lg hover:bg-paper transition-colors"
          >
            <FiImage size={14} /> Photo
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink px-2 py-1.5 rounded-lg hover:bg-paper transition-colors"
          >
            <FiVideo size={14} /> Video
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleAttach}
          />
        </div>
        <button
          type="submit"
          disabled={sending || (!body.trim() && media.length === 0)}
          className="px-5 h-9 rounded-lg bg-teal hover:bg-teal-light disabled:opacity-40 text-navy text-xs font-semibold"
        >
          {sending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
