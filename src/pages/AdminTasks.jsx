import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import SubmitButton from "../components/SubmitButton";
import { fetchAdminTasks, addAdminTask, toggleAdminTask, deleteAdminTask } from "../lib/admin";

const emptyForm = { title: "", description: "", task_type: "", target_count: 1, points_reward: 10, tokens_reward: 0 };

export default function AdminTasks() {
  const [tasks, setTasks] = useState(null);
  const [taskTypes, setTaskTypes] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAdminTasks();
      setTasks(data.tasks);
      setTaskTypes(data.task_types);
      setForm((f) => ({ ...f, task_type: f.task_type || data.task_types[0] || "" }));
    } catch (err) {
      setError(err.message || "Couldn't load tasks.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.title.trim() || !form.task_type) {
        toast.error("A title and task type are required.");
        return;
      }
      setAdding(true);
      try {
        const res = await addAdminTask(form);
        setTasks((prev) => [res.task, ...prev]);
        setForm({ ...emptyForm, task_type: form.task_type });
        toast.success("Task created.");
      } catch (err) {
        toast.error(err.message || "Couldn't create that task.");
      } finally {
        setAdding(false);
      }
    },
    [form]
  );

  const handleToggle = useCallback(async (id) => {
    try {
      const res = await toggleAdminTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
    } catch (err) {
      toast.error(err.message || "Couldn't update that task.");
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteAdminTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted.");
    } catch (err) {
      toast.error(err.message || "Couldn't delete that task.");
    }
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Manage Tasks">
        <p className="text-ink-soft">{error}</p>
        <button onClick={load} className="mt-2 text-sm font-semibold text-teal-dark hover:underline">Try again</button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Tasks">
      <div className="bg-white rounded-2xl border border-ink/5 p-5 mb-6">
        <h2 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
          <FiPlus className="text-teal-dark" /> Create task
        </h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                 placeholder="Title" required
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <select value={form.task_type} onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value }))}
                  className="h-11 rounded-lg border border-ink/10 px-3 text-sm bg-white">
            {taskTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <input value={form.target_count} onChange={(e) => setForm((f) => ({ ...f, target_count: e.target.value }))}
                 type="number" min="1" placeholder="Target count"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={form.points_reward} onChange={(e) => setForm((f) => ({ ...f, points_reward: e.target.value }))}
                 type="number" min="0" placeholder="Points reward"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <input value={form.tokens_reward} onChange={(e) => setForm((f) => ({ ...f, tokens_reward: e.target.value }))}
                 type="number" min="0" placeholder="Tokens reward"
                 className="h-11 rounded-lg border border-ink/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
          <SubmitButton loading={adding}>Create</SubmitButton>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description" rows={2}
                    className="sm:col-span-2 lg:col-span-3 rounded-lg border border-ink/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal" />
        </form>
      </div>

      {!tasks ? (
        <div className="h-64 rounded-2xl bg-white border border-ink/5 animate-pulse" />
      ) : (
        <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b border-ink/5">
                <th className="p-4 font-medium">Task</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Rewards</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium text-ink">{t.title}</td>
                  <td className="p-4 text-ink-soft text-xs capitalize">{t.task_type.replace(/_/g, " ")}</td>
                  <td className="p-4 text-ink-soft text-xs">{t.points_reward} pts / {t.tokens_reward} tokens</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(t.id)}
                            className={`px-2 py-1 rounded text-xs ${t.is_active ? "bg-teal/10 text-teal-dark" : "bg-paper text-ink-soft"}`}>
                      {t.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-600" aria-label="Delete">
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
