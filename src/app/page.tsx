import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-gray-900">FlowOS</h1>
      <p className="text-gray-600 text-center max-w-md">
        A project management application built with Next.js, TypeScript, and
        PostgreSQL.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In →
        </Link>
      </div>
    </main>
  );
}
