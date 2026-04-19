// src/app/api/guests/[id]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  group: z.string().optional(),
  meal: z.string().optional(),
  rsvp: z.enum(["PENDING", "ACCEPTED", "DECLINED", "MAYBE"]).optional(),
  notes: z.string().optional(),
  plusOne: z.boolean().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

async function verifyOwnership(guestId: string, userId: string) {
  const guest = await prisma.guest.findFirst({
    where: { id: guestId, event: { clerkUserId: userId } },
  });
  return guest;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guest = await verifyOwnership(params.id, userId);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // If declined, remove assignment
  if (parsed.data.rsvp === "DECLINED") {
    await prisma.assignment.deleteMany({ where: { guestId: params.id } });
  }

  const updated = await prisma.guest.update({
    where: { id: params.id },
    data: parsed.data,
    include: { assignment: { include: { table: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guest = await verifyOwnership(params.id, userId);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.guest.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
