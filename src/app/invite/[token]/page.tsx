import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import AcceptInviteButton from "@/components/AcceptInviteButton";
import Link from "next/link";

const roleBadgeColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  member: "bg-gray-100 text-gray-800",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  // Error states
  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-red-500 text-lg font-medium">
            Invitation not found or expired
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-red-500 text-lg font-medium">
            This invitation has expired
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.acceptedAt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <p className="text-amber-600 text-lg font-medium">
            This invitation has already been used
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Valid invitation
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            You&apos;ve been invited to join FlowOS
          </h1>
          <p className="mt-1 text-gray-500">
            as a{" "}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeColors[invitation.role]}`}
            >
              {invitation.role}
            </span>
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Invited by:</span>{" "}
            {invitation.invitedBy}
          </p>
          <p>
            <span className="font-medium text-gray-700">Role:</span>{" "}
            <span className="capitalize">{invitation.role}</span>
          </p>
          <p>
            <span className="font-medium text-gray-700">Expires:</span>{" "}
            {formatDate(invitation.expiresAt)}
          </p>
        </div>

        {!session ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Please sign in to accept this invitation
            </p>
            <Link
              href={`/auth/signin?callbackUrl=/invite/${token}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <AcceptInviteButton token={token} />
        )}
      </div>
    </div>
  );
}
