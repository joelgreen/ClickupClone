"use client";

import { useState, useEffect } from "react";

interface NotificationPrefs {
  taskAssigned: boolean;
  taskCommented: boolean;
  taskCompleted: boolean;
  mention: boolean;
}

const PREF_LABELS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: "taskAssigned", label: "Task Assigned", description: "When a task is assigned to you" },
  { key: "taskCommented", label: "Task Commented", description: "When someone comments on your task" },
  { key: "taskCompleted", label: "Task Completed", description: "When a task you created is completed" },
  { key: "mention", label: "Mention", description: "When someone mentions you in a comment" },
];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    taskAssigned: true,
    taskCommented: true,
    taskCompleted: true,
    mention: true,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preferences");
        return res.json();
      })
      .then((data) => setPrefs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof NotificationPrefs) => {
    const newValue = !prefs[key];
    const updatedPrefs = { ...prefs, [key]: newValue };
    setPrefs(updatedPrefs);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });

      if (!res.ok) {
        // Revert on failure
        setPrefs(prefs);
        const data = await res.json();
        throw new Error(data.error || "Failed to update preferences");
      }

      setMessage("Preferences updated");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading notification preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">
        Notification Preferences
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-100">
          {PREF_LABELS.map(({ key, label, description }) => (
            <div
              key={key}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  prefs[key] ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <p className="text-sm text-green-600">{message}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
