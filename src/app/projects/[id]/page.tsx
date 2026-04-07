"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string | null;
  _count: { tasks: number };
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  description: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-green-500",
  cancelled: "bg-gray-400",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/tasks?projectId=${id}`),
      ]);
      if (projRes.ok) setProject(await projRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function tasksByStatus(status: string) {
    return tasks.filter((t) => t.status === status);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Loading…
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Project not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <a
            href="/projects"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Projects
          </a>
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        </div>
        {project.description && (
          <p className="mt-1 text-gray-500 text-sm ml-[calc(1rem+16px)]">
            {project.description}
          </p>
        )}
      </header>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {Object.keys(STATUS_LABELS).map((status) => {
          const statusTasks = tasksByStatus(status);
          return (
            <div
              key={status}
              className="bg-gray-100 rounded-xl p-4 min-h-[200px]"
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-3 h-3 rounded-full ${STATUS_COLORS[status]}`}
                />
                <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {statusTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <h3 className="font-medium text-gray-900 text-sm">
                      {task.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
