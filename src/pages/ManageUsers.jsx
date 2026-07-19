import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserCheck, FiSlash } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { fetchAdminUsers } from "../lib/adminUsers";

const roleBadge = {
  super_admin: "bg-gold/15 text-gold-dark",
  admin: "bg-teal/10 text-teal-dark",
  user: "bg-ink/5 text-ink-soft",
};

export default function ManageUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);

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

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      load(q);
    },
    [q, load]
  );

  return (
    <DashboardLayout title="Manage Users">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-md">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/50" size={16} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username, email, or phone"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-dark"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
        {error && <p className="p-5 text-ink-soft">{error}</p>}

        {!error && users === null && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-ink/5 rounded animate-pulse" />
            ))}
          </div>
        )}

        {users && users.length === 0 && (
          <p className="text-center text-ink-soft py-10">No users found.</p>
        )}

        {users && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-soft border-b border-ink/5">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium text-right">Actions</th>
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
                      <span className={`px-2 py-1 rounded text-xs capitalize ${roleBadge[u.role] || roleBadge.user}`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.is_active_account ? (
                        <span className="inline-flex items-center gap-1 text-xs text-teal-dark">
                          <FiUserCheck size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <FiSlash size={13} /> Blocked
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-ink-soft text-xs">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="text-xs font-semibold text-teal-dark border border-teal-dark/30 rounded px-2.5 py-1 hover:bg-teal/5"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
