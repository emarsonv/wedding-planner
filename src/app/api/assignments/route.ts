// src/app/api/assignments/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AssignSchema = z.object({
  guestId: z.string(),
  tableId: z.string(),
});

const UnassignSchema = z.object({
  guestId: z.string(),
});

async function verifyEventOwnership(userId: string, guestId: string, tableId?: string) {
  const guest = await prisma.guest.findFirst({
    where: { id: guestId, event: { clerkUserId: userId } },
  });
  if (!guest) return null;

  if (tableId) {
    const table = await prisma.table.findFirst({
      where: { id: tableId, event: { clerkUserId: userId } },
      include: { assignments: true },
    });
    return table ? { guest, table } : null;
  }
  return { guest };
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = AssignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { guestId, tableId } = parsed.data;
  const ownership = await verifyEventOwnership(userId, guestId, tableId);
  if (!ownership || !ownership.table) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { guest, table } = ownership as any;

  // Check guest RSVP status
  if (guest.rsvp !== "ACCEPTED") {
    return NextResponse.json({ error: "Only accepted guests can be assigned to tables" }, { status: 400 });
  }

  // Check seat availability
  if (table.assignments.length >= table.seats) {
    return NextResponse.json({ error: `${table.name} is full` }, { status: 400 });
  }

  // Upsert: replace existing assignment if any
  const assignment = await prisma.assignment.upsert({
    where: { guestId },
    create: { guestId, tableId },
    update: { tableId },
    include: { table: true, guest: true },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = UnassignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ownership = await verifyEventOwnership(userId, parsed.data.guestId);
  if (!ownership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.assignment.deleteMany({ where: { guestId: parsed.data.guestId } });
  return NextResponse.json({ success: true });
}
