import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const projectId = searchParams.get("projectId");

    const where: Record<string, string> = {};
    if (taskId) where.taskId = taskId;
    if (projectId) where.projectId = projectId;

    const events = await prisma.activityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch activity events:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity events" },
      { status: 500 }
    );
  }
}
