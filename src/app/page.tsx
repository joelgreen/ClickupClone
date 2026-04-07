import NavUser from "@/components/NavUser";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <div className="absolute top-4 right-4">
        <NavUser />
      </div>
      <h1 className="text-4xl font-bold text-gray-900">ClickUp Clone</h1>
      <p className="text-gray-600">
        A project management application built with Next.js, TypeScript, and PostgreSQL.
      </p>
      <div className="flex gap-4">
        <a
          href="/board"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Open Kanban Board →
        </a>
        <a
          href="/projects"
          className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          View Projects →
        </a>
        <a
          href="/activity"
          className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Activity Feed →
        </a>
      </div>
    </main>
  );
}
