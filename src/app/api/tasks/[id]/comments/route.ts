import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        body: true,
        createdAt: true,
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();

    if (!body.body || typeof body.body !== "string" || !body.body.trim()) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        userId: body.userId || "anonymous",
        body: body.body.trim(),
      },
      select: {
        id: true,
        userId: true,
        body: true,
        createdAt: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
