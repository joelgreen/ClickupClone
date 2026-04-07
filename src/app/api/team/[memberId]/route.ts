import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;

    // Check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find requesting user's team membership
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const currentMember = await prisma.teamMember.findFirst({
      where: { userId: currentUser.id },
    });

    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
      return NextResponse.json(
        { error: "Only owners and admins can remove team members" },
        { status: 403 }
      );
    }

    // Find the member to delete
    const memberToDelete = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToDelete) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    // Don't allow removing the owner
    if (memberToDelete.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the team owner" },
        { status: 403 }
      );
    }

    await prisma.teamMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
