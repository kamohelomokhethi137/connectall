import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../lib/AuthContext";
import {
  fetchAdminUserDetail, editAdminUser, blockUser, activateUser,
  muteUser, unmuteUser, deleteUser, setUserRole,
} from "../lib/admin";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [muteHours, setMuteHours] = useState("24");
  const [muteReason, setMuteReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdminUserDetail(id);
      setUser(data.user);
      setForm({ username: data.user.username, email: data.user.email, phone: data.user.phone || "" });
    } catch (err) {
      setError(err.message || "Couldn't load that user.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const res = await editAdminUser(id, form);
        toast.success(res.message);
      } catch (err) {
        toast.error(err.message || "Couldn't submit those changes.");
      } finally {
        setSaving(false);
      }
    },
    [id, form]
  );

  const handleBlock = useCallback(async () => {
    const reason = window.prompt("Reason for blocking this user?", "");
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await blockUser(id, reason);
      setUser(res.user);
      toast.success("User blocked.");
    } catch (err) {
      toast.error(err.message || "Couldn't block that user.");
    } finally {
      setBusy(false);
    }
  }, [id]);

  const handleActivate = useCallback(async () => {
    setBusy(true);
    try {
      const res = await activateUser(id);
      setUser(res.user);
      toast.success("User reactivated.");
    } catch (err) {
      toast.error(err.message || "Couldn't reactivate that user.");
    } finally {
      setBusy(false);
    }
  }, [id]);

  const handleMute = useCallback(async () => {
    setBusy(true);
    try {
      const res = await muteUser(id, parseFloat(muteHours) || 24, muteReason);
      setUser(res.user);
      toast.success("User muted.");
      setMuteReason("");
    } catch (err) {
      toast.error(err.message || "Couldn't mute that user.");
    } finally {
      setBusy(false);
    }
  }, [id, muteHours, muteReason]);

  const handleUnmute = useCallback(async () => {
    setBusy(true);
    try {
      const res = await unmuteUser(id);
      setUser(res.user);
      toast.success("User unmuted.");
    } catch (err) {
      toast.error(err.message || "Couldn't unmute that user.");
    } finally {
      setBusy(false);
    }
  }, [id]);

  const handleSetRole = useCallback(
    async (role) => {
      if (!window.confirm(`Change this user's role to ${role}?`)) return;
      setBusy(true);
      try {
        const res = await setUserRole(id, role);
        setUser(res.user);
        toast.success(`Role changed to ${role}.`);
      } catch (err) {
        toast.error(err.message || "Couldn't change that user's role.");
      } finally {
        setBusy(false);
      }
    },
    [id]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Permanently delete this account? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteUser(id);
      toast.success("User deleted.");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that user.");
      setBusy(false);
    }
  }, [id, navigate]);

  if (error) {
    return (
      <DashboardLayout title="User Detail">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="User Detail">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`@${user.username}`}>
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-4"
      >
        <FiArrowLeft size={14} /> Back to Manage Users
      </button>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-ink/5 p-6">
          <h2 className="font-display font-semibold text-ink mb-4">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Username" value={form.username}
                       onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            <FormField label="Email" type="email" value={form.email}
                       onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <FormField label="Phone" value={form.phone}
                       onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <p className="text-xs text-ink-soft -mt-2">
              Changes are sent to the user for email confirmation before they apply.
            </p>
            <SubmitButton loading={saving}>Submit changes</SubmitButton>
          </form>

          <div className="mt-6 pt-6 border-t border-ink/5 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-ink-soft text-xs">Balance</p><p className="font-semibold text-ink">R{(Number(user.balance) || 0).toFixed(2)}</p></div>
            <div><p className="text-ink-soft text-xs">Points / Tokens</p><p className="font-semibold text-ink">{user.points} / {user.tokens}</p></div>
            <div><p className="text-ink-soft text-xs">Premium</p><p className="font-semibold text-ink">{user.is_premium_active ? "Active" : "None"}</p></div>
            <div><p className="text-ink-soft text-xs">Joined</p><p className="font-semibold text-ink">{new Date(user.created_at).toLocaleDateString()}</p></div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-ink/5 p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Account status</h2>
            <div className="flex gap-2 mb-4">
              {user.is_active_account ? (
                <button onClick={handleBlock} disabled={busy || user.role === "super_admin"}
                        className="h-9 px-3 rounded-lg bg-red-50 text-red-500 text-sm font-semibold disabled:opacity-40">
                  Block user
                </button>
              ) : (
                <button onClick={handleActivate} disabled={busy}
                        className="h-9 px-3 rounded-lg bg-teal/10 text-teal-dark text-sm font-semibold disabled:opacity-40">
                  Reactivate
                </button>
              )}
              {user.is_muted ? (
                <button onClick={handleUnmute} disabled={busy}
                        className="h-9 px-3 rounded-lg bg-paper text-ink text-sm font-semibold disabled:opacity-40">
                  Unmute
                </button>
              ) : null}
            </div>
            {user.block_reason && <p className="text-xs text-ink-soft mb-2">Block reason: {user.block_reason}</p>}

            {!user.is_muted && (
              <div className="border-t border-ink/5 pt-4">
                <p className="text-sm font-medium text-ink mb-2">Mute this user</p>
                <div className="flex gap-2">
                  <input type="number" min="1" value={muteHours} onChange={(e) => setMuteHours(e.target.value)}
                         className="w-20 h-10 rounded-lg border border-ink/10 px-2 text-sm" placeholder="Hours" />
                  <input type="text" value={muteReason} onChange={(e) => setMuteReason(e.target.value)}
                         placeholder="Reason" className="flex-1 h-10 rounded-lg border border-ink/10 px-3 text-sm" />
                  <button onClick={handleMute} disabled={busy || user.role === "super_admin"}
                          className="h-10 px-3 rounded-lg bg-gold text-navy text-sm font-semibold disabled:opacity-40">
                    Mute
                  </button>
                </div>
              </div>
            )}
          </div>

          {isSuperAdmin && (
            <div className="bg-white rounded-2xl border border-ink/5 p-6">
              <h2 className="font-display font-semibold text-ink mb-4">Super admin actions</h2>
              <div className="flex gap-2 flex-wrap mb-4">
                {["user", "admin", "super_admin"].map((r) => (
                  <button key={r} onClick={() => handleSetRole(r)} disabled={busy || user.role === r}
                          className="h-9 px-3 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-40 capitalize">
                    Make {r.replace("_", " ")}
                  </button>
                ))}
              </div>
              <button onClick={handleDelete} disabled={busy}
                      className="h-9 px-3 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-40">
                Delete account permanently
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
