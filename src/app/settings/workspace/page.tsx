"use client";

import { useState, useEffect } from "react";

export default function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [defaultPriority, setDefaultPriority] = useState("medium");
  const [defaultTaskType, setDefaultTaskType] = useState("task");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/workspace/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((settings) => {
        const data = settings.data || {};
        setWorkspaceName(data.workspaceName || "My Workspace");
        setDefaultPriority(data.defaultPriority || "medium");
        setDefaultTaskType(data.defaultTaskType || "task");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName, defaultPriority, defaultTaskType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setMessage("Workspace settings updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading workspace settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Workspace Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="workspaceName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="defaultPriority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Default Priority
            </label>
            <select
              id="defaultPriority"
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="defaultTaskType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Default Task Type
            </label>
            <select
              id="defaultTaskType"
              value={defaultTaskType}
              onChange={(e) => setDefaultTaskType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
