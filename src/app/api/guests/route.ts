// src/app/api/guests/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  group: z.string().default("Other"),
  meal: z.string().default("Standard"),
  rsvp: z.enum(["PENDING", "ACCEPTED", "DECLINED", "MAYBE"]).default("PENDING"),
  notes: z.string().optional(),
  plusOne: z.boolean().default(false),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

async function getEvent(userId: string) {
  return prisma.event.findFirst({ where: { clerkUserId: userId } });
}

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await getEvent(userId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    include: { assignment: { include: { table: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await getEvent(userId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await request.json();
  const parsed = GuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const guest = await prisma.guest.create({
    data: { ...parsed.data, eventId: event.id },
    include: { assignment: true },
  });

  return NextResponse.json(guest, { status: 201 });
}
