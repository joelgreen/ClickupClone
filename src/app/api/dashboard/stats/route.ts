import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalTasks,
      completedToday,
      overdueTasks,
      statusGroups,
      priorityGroups,
      recentActivity,
      activeCreators,
      activeAssignees,
    ] = await Promise.all([
      prisma.task.count(),

      prisma.task.count({
        where: {
          status: "done",
          updatedAt: { gte: startOfToday },
        },
      }),

      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: "done" },
        },
      }),

      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      prisma.task.groupBy({
        by: ["priority"],
        _count: { priority: true },
      }),

      prisma.activityEvent.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          task: { select: { id: true, title: true } },
        },
      }),

      // Active members: users who created tasks in last 7 days
      prisma.task.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { assigneeId: true },
        distinct: ["assigneeId"],
      }),

      // Also count users who updated tasks recently
      prisma.activityEvent.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);

    // Merge unique active member IDs
    const activeMemberIds = new Set<string>();
    for (const t of activeCreators) {
      if (t.assigneeId) activeMemberIds.add(t.assigneeId);
    }
    for (const a of activeAssignees) {
      if (a.userId) activeMemberIds.add(a.userId);
    }

    const tasksByStatus: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    };
    for (const g of statusGroups) {
      tasksByStatus[g.status] = g._count.status;
    }

    const tasksByPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    for (const g of priorityGroups) {
      tasksByPriority[g.priority] = g._count.priority;
    }

    const completionRate =
      totalTasks > 0 ? Math.round((tasksByStatus.done / totalTasks) * 100) : 0;

    return NextResponse.json({
      totalTasks,
      completedToday,
      overdueTasks,
      activeMembers: activeMemberIds.size,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt,
        taskId: a.task?.id ?? null,
        taskTitle: a.task?.title ?? null,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
