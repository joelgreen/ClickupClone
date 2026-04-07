import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logActivity";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const labelId = searchParams.get("labelId");
    const overdue = searchParams.get("overdue");
    const dueBefore = searchParams.get("dueBefore");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;

    if (labelId) {
      where.labels = {
        some: { labelId },
      };
    }

    if (overdue === "true") {
      where.dueDate = { lt: new Date() };
      where.status = { not: "done" };
    } else if (dueBefore) {
      where.dueDate = { lte: new Date(dueBefore) };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
        subtasks: true,
        labels: { include: { label: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const tasksWithLabels = tasks.map((task) => ({
      ...task,
      labels: task.labels.map((tl) => ({
        id: tl.label.id,
        name: tl.label.name,
        color: tl.label.color,
      })),
    }));

    return NextResponse.json(tasksWithLabels);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId,
        projectId: body.projectId,
        parentTaskId: body.parentTaskId,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        order: body.order,
      },
      include: {
        assignee: true,
        project: true,
        subtasks: true,
        labels: { include: { label: true } },
      },
    });

    // Auto-log activity event
    try {
      await logActivity({
        taskId: task.id,
        projectId: task.projectId ?? undefined,
        userId: body.userId || "system",
        action: "task.created",
        metadata: { title: task.title, status: task.status, projectId: task.projectId },
      });
    } catch (logError) {
      console.error("Failed to log activity for task creation:", logError);
    }

    const taskWithLabels = {
      ...task,
      labels: task.labels.map((tl) => ({
        id: tl.label.id,
        name: tl.label.name,
        color: tl.label.color,
      })),
    };

    return NextResponse.json(taskWithLabels, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
