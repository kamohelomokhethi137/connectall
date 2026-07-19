import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { FiUpload, FiDownload, FiTrash2, FiFile, FiVideo, FiMic, FiImage } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchFiles, sendFile, deleteFile, downloadUrl } from "../lib/files";

const typeIcons = { file: FiFile, video: FiVideo, voice: FiMic, image: FiImage };

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileRow({ f, direction, onDelete, deleting }) {
  const Icon = typeIcons[f.file_type] || FiFile;
  return (
    <li className="flex items-center justify-between py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center text-teal-dark shrink-0">
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{f.filename}</p>
          <p className="text-xs text-ink-soft">
            {direction === "sent"
              ? `To ${f.recipient_username ? "@" + f.recipient_username : f.recipient_email || "someone"}`
              : `From @${f.sender_username}`}
            {" · "}
            {formatSize(f.size_bytes)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={downloadUrl(f.download_url)}
          className="text-teal-dark hover:text-teal-light"
          aria-label="Download file"
        >
          <FiDownload size={15} />
        </a>
        {direction === "sent" && (
          <button
            onClick={() => onDelete(f.id)}
            disabled={deleting === f.id}
            className="text-red-500 hover:text-red-600 disabled:opacity-40"
            aria-label="Delete file"
          >
            <FiTrash2 size={15} />
          </button>
        )}
      </div>
    </li>
  );
}

export default function Files() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchFiles();
      setData(d);
    } catch (err) {
      setError(err.message || "Couldn't load your files.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!file) {
        toast.error("Choose a file to send.");
        return;
      }
      if (!recipient.trim()) {
        toast.error("Enter a recipient username or email.");
        return;
      }
      setSending(true);
      try {
        const res = await sendFile(file, recipient.trim(), message.trim());
        setData((prev) => ({ ...prev, sent: [res.file, ...prev.sent] }));
        setRecipient("");
        setMessage("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("File sent successfully!");
      } catch (err) {
        toast.error(err.message || "Couldn't send that file.");
      } finally {
        setSending(false);
      }
    },
    [file, recipient, message]
  );

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this file?")) return;
    setDeletingId(id);
    try {
      await deleteFile(id);
      setData((prev) => ({ ...prev, sent: prev.sent.filter((f) => f.id !== id) }));
      toast.success("File removed.");
    } catch (err) {
      toast.error(err.message || "Couldn't remove that file.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="File Sharing">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="File Sharing">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="File Sharing">
      <div className="bg-white rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiUpload className="text-teal-dark" aria-hidden="true" />
          Send a file
        </h2>
        <form onSubmit={handleSend} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient username or email"
            required
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal md:col-span-1"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (optional)"
            className="h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <SubmitButton loading={sending}>Send</SubmitButton>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="md:col-span-3 text-sm text-ink-soft file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-paper file:text-ink file:text-xs file:font-semibold"
          />
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-2">Sent</h2>
          {data.sent.length === 0 ? (
            <p className="text-sm text-ink-soft py-6 text-center">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {data.sent.map((f) => (
                <FileRow key={f.id} f={f} direction="sent" onDelete={handleDelete} deleting={deletingId} />
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-ink/5 p-5">
          <h2 className="font-display font-semibold text-ink mb-2">Received</h2>
          {data.received.length === 0 ? (
            <p className="text-sm text-ink-soft py-6 text-center">Nothing received yet.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {data.received.map((f) => (
                <FileRow key={f.id} f={f} direction="received" onDelete={handleDelete} deleting={deletingId} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
