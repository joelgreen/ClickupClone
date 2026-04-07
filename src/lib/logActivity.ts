import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

interface LogActivityParams {
  taskId?: string;
  projectId?: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  return prisma.activityEvent.create({
    data: {
      taskId: params.taskId,
      projectId: params.projectId,
      userId: params.userId,
      action: params.action,
      metadata: (params.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });
}
