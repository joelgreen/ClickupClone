"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { highlight } from "@/lib/highlight";

interface TaskResult {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project: { id: string; name: string } | null;
}

interface CommentResult {
  id: string;
  body: string;
  task: { id: string; title: string };
}

interface SearchResponse {
  tasks: TaskResult[];
  comments: CommentResult[];
}

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce input by 300ms
  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data: SearchResponse) => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const hasResults =
    results && (results.tasks.length > 0 || results.comments.length > 0);
  const isIdle = query.length < 2;
  const isEmpty = !isIdle && !loading && results && !hasResults;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Search</h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks and comments..."
          className="w-full text-lg border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />

        {/* Loading state */}
        {loading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Searching...</span>
          </div>
        )}

        {/* Idle state */}
        {isIdle && !loading && (
          <p className="mt-8 text-center text-gray-400">
            Start typing to search tasks and comments...
          </p>
        )}

        {/* Empty state */}
        {isEmpty && (
          <p className="mt-8 text-center text-gray-400">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <div className="mt-8 space-y-8">
            {/* Tasks section */}
            {results.tasks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {results.tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/tasks/${task.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {highlight(task.title, debouncedQuery)}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status] ?? STATUS_STYLES.todo}`}
                            >
                              {STATUS_LABELS[task.status] ?? task.status}
                            </span>
                            {task.project && (
                              <span className="text-xs text-gray-400">
                                {task.project.name}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="mt-2 text-sm text-gray-500">
                              {highlight(
                                task.description.slice(0, 120) +
                                  (task.description.length > 120 ? "..." : ""),
                                debouncedQuery
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments section */}
            {results.comments.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Comments
                  </h2>
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {results.comments.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {results.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm text-gray-700">
                        {highlight(
                          comment.body.slice(0, 150) +
                            (comment.body.length > 150 ? "..." : ""),
                          debouncedQuery
                        )}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        on{" "}
                        <Link
                          href={`/tasks/${comment.task.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {comment.task.title}
                        </Link>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
