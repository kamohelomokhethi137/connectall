import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiSend } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";
import { fetchProduct, toggleLike, postComment } from "../lib/marketplace";
import { resolveMediaUrl } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProduct(id);
      setProduct(data.product);
    } catch (err) {
      setError(err.message || "Couldn't load this product.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLike = useCallback(async () => {
    setLiking(true);
    try {
      const data = await toggleLike(id);
      setProduct((p) => ({ ...p, already_liked: data.liked, like_count: data.like_count }));
    } catch (err) {
      toast.error(err.message || "Couldn't update your like.");
    } finally {
      setLiking(false);
    }
  }, [id]);

  const handleComment = useCallback(
    async (e) => {
      e.preventDefault();
      const text = commentText.trim();
      // Length guard mirrors what the backend must also enforce - never
      // rely on the client-side check alone, since a direct API call
      // skips this entirely.
      if (!text || text.length > 500) return;

      setPosting(true);
      try {
        const data = await postComment(id, text);
        setProduct((p) => ({ ...p, comments: [data.comment, ...p.comments] }));
        setCommentText("");
      } catch (err) {
        toast.error(err.message || "Couldn't post your comment.");
      } finally {
        setPosting(false);
      }
    },
    [id, commentText]
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <p className="text-ink-soft">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-32 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-10">
          <img
            src={resolveMediaUrl(product.image_url)}
            alt={product.name}
            className="w-full rounded-2xl border border-ink/5 object-cover"
          />
          <div>
            <h1 className="font-display font-semibold text-2xl text-ink">
              {product.name}
            </h1>
            <p className="font-mono text-xl font-semibold text-teal-dark mt-2">
              R{Number(product.price).toFixed(2)}
            </p>
            <p className="text-ink-soft mt-4 leading-relaxed">
              {product.description}
            </p>

            {isAuthenticated ? (
              <button
                onClick={handleLike}
                disabled={liking}
                className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  product.already_liked
                    ? "bg-teal text-navy"
                    : "border border-ink/15 text-ink hover:border-teal"
                }`}
              >
                <FiHeart size={16} aria-hidden="true" />
                {product.already_liked ? "Liked" : "Like"} ({product.like_count})
              </button>
            ) : (
              <p className="mt-6 text-sm text-ink-soft">
                <FiHeart className="inline mr-1.5" size={14} aria-hidden="true" />
                {product.like_count} likes ·{" "}
                <Link to="/login" className="text-teal-dark font-semibold hover:underline">
                  Log in
                </Link>{" "}
                to like
              </p>
            )}

            <hr className="border-ink/10 my-8" />

            <h2 className="font-display font-semibold text-ink mb-4">Comments</h2>

            {isAuthenticated ? (
              <form onSubmit={handleComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  placeholder="Write a comment..."
                  className="flex-1 h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
                <button
                  type="submit"
                  disabled={posting || !commentText.trim()}
                  className="w-11 h-11 rounded-lg bg-teal hover:bg-teal-light disabled:bg-teal/40 text-navy flex items-center justify-center shrink-0"
                  aria-label="Post comment"
                >
                  <FiSend size={16} />
                </button>
              </form>
            ) : (
              <p className="text-sm text-ink-soft mb-6">
                <Link to="/login" className="text-teal-dark font-semibold hover:underline">
                  Log in
                </Link>{" "}
                to comment.
              </p>
            )}

            <ul className="space-y-4">
              {product.comments.length === 0 && (
                <li className="text-sm text-ink-soft">No comments yet. Be the first.</li>
              )}
              {product.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-navy/5 text-navy text-xs font-semibold flex items-center justify-center shrink-0">
                    {c.username[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">@{c.username}</p>
                    <p className="text-sm text-ink-soft">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
