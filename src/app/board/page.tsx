"use client";

import { useEffect, useState, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  description: string | null;
  project?: { id: string; name: string } | null;
}

interface Comment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
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

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) return "Overdue";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const dueDateLabel = formatDueDate(task.dueDate);
  const isOverdue = dueDateLabel === "Overdue";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
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

function CommentsSection({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous", body: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Comments</h3>
      {loading ? (
        <p className="text-xs text-gray-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400">No comments yet.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-700 text-xs">
                  {comment.userId}
                </span>
                <span className="text-xs text-gray-400">
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Add Comment"}
        </button>
      </form>
    </div>
  );
}

function TaskDetailPanel({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const dueDateLabel = formatDueDate(task.dueDate);
  const isOverdue = dueDateLabel === "Overdue";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Description */}
          {task.description ? (
            <p className="text-sm text-gray-600 mb-4">{task.description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic mb-4">
              No description provided.
            </p>
          )}

          {/* Meta info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16">Priority</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low}`}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16">Status</span>
              <span className="text-xs font-medium text-gray-700">
                {STATUS_LABELS[task.status] ?? task.status}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Due</span>
                <span
                  className={`text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}`}
                >
                  {isOverdue
                    ? "⚠ Overdue"
                    : new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                </span>
              </div>
            )}
            {task.project && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Project</span>
                <span className="text-xs font-medium text-blue-600">
                  {task.project.name}
                </span>
              </div>
            )}
          </div>

          {/* Comments */}
          <CommentsSection taskId={task.id} />
        </div>
      </div>
    </>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const url = selectedProjectId
        ? `/api/tasks?projectId=${selectedProjectId}`
        : "/api/tasks";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function tasksByStatus(status: string) {
    return tasks.filter((t) => t.status === status);
  }

  function handleTaskClick(task: Task) {
    // Fetch full task details including project relation
    fetch(`/api/tasks/${task.id}`)
      .then((res) => res.json())
      .then((fullTask) => setSelectedTask(fullTask))
      .catch(() => setSelectedTask(task));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Home
          </a>
          <h1 className="text-xl font-bold text-gray-900">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setLoading(true);
            }}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <a
            href="/projects"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Projects
          </a>
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
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
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

      {/* Task Detail Side Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </main>
  );
}
