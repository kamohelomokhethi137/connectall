import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiCopy, FiTrash2, FiExternalLink } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchLinks, createLink, deleteLink, qrImageUrl } from "../lib/links";
import { API_BASE_URL } from "../lib/api";
import AdBanner from "../components/AdBanner";
import NativeAd from "../components/NativeAd";

export default function Links() {
  const [links, setLinks] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchLinks();
      setLinks(data.links);
    } catch (err) {
      setError(err.message || "Couldn't load your links.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!url.trim()) {
        toast.error("Destination URL is required.");
        return;
      }
      setCreating(true);
      try {
        const data = await createLink(title.trim(), url.trim());
        setLinks((prev) => [data.link, ...(prev || [])]);
        setTitle("");
        setUrl("");
        toast.success("Smart link created!");
      } catch (err) {
        toast.error(err.message || "Couldn't create that link.");
      } finally {
        setCreating(false);
      }
    },
    [title, url]
  );

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this link?")) return;
    setDeletingId(id);
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success("Link deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that link.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const handleCopy = useCallback((shortCode) => {
    const fullUrl = `${API_BASE_URL}/l/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Copied to clipboard.");
  }, []);

  return (
    <DashboardLayout title="Smart Links">
      {/* Banner Ad */}
      <div className="mb-4 bg-surface rounded-2xl border border-ink/5 p-4">
        <div className="flex justify-center">
          <AdBanner />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiPlus className="text-teal-dark" aria-hidden="true" /> Create a new smart link
        </h2>
        <form onSubmit={handleCreate} className="grid md:grid-cols-[1fr_1.5fr_auto] gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title (optional)"
            className="h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://destination-website.com"
            required
            className="h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <SubmitButton loading={creating}>Create</SubmitButton>
        </form>
      </div>

      <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden">
        {error && <p className="p-5 text-ink-soft">{error}</p>}
        {!error && links === null && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-ink/5 rounded animate-pulse" />
            ))}
          </div>
        )}
        {links && links.length === 0 && (
          <p className="text-center text-ink-soft py-10">
            No smart links yet. Create one above!
          </p>
        )}
        {links && links.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Short Link</th>
                  <th className="p-4 font-medium">Clicks</th>
                  <th className="p-4 font-medium">QR</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-ink/5 last:border-0">
                    <td className="p-4">
                      <p className="font-medium text-ink">{link.title}</p>
                      <p className="text-xs text-ink-soft truncate max-w-[220px]">
                        {link.original_url}
                      </p>
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-paper px-1.5 py-0.5 rounded">
                        /l/{link.short_code}
                      </code>
                      <button
                        onClick={() => handleCopy(link.short_code)}
                        className="ml-1.5 text-ink-soft hover:text-teal-dark"
                        aria-label="Copy link"
                      >
                        <FiCopy size={13} />
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="bg-paper text-ink px-2 py-1 rounded text-xs">
                        {link.clicks}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={qrImageUrl(link.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-dark border border-teal-dark/30 rounded px-2 py-1 hover:bg-teal/5"
                      >
                        <FiExternalLink size={12} /> View
                      </a>
                    </td>
                    <td className="p-4 text-ink-soft text-xs">
                      {new Date(link.created_at).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="text-red-500 hover:text-red-600 disabled:opacity-40"
                        aria-label="Delete link"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Native Ad */}
      <div className="mt-4">
        <NativeAd />
      </div>
    </DashboardLayout>
  );
}