"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Label {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Orange", hex: "#f97316" },
];

export default function LabelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  async function fetchLabels() {
    try {
      const res = await fetch("/api/labels");
      if (res.ok) {
        const data = await res.json();
        setLabels(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchLabels();
    }
  }, [status]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color: selectedColor }),
      });
      if (res.ok) {
        setName("");
        fetchLabels();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchLabels();
      }
    } catch {
      // ignore
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Labels</h1>

      {/* Create Label Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Create New Label
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label name…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === c.hex
                      ? "border-gray-900 scale-110"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Label"}
          </button>
        </div>
      </form>

      {/* Labels List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading labels…</p>
      ) : labels.length === 0 ? (
        <p className="text-gray-400 text-sm">No labels yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
              <button
                onClick={() => handleDelete(label.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
