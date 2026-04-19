"use client";

// src/components/SettingsClient.tsx

import { useState, useTransition } from "react";
import type { Event } from "@/types";

export default function SettingsClient({ event }: { event: Event }) {
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(
    event.date ? new Date(event.date).toISOString().split("T")[0] : ""
  );
  const [venue, setVenue] = useState(event.venue || "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await fetch(`/api/event`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date: date || null, venue: venue || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Wedding name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Wedding date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Venue</label>
          <input value={venue} onChange={e => setVenue(e.target.value)}
            placeholder="e.g. The Grand Ballroom, Melbourne"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button onClick={save} disabled={isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {isPending ? "Saving..." : "Save changes"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
