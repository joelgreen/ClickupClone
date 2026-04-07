"use client";

import { useState } from "react";

interface AcceptInviteButtonProps {
  token: string;
}

export default function AcceptInviteButton({ token }: AcceptInviteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        setAccepted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to accept invitation");
      }
    } catch {
      setError("Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-medium text-green-600">
          🎉 You&apos;ve joined the team!
        </p>
        <a
          href="/board"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Board →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Accepting..." : "Accept Invitation"}
      </button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
}
