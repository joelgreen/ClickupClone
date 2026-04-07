"use client";

import { useEffect, useState, useCallback } from "react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { tasks: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        setShowForm(false);
        fetchProjects();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Home
          </a>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        </div>
        <a
          href="/board"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Kanban Board →
        </a>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Loading projects…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-gray-400 font-medium">
                    {project._count.tasks}{" "}
                    {project._count.tasks === 1 ? "task" : "tasks"}
                  </div>
                </a>
              ))}
            </div>

            {showForm ? (
              <form
                onSubmit={handleCreate}
                className="mt-6 bg-white rounded-xl border border-blue-300 p-5 shadow-sm space-y-3 max-w-md"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Creating…" : "Create Project"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + New Project
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
