import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiLock, FiUnlock, FiTrash2, FiShield } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { useAuth } from "../lib/AuthContext";
import {
  fetchAdminUserDetail, editAdminUser, blockUser, activateUser,
  muteUser, unmuteUser, deleteUser,
} from "../lib/adminUsers";

const ROLES = ["user", "admin", "super_admin"];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const iAmSuperadmin = me?.role === "super_admin";

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", phone: "", role: "user" });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [muteHours, setMuteHours] = useState(24);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminUserDetail(id);
      setUser(data.user);
      setForm({
        username: data.user.username,
        email: data.user.email,
        phone: data.user.phone || "",
        role: data.user.role,
      });
    } catch (err) {
      toast.error(err.message || "Couldn't load this user.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isTargetSuperadmin = user?.role === "super_admin";
  // Mirrors the backend's exact restriction: a non-superadmin can never
  // act on a superadmin account. Buttons are disabled here for UX, but
  // the real block is server-side - this just avoids a pointless
  // request-then-403 round trip for something the user can't do anyway.
  const canModerate = !isTargetSuperadmin || iAmSuperadmin;
  const isSelf = String(user?.id) === String(me?.id);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
        const data = await editAdminUser(id, form);
        toast.success(data.message || "Changes submitted.");
      } catch (err) {
        toast.error(err.message || "Couldn't submit changes.");
      } finally {
        setSaving(false);
      }
    },
    [id, form]
  );

  const runAction = useCallback(
    async (key, fn, successMsg) => {
      setActionLoading(key);
      try {
        const data = await fn();
        if (data?.user) setUser(data.user);
        toast.success(successMsg);
      } catch (err) {
        toast.error(err.message || "That action failed.");
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Permanently delete @${user.username}? This cannot be undone.`)) return;
    setActionLoading("delete");
    try {
      await deleteUser(id);
      toast.success("User deleted.");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.message || "Couldn't delete this user.");
    } finally {
      setActionLoading(null);
    }
  }, [id, user, navigate]);

  if (!user) {
    return (
      <DashboardLayout title="User Detail">
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`@${user.username}`}>
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-4">
        <FiArrowLeft size={14} /> Back to all users
      </Link>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Edit form */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-2xl border border-ink/5 p-5 space-y-4">
          <h2 className="font-display font-semibold text-ink">Profile details</h2>
          <p className="text-xs text-ink-soft -mt-2">
            Changes are emailed to the user for confirmation before they take effect.
          </p>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          {iAmSuperadmin && (
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">
                Role <span className="text-ink-soft/60 font-normal">(super admin only)</span>
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={isSelf}
                className="w-full h-11 rounded-lg border border-ink/10 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal disabled:bg-paper"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace("_", " ")}</option>
                ))}
              </select>
              {isSelf && <p className="text-xs text-ink-soft mt-1">You can't change your own role.</p>}
            </div>
          )}

          <SubmitButton loading={saving}>
            <FiSave className="inline mr-1.5" size={15} /> Submit changes
          </SubmitButton>
        </form>

        {/* Actions panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-ink/5 p-5">
            <h2 className="font-display font-semibold text-ink mb-3 flex items-center gap-2">
              <FiShield className="text-teal-dark" /> Account status
            </h2>

            {!canModerate && (
              <p className="text-xs text-gold-dark bg-gold/10 rounded p-2.5 mb-3">
                Only a super admin can moderate a super admin account.
              </p>
            )}

            {user.is_active_account ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Reason for blocking"
                  disabled={!canModerate}
                  className="w-full h-10 rounded-lg border border-ink/10 px-3 text-sm disabled:bg-paper"
                />
                <button
                  onClick={() => runAction("block", () => blockUser(id, blockReason), "User blocked.")}
                  disabled={!canModerate || actionLoading === "block"}
                  className="w-full h-10 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold"
                >
                  Block user
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-ink-soft mb-2">
                  Blocked{user.block_reason ? `: ${user.block_reason}` : ""}
                </p>
                <button
                  onClick={() => runAction("activate", () => activateUser(id), "User reactivated.")}
                  disabled={actionLoading === "activate"}
                  className="w-full h-10 rounded-lg bg-teal hover:bg-teal-light disabled:opacity-40 text-navy text-sm font-semibold"
                >
                  Reactivate user
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-ink/5 p-5">
            <h2 className="font-display font-semibold text-ink mb-3 flex items-center gap-2">
              <FiLock className="text-teal-dark" /> Mute
            </h2>
            {user.muted_until && new Date(user.muted_until) > new Date() ? (
              <div>
                <p className="text-xs text-ink-soft mb-2">
                  Muted until {new Date(user.muted_until).toLocaleString()}
                </p>
                <button
                  onClick={() => runAction("unmute", () => unmuteUser(id), "Mute lifted.")}
                  disabled={actionLoading === "unmute"}
                  className="w-full h-10 rounded-lg border border-ink/15 hover:bg-paper disabled:opacity-40 text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <FiUnlock size={14} /> Unmute
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="number"
                  value={muteHours}
                  onChange={(e) => setMuteHours(e.target.value)}
                  min={1}
                  className="w-full h-10 rounded-lg border border-ink/10 px-3 text-sm disabled:bg-paper"
                  disabled={!canModerate}
                />
                <button
                  onClick={() => runAction("mute", () => muteUser(id, Number(muteHours), ""), "User muted.")}
                  disabled={!canModerate || actionLoading === "mute"}
                  className="w-full h-10 rounded-lg border border-ink/15 hover:bg-paper disabled:opacity-40 text-sm font-semibold"
                >
                  Mute for {muteHours}h
                </button>
              </div>
            )}
          </div>

          {iAmSuperadmin && !isSelf && (
            <div className="bg-white rounded-2xl border border-red-100 p-5">
              <h2 className="font-display font-semibold text-red-500 mb-3 flex items-center gap-2">
                <FiTrash2 /> Danger zone
              </h2>
              <button
                onClick={handleDelete}
                disabled={actionLoading === "delete"}
                className="w-full h-10 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold"
              >
                Permanently delete user
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
