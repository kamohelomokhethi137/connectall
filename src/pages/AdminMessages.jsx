import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchContactMessages, resolveMessage } from "../lib/admin";

export default function AdminMessages() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchContactMessages();
      setMessages(data.messages);
    } catch (err) {
      setError(err.message || "Couldn't load contact messages.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = useCallback(async (id) => {
    setBusyId(id);
    try {
      await resolveMessage(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_resolved: true } : m)));
      toast.success("Marked as resolved.");
    } catch (err) {
      toast.error(err.message || "Couldn't resolve that message.");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Contact Messages">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  if (!messages) {
    return (
      <DashboardLayout title="Contact Messages">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contact Messages">
      {messages.length === 0 ? (
        <p className="text-center text-ink-soft py-10">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-ink/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center text-teal-dark shrink-0 mt-0.5">
                    <FiMail size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{m.subject || "(no subject)"}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{m.name} \u00b7 {m.email}</p>
                    <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs text-ink-soft mt-2">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {m.is_resolved ? (
                  <span className="flex items-center gap-1 text-xs text-teal-dark shrink-0"><FiCheckCircle size={13} /> Resolved</span>
                ) : (
                  <button onClick={() => handleResolve(m.id)} disabled={busyId === m.id}
                          className="text-xs font-semibold bg-teal text-navy px-3 py-1.5 rounded-lg hover:bg-teal-light disabled:opacity-50 shrink-0">
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
