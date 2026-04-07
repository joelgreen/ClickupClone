import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCommentDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          href="/board"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to Board
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[task.status] ?? STATUS_STYLES.todo}`}
          >
            {STATUS_LABELS[task.status] ?? task.status}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low}`}
          >
            {task.priority}
          </span>
        </div>

        {/* Meta info */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 space-y-3">
          {task.project && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-20">Project</span>
              <Link
                href={`/projects/${task.project.id}`}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                {task.project.name}
              </Link>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-20">Due Date</span>
              <span className="text-sm text-gray-700">
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
          {task.assigneeId && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-20">Assignee</span>
              <span className="text-sm text-gray-700">{task.assigneeId}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </h2>
          {task.description ? (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No description</p>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Comments ({task.comments.length})
          </h2>
          {task.comments.length === 0 ? (
            <p className="text-sm text-gray-400">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700 text-xs">
                      {comment.userId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
