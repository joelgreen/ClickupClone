"use client";

import { useEffect, useState, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  description: string | null;
}

const COLUMNS = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) return "Overdue";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskCard({ task }: { task: Task }) {
  const dueDateLabel = formatDueDate(task.dueDate);
  const isOverdue = dueDateLabel === "Overdue";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low}`}
        >
          {task.priority}
        </span>
        {dueDateLabel && (
          <span
            className={`text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}
          >
            {isOverdue ? "⚠ Overdue" : `📅 ${dueDateLabel}`}
          </span>
        )}
      </div>
    </div>
  );
}

function InlineTaskForm({
  status,
  onCreated,
  onCancel,
}: {
  status: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), status }),
      });
      if (res.ok) {
        setTitle("");
        onCreated();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-300 p-3 shadow-sm space-y-2">
      <input
        autoFocus
        type="text"
        placeholder="Task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const COLUMN_COLORS: Record<string, string> = {
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-green-500",
  cancelled: "bg-gray-400",
};

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function tasksByStatus(status: string) {
    return tasks.filter((t) => t.status === status);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Home
          </a>
          <h1 className="text-xl font-bold text-gray-900">Kanban Board</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Loading tasks…
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMNS.map((col) => (
            <div key={col.key} className="bg-gray-100 rounded-xl p-4 min-h-[200px]">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-3 h-3 rounded-full ${COLUMN_COLORS[col.key]}`} />
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  {col.label}
                </h2>
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {tasksByStatus(col.key).length}
                </span>
              </div>

              <div className="space-y-3">
                {tasksByStatus(col.key).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}

                {openForm === col.key ? (
                  <InlineTaskForm
                    status={col.key}
                    onCreated={() => {
                      setOpenForm(null);
                      fetchTasks();
                    }}
                    onCancel={() => setOpenForm(null)}
                  />
                ) : (
                  <button
                    onClick={() => setOpenForm(col.key)}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg py-2 transition-colors"
                  >
                    + New Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
