// src/app/dashboard/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeStats, RSVP_LABELS } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const event = await prisma.event.findFirst({
    where: { clerkUserId: userId },
    include: {
      guests: { include: { assignment: true } },
      tables: { include: { assignments: true } },
    },
  });

  if (!event) redirect("/");

  const stats = computeStats(event.guests as any, event.tables as any);
  const responseRate = stats.totalGuests
    ? Math.round(((stats.accepted + stats.declined + stats.maybe) / stats.totalGuests) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
        {event.date && (
          <p className="text-gray-500 mt-1">
            {new Date(event.date).toLocaleDateString("en-AU", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total guests", value: stats.totalGuests, sub: `${responseRate}% responded` },
          { label: "Accepted", value: stats.accepted, sub: `${stats.totalGuests ? Math.round(stats.accepted/stats.totalGuests*100) : 0}% of invited` },
          { label: "Pending", value: stats.pending, sub: "awaiting response" },
          { label: "Seated", value: stats.seated, sub: `of ${stats.accepted} accepted` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/dashboard/guests", title: "Manage guests", desc: "Add, edit, and update RSVPs", icon: "👥" },
          { href: "/dashboard/tables", title: "Table layout", desc: "Arrange seating and assign guests", icon: "🪑" },
          { href: "/dashboard/rsvp", title: "RSVP tracker", desc: "Meal counts and group balance", icon: "📋" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className="font-medium text-gray-900 group-hover:text-gray-700">{card.title}</p>
            <p className="text-sm text-gray-400 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
