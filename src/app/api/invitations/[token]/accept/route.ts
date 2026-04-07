import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Require session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to accept an invitation" },
        { status: 401 }
      );
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "This invitation has already been used" },
        { status: 410 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Soft check: warn if email doesn't match
    if (session.user.email && session.user.email !== invitation.email) {
      console.warn(
        `User ${session.user.email} is accepting invitation meant for ${invitation.email}`
      );
    }

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { token },
      data: { acceptedAt: new Date() },
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
