// src/app/api/tables/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TABLE_COLORS } from "@/lib/utils";

const TableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  seats: z.number().int().min(2).max(30).default(8),
  color: z.string().optional(),
  posX: z.number().default(100),
  posY: z.number().default(100),
});

async function getEvent(userId: string) {
  return prisma.event.findFirst({ where: { clerkUserId: userId } });
}

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await getEvent(userId);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tables = await prisma.table.findMany({
    where: { eventId: event.id },
    include: { assignments: { include: { guest: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(tables);
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await getEvent(userId);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = TableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Pick a color if not provided
  const existingCount = await prisma.table.count({ where: { eventId: event.id } });
  const color = parsed.data.color || TABLE_COLORS[existingCount % TABLE_COLORS.length];

  const table = await prisma.table.create({
    data: { ...parsed.data, color, eventId: event.id },
    include: { assignments: true },
  });

  return NextResponse.json(table, { status: 201 });
}
