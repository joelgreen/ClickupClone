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
    console.error("Failed to fetch notification preferences:", error);
    return NextResponse.json({ error: "Failed to fetch notification preferences" }, { status: 500 });
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
    if (body.taskAssigned !== undefined) data.taskAssigned = body.taskAssigned;
    if (body.taskCommented !== undefined) data.taskCommented = body.taskCommented;
    if (body.taskCompleted !== undefined) data.taskCompleted = body.taskCompleted;
    if (body.mention !== undefined) data.mention = body.mention;

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
    console.error("Failed to update notification preferences:", error);
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 });
  }
}
