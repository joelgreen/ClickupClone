import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const projectId = searchParams.get("projectId");

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required and must be at least 2 characters." },
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          projectId ? { projectId } : {},
          {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      include: { project: { select: { id: true, name: true } } },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const comments = await prisma.comment.findMany({
      where: { body: { contains: q, mode: "insensitive" } },
      include: { task: { select: { id: true, title: true } } },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks, comments });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
