"use client";

import { useState, useEffect, useCallback } from "react";

interface TeamMemberData {
  id: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

interface InvitationData {
  id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expiresAt: string;
  invitedBy: string;
  createdAt: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const roleBadgeColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  member: "bg-gray-100 text-gray-800",
};

const avatarColors: Record<string, string> = {
  owner: "bg-purple-500",
  admin: "bg-blue-500",
  member: "bg-gray-400",
};

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) setMembers(await res.json());
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/team/invitations");
      if (res.ok) setInvitations(await res.json());
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchInvitations()]).finally(() =>
      setLoading(false)
    );
  }, [fetchMembers, fetchInvitations]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage("");
    setInviteError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (res.ok) {
        setInviteMessage(`Invitation sent to ${email}`);
        setEmail("");
        setRole("member");
        fetchInvitations();
      } else {
        const data = await res.json();
        setInviteError(data.error || "Failed to send invitation");
      }
    } catch {
      setInviteError("Failed to send invitation");
    }
  };

  const handleRemove = async (member: TeamMemberData) => {
    if (!window.confirm(`Remove ${member.user.name} from the team?`)) return;

    try {
      const res = await fetch(`/api/team/${member.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove member");
      }
    } catch {
      alert("Failed to remove member");
    }
  };

  const handleCopyLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/invite/${token}`
      );
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      console.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading team...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Home
          </a>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              Team Members
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {members.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${avatarColors[member.role]}`}
                  >
                    {getInitials(member.user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeColors[member.role]}`}
                  >
                    {member.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                  {member.role !== "owner" && (
                    <button
                      onClick={() => handleRemove(member)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove member"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No team members yet
              </div>
            )}
          </div>
        </div>

        {/* Invite Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invite a Team Member
          </h2>
          <form onSubmit={handleInvite} className="flex items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="invite-role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "member" | "admin")}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Send Invite
            </button>
          </form>
          {inviteMessage && (
            <p className="mt-3 text-sm text-green-600">{inviteMessage}</p>
          )}
          {inviteError && (
            <p className="mt-3 text-sm text-red-600">{inviteError}</p>
          )}
        </div>

        {/* Pending Invitations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Invitations
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {invitations.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium text-gray-900">
                    {inv.email}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeColors[inv.role]}`}
                  >
                    {inv.role}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Expires {formatDate(inv.expiresAt)}
                  </span>
                  <button
                    onClick={() => handleCopyLink(inv.token)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {copiedToken === inv.token ? "Copied!" : "Copy Invite Link"}
                  </button>
                </div>
              </div>
            ))}
            {invitations.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No pending invitations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
