// src/app/api/event/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findFirst({ where: { clerkUserId: userId } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
    },
  });

  return NextResponse.json(updated);
}
