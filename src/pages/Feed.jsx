import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFeed } from "../lib/posts";
import PostComposer from "../components/PostComposer";
import PostCard from "../components/PostCard";
import ChatSidebar from "../components/ChatSidebar";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../lib/AuthContext";

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchFeed(pageNum);
      if (pageNum === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...(prev || []), ...res.posts]);
      }
      setHasNext(res.has_next);
      setPage(pageNum);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const handlePosted = (newPost) => {
    setPosts((prev) => [newPost, ...(prev || [])]);
  };

  const handleDeleted = (postUuid) => {
    setPosts((prev) => prev.filter((p) => p.uuid !== postUuid));
  };

  return (
    <DashboardLayout noSidebar noPadding>
    <div className="flex h-full">
      {/* Main feed area */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-20">
        <div className="max-w-xl mx-auto space-y-4">
          <PostComposer onPosted={handlePosted} />

          {posts === null && loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface rounded-2xl border border-ink/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-paper animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-paper animate-pulse" />
                      <div className="h-2 w-16 rounded bg-paper animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-paper animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-paper animate-pulse" />
                </div>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-ink/5 p-8 text-center">
              <p className="text-sm text-ink-soft">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts?.map((post) => (
                <PostCard key={post.uuid} post={post} onDeleted={handleDeleted} />
              ))}
              {hasNext && (
                <button
                  onClick={() => loadFeed(page + 1)}
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-surface border border-ink/5 text-sm font-semibold text-teal-dark hover:bg-teal/5 disabled:opacity-40"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat sidebar - desktop only */}
      <div className="hidden lg:flex flex-col border-l border-ink/5 w-80">
        <ChatSidebar />
      </div>


    </div>
    </DashboardLayout>
  );
}
