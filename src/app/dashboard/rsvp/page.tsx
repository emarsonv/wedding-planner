// src/app/dashboard/rsvp/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeStats, getMealCounts, RSVP_LABELS } from "@/lib/utils";

export default async function RsvpPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const event = await prisma.event.findFirst({
    where: { clerkUserId: userId },
    include: {
      guests: { include: { assignment: true } },
      tables: true,
    },
  });

  if (!event) redirect("/");

  const stats = computeStats(event.guests as any, event.tables as any);
  const mealCounts = getMealCounts(event.guests as any);
  const unassigned = event.guests.filter(g => g.rsvp === "ACCEPTED" && !g.assignment);

  const rsvpRows = [
    { key: "ACCEPTED", color: "bg-green-500", label: "Accepted", value: stats.accepted },
    { key: "PENDING", color: "bg-amber-400", label: "Pending", value: stats.pending },
    { key: "DECLINED", color: "bg-red-400", label: "Declined", value: stats.declined },
    { key: "MAYBE", color: "bg-blue-400", label: "Maybe", value: stats.maybe },
  ];

  const groups: Record<string, number> = {};
  event.guests.filter(g => g.rsvp === "ACCEPTED").forEach(g => {
    groups[g.group] = (groups[g.group] || 0) + 1;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">RSVP tracker</h1>
        <p className="text-gray-500 text-sm mt-1">
          {stats.totalGuests > 0
            ? `${Math.round(((stats.accepted + stats.declined + stats.maybe) / stats.totalGuests) * 100)}% response rate`
            : "No guests yet"}
        </p>
      </div>

      {/* RSVP breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
        <h2 className="font-medium text-gray-900 mb-4">Response breakdown</h2>
        <div className="space-y-3">
          {rsvpRows.map(r => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-500">{r.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${r.color} transition-all`}
                  style={{ width: stats.totalGuests ? `${Math.round(r.value / stats.totalGuests * 100)}%` : "0%" }} />
              </div>
              <span className="text-sm font-medium text-gray-900 w-6 text-right">{r.value}</span>
              <span className="text-xs text-gray-400 w-8">
                {stats.totalGuests ? Math.round(r.value / stats.totalGuests * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Meal breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-4">Meal counts</h2>
          {Object.keys(mealCounts).length === 0 ? (
            <p className="text-sm text-gray-400">No accepted guests yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {Object.entries(mealCounts).sort((a, b) => b[1] - a[1]).map(([meal, count]) => (
                <div key={meal} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">{meal}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unassigned guests */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-4">
            Unassigned <span className="text-gray-400 font-normal">({unassigned.length})</span>
          </h2>
          {unassigned.length === 0 ? (
            <p className="text-sm text-green-600 font-medium">All accepted guests are seated!</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {unassigned.map(g => (
                <div key={g.id} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-900">{g.name}</span>
                  <span className="text-gray-400">{g.meal !== "Standard" ? g.meal : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-4">Group balance</h2>
          {Object.keys(groups).length === 0 ? (
            <p className="text-sm text-gray-400">No accepted guests yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(groups).map(([group, count]) => (
                <div key={group} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 truncate">{group}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400"
                      style={{ width: stats.accepted ? `${Math.round(count / stats.accepted * 100)}%` : "0%" }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
