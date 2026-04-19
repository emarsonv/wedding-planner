// src/app/api/tables/[id]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  seats: z.number().int().min(2).max(30).optional(),
  color: z.string().optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
});

async function verifyOwnership(tableId: string, userId: string) {
  return prisma.table.findFirst({
    where: { id: tableId, event: { clerkUserId: userId } },
    include: { assignments: true },
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const table = await verifyOwnership(params.id, userId);
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.table.update({
    where: { id: params.id },
    data: parsed.data,
    include: { assignments: { include: { guest: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const table = await verifyOwnership(params.id, userId);
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.table.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
