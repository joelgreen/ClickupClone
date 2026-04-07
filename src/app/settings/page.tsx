"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/profile");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
