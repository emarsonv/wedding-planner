// src/app/dashboard/tables/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TablesClient from "@/components/tables/TablesClient";

export default async function TablesPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const event = await prisma.event.findFirst({
    where: { clerkUserId: userId },
    include: {
      guests: {
        include: { assignment: true },
        orderBy: { name: "asc" },
      },
      tables: {
        include: { assignments: { include: { guest: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) redirect("/");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Table layout</h1>
        <p className="text-gray-500 text-sm mt-1">
          {event.tables.length} tables · {event.tables.reduce((s, t) => s + t.seats, 0)} total seats
        </p>
      </div>
      <TablesClient initialTables={event.tables as any} initialGuests={event.guests as any} />
    </div>
  );
}
