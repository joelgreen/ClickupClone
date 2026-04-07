import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logActivity";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();

    if (!body.userId || !body.action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const event = await logActivity({
      taskId: id,
      projectId: task.projectId ?? undefined,
      userId: body.userId,
      action: body.action,
      metadata: body.metadata,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to log event:", error);
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }
}
