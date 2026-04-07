import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logActivity";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        project: true,
        subtasks: true,
        parent: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId;
    if (body.projectId !== undefined) data.projectId = body.projectId;
    if (body.parentTaskId !== undefined) data.parentTaskId = body.parentTaskId;
    if (body.dueDate !== undefined)
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.order !== undefined) data.order = body.order;

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: true,
        project: true,
        subtasks: true,
      },
    });

    // Auto-log activity events
    try {
      const userId = (body.userId as string) || "system";
      if (body.status !== undefined && body.status !== existing.status) {
        await logActivity({
          taskId: id,
          projectId: task.projectId ?? undefined,
          userId,
          action: "task.status_changed",
          metadata: { from: existing.status, to: body.status },
        });
      } else if (body.assigneeId !== undefined && body.assigneeId !== existing.assigneeId) {
        await logActivity({
          taskId: id,
          projectId: task.projectId ?? undefined,
          userId,
          action: "task.assigned",
          metadata: { assignedTo: body.assigneeId },
        });
      } else {
        const changedFields = Object.keys(data).filter(
          (key) => data[key] !== (existing as Record<string, unknown>)[key]
        );
        if (changedFields.length > 0) {
          await logActivity({
            taskId: id,
            projectId: task.projectId ?? undefined,
            userId,
            action: "task.updated",
            metadata: { fields: changedFields },
          });
        }
      }
    } catch (logError) {
      console.error("Failed to log activity for task PATCH:", logError);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
