'use client';

import { useEffect, useState, useCallback } from 'react';

interface ActivityEvent {
  id: string;
  action: string;
  userId: string;
  taskId: string | null;
  task: { id: string; title: string } | null;
  projectId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

function getActionIcon(action: string): string {
  switch (action) {
    case 'task.created': return '✅';
    case 'task.status_changed': return '🔄';
    case 'task.assigned': return '👤';
    case 'task.updated': return '✏️';
    case 'comment.added': return '💬';
    default: return '📋';
  }
}

function getDescription(event: ActivityEvent): string {
  const taskTitle = event.task?.title ? `"${event.task.title}"` : 'Unknown task';
  const meta = event.metadata;

  switch (event.action) {
    case 'task.status_changed': {
      const from = meta?.from ?? '?';
      const to = meta?.to ?? '?';
      return `Task ${taskTitle} moved from ${from} → ${to}`;
    }
    case 'task.assigned': {
      const assignee = meta?.assignedTo ?? 'someone';
      return `Task ${taskTitle} assigned to ${assignee}`;
    }
    case 'task.created':
      return `Task ${taskTitle} was created`;
    case 'task.updated': {
      const fields = Array.isArray(meta?.fields) ? (meta.fields as string[]).join(', ') : '';
      return `Task ${taskTitle} was updated${fields ? ` (${fields})` : ''}`;
    }
    case 'comment.added':
      return `Comment added on ${taskTitle}`;
    default:
      return `${event.action} on ${taskTitle}`;
  }
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDay.getTime() === today.getTime()) return 'Today';
  if (eventDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Group events by date
  const grouped: Record<string, ActivityEvent[]> = {};
  for (const event of events) {
    const group = getDateGroup(event.createdAt);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(event);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-sm text-gray-500 mt-1">Recent activity across all tasks and projects</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Home
            </a>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                '🔄'
              )}
              Refresh
            </button>
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h2>
            <p className="text-gray-500">Start creating tasks!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateGroup, groupEvents]) => (
              <div key={dateGroup}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {dateGroup}
                </h2>
                <div className="space-y-2">
                  {groupEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5" role="img">
                          {getActionIcon(event.action)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {getDescription(event)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {timeAgo(new Date(event.createdAt))}
                            </span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              by {event.userId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
