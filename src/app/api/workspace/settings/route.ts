import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const DEFAULT_WORKSPACE_ID = "default";
const DEFAULT_SETTINGS = {
  workspaceName: "My Workspace",
  defaultPriority: "medium",
  defaultTaskType: "task",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.workspaceSettings.findUnique({
      where: { workspaceId: DEFAULT_WORKSPACE_ID },
    });

    if (!settings) {
      settings = await prisma.workspaceSettings.create({
        data: {
          workspaceId: DEFAULT_WORKSPACE_ID,
          data: DEFAULT_SETTINGS,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch workspace settings:", error);
    return NextResponse.json({ error: "Failed to fetch workspace settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { id?: string }).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    let existing = await prisma.workspaceSettings.findUnique({
      where: { workspaceId: DEFAULT_WORKSPACE_ID },
    });

    if (!existing) {
      existing = await prisma.workspaceSettings.create({
        data: {
          workspaceId: DEFAULT_WORKSPACE_ID,
          data: DEFAULT_SETTINGS,
        },
      });
    }

    const currentData = existing.data as Record<string, unknown>;
    const mergedData = { ...currentData, ...body };

    const settings = await prisma.workspaceSettings.update({
      where: { workspaceId: DEFAULT_WORKSPACE_ID },
      data: { data: mergedData },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update workspace settings:", error);
    return NextResponse.json({ error: "Failed to update workspace settings" }, { status: 500 });
  }
}
