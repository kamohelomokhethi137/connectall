import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiSearch, FiSlash, FiCheckCircle, FiVolumeX, FiVolume2, FiChevronRight } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminUsers, blockUser, activateUser, unmuteUser } from "../lib/admin";

const roleBadge = {
  user: "bg-paper text-ink-soft",
  admin: "bg-teal/10 text-teal-dark",
  super_admin: "bg-gold/10 text-gold-dark",
};

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (query) => {
    setError(null);
    try {
      const data = await fetchAdminUsers(query);
      setUsers(data.users);
    } catch (err) {
      setError(err.message || "Couldn't load users.");
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setUsers(null);
    load(q);
  };

  const handleBlock = useCallback(async (u) => {
    const reason = window.prompt(`Reason for blocking @${u.username}?`, "");
    if (reason === null) return;
    setBusyId(u.id);
    try {
      await blockUser(u.id, reason);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active_account: false } : x)));
      toast.success(`@${u.username} blocked.`);
    } catch (err) {
      toast.error(err.message || "Couldn't block that user.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleActivate = useCallback(async (u) => {
    setBusyId(u.id);
    try {
      await activateUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active_account: true } : x)));
      toast.success(`@${u.username} reactivated.`);
    } catch (err) {
      toast.error(err.message || "Couldn't reactivate that user.");
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleUnmute = useCallback(async (u) => {
    setBusyId(u.id);
    try {
      await unmuteUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_muted: false } : x)));
      toast.success(`@${u.username} unmuted.`);
    } catch (err) {
      toast.error(err.message || "Couldn't unmute that user.");
    } finally {
      setBusyId(null);
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Manage Users">
        <p className="text-ink-soft">{error}</p>
        <button onClick={() => load("")} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">
          Try again
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Users">
      <form onSubmit={handleSearch} className="flex gap-2 mb-5 max-w-md">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={15} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username, email, or phone"
            className="w-full h-11 rounded-lg border border-ink/10 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <button type="submit" className="h-11 px-4 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-light">
          Search
        </button>
      </form>

      {!users ? (
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      ) : (
        <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Balance</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-ink/5 last:border-0">
                    <td className="p-4">
                      <p className="font-medium text-ink">@{u.username}</p>
                      <p className="text-xs text-ink-soft">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${roleBadge[u.role] || "bg-paper text-ink"}`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-ink">R{(Number(u.balance) || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs ${u.is_active_account ? "bg-teal/10 text-teal-dark" : "bg-red-50 text-red-500"}`}>
                          {u.is_active_account ? "Active" : "Blocked"}
                        </span>
                        {u.is_muted && <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold-dark">Muted</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {u.is_active_account ? (
                          <button
                            onClick={() => handleBlock(u)}
                            disabled={busyId === u.id || u.role === "super_admin"}
                            className="text-red-500 hover:text-red-600 disabled:opacity-30"
                            aria-label="Block user"
                          >
                            <FiSlash size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u)}
                            disabled={busyId === u.id}
                            className="text-teal-dark hover:text-teal-light disabled:opacity-30"
                            aria-label="Reactivate user"
                          >
                            <FiCheckCircle size={15} />
                          </button>
                        )}
                        {u.is_muted ? (
                          <button
                            onClick={() => handleUnmute(u)}
                            disabled={busyId === u.id}
                            className="text-ink-soft hover:text-ink disabled:opacity-30"
                            aria-label="Unmute user"
                          >
                            <FiVolume2 size={15} />
                          </button>
                        ) : (
                          <FiVolumeX size={15} className="text-ink-soft/30" aria-hidden="true" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Link to={`/admin/users/${u.id}`} className="text-teal-dark hover:text-teal-light">
                        <FiChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
