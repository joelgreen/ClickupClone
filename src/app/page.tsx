export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-gray-900">ClickUp Clone</h1>
      <p className="text-gray-600">
        A project management application built with Next.js, TypeScript, and PostgreSQL.
      </p>
      <a
        href="/board"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Open Kanban Board →
      </a>
    </main>
  );
}
