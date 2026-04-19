// src/app/dashboard/guests/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuestsClient from "@/components/guests/GuestsClient";

export default async function GuestsPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const event = await prisma.event.findFirst({
    where: { clerkUserId: userId },
    include: {
      guests: {
        include: { assignment: { include: { table: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) redirect("/");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Guests</h1>
        <p className="text-gray-500 text-sm mt-1">
          {event.guests.length} total · {event.guests.filter(g => g.rsvp === "ACCEPTED").length} accepted
        </p>
      </div>
      <GuestsClient initialGuests={event.guests as any} />
    </div>
  );
}
