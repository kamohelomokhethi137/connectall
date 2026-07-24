import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiUser, FiTrash2, FiPlus, FiExternalLink, FiEye } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../lib/AuthContext";
import { fetchBio, updateBio, addBioLink, deleteBioLink } from "../lib/bio";

const THEMES = [
  { value: "midnight", label: "Midnight (Navy)" },
  { value: "sunset", label: "Sunset (Gold)" },
  { value: "mint", label: "Mint" },
];

export default function BioEditor() {
  const { user } = useAuth();
  const [bio, setBio] = useState(null);
  const [headline, setHeadline] = useState("");
  const [bioText, setBioText] = useState("");
  const [theme, setTheme] = useState("midnight");
  const [saving, setSaving] = useState(false);

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchBio();
      setBio(data.bio);
      setHeadline(data.bio.headline);
      setBioText(data.bio.bio_text);
      setTheme(data.bio.theme);
    } catch (err) {
      toast.error(err.message || "Couldn't load your bio page.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const data = await updateBio({ headline, bio_text: bioText, theme });
        setBio(data.bio);
        toast.success("Bio page updated.");
      } catch (err) {
        toast.error(err.message || "Couldn't save your bio page.");
      } finally {
        setSaving(false);
      }
    },
    [headline, bioText, theme]
  );

  const handleAddLink = useCallback(
    async (e) => {
      e.preventDefault();
      if (!linkTitle.trim() || !linkUrl.trim()) {
        toast.error("Title and URL are required.");
        return;
      }
      setAddingLink(true);
      try {
        const data = await addBioLink(linkTitle.trim(), linkUrl.trim());
        setBio((prev) => ({ ...prev, links: [...prev.links, data.link] }));
        setLinkTitle("");
        setLinkUrl("");
        toast.success("Link added to your bio page.");
      } catch (err) {
        toast.error(err.message || "Couldn't add that link.");
      } finally {
        setAddingLink(false);
      }
    },
    [linkTitle, linkUrl]
  );

  const handleDeleteLink = useCallback(async (id) => {
    if (!window.confirm("Remove this link?")) return;
    setDeletingId(id);
    try {
      await deleteBioLink(id);
      setBio((prev) => ({ ...prev, links: prev.links.filter((l) => l.id !== id) }));
      toast.success("Link removed.");
    } catch (err) {
      toast.error(err.message || "Couldn't remove that link.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  if (!bio) {
    return (
      <DashboardLayout title="Bio Page">
        <div className="h-64 rounded-2xl bg-surface border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bio Page">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-surface rounded-2xl border border-ink/5 p-5">
            <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
              <FiUser className="text-teal-dark" aria-hidden="true" />
              Page details
            </h2>

            <label className="text-sm font-medium text-ink block mb-1.5">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={150}
              className="w-full h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm text-ink mb-4 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />

            <label className="text-sm font-medium text-ink block mb-1.5">Bio text</label>
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-ink/10 bg-surface px-3.5 py-2.5 text-sm text-ink mb-4 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
            />

            <label className="text-sm font-medium text-ink block mb-1.5">Theme</label>
            <div className="flex gap-3 mb-5">
              {THEMES.map((t) => (
                <label
                  key={t.value}
                  className={`flex-1 text-center text-sm py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    theme === t.value
                      ? "border-teal bg-teal/10 text-teal-dark font-semibold"
                      : "border-ink/10 text-ink-soft"
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.value}
                    checked={theme === t.value}
                    onChange={() => setTheme(t.value)}
                    className="hidden"
                  />
                  {t.label}
                </label>
              ))}
            </div>

            <SubmitButton loading={saving}>Save changes</SubmitButton>
          </form>

          <div className="bg-surface rounded-2xl border border-ink/5 p-5">
            <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
              <FiPlus className="text-teal-dark" aria-hidden="true" />
              Add a link
            </h2>
            <form onSubmit={handleAddLink} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-3">
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Link title"
                className="h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="h-11 rounded-lg border border-ink/10 bg-surface px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
              <SubmitButton loading={addingLink}>Add</SubmitButton>
            </form>

            {bio.links.length > 0 && (
              <ul className="divide-y divide-ink/5 mt-4">
                {bio.links.map((link) => (
                  <li key={link.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{link.title}</p>
                      <p className="text-xs text-ink-soft truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-ink-soft bg-paper px-2 py-1 rounded">
                        {link.clicks} clicks
                      </span>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={deletingId === link.id}
                        className="text-red-500 hover:text-red-600 disabled:opacity-40"
                        aria-label="Remove link"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-navy rounded-2xl p-6 text-center h-fit">
          <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-white text-xl font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <p className="text-white font-display font-semibold mt-3">{headline}</p>
          <p className="text-white/50 text-sm mt-1">{bioText}</p>

          <div className="space-y-2 mt-5">
            {bio.links.map((link) => (
              <div
                key={link.id}
                className="bg-white/10 text-white text-sm rounded-lg py-2.5 px-4 flex items-center justify-center gap-2"
              >
                {link.title}
              </div>
            ))}
          </div>

          {user && (
            <a
              href={`/u/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-teal-light font-semibold mt-5 hover:underline"
            >
              <FiEye size={13} /> View public page <FiExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
