"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavUser() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-gray-700 text-sm font-medium">
          👤 {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
    >
      Sign in
    </Link>
  );
}
