import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    let prefs = await prisma.notificationPrefs.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPrefs.create({
        data: { userId },
      });
    }

    return NextResponse.json({
      taskAssigned: prefs.taskAssigned,
      taskCommented: prefs.taskCommented,
      taskCompleted: prefs.taskCompleted,
      mention: prefs.mention,
    });
  } catch (error) {
    console.error("Failed to fetch notification prefs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const data: Record<string, boolean> = {};
    if (typeof body.taskAssigned === "boolean")
      data.taskAssigned = body.taskAssigned;
    if (typeof body.taskCommented === "boolean")
      data.taskCommented = body.taskCommented;
    if (typeof body.taskCompleted === "boolean")
      data.taskCompleted = body.taskCompleted;
    if (typeof body.mention === "boolean") data.mention = body.mention;

    const prefs = await prisma.notificationPrefs.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return NextResponse.json({
      taskAssigned: prefs.taskAssigned,
      taskCommented: prefs.taskCommented,
      taskCompleted: prefs.taskCompleted,
      mention: prefs.mention,
    });
  } catch (error) {
    console.error("Failed to update notification prefs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
