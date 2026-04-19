"use client";

// src/components/guests/GuestsClient.tsx

import { useState, useTransition } from "react";
import type { Guest, GuestFormData, RsvpStatus } from "@/types";
import { RSVP_COLORS, RSVP_LABELS, MEAL_OPTIONS, GROUP_OPTIONS } from "@/lib/utils";

interface Props {
  initialGuests: Guest[];
}

const defaultForm: GuestFormData = {
  name: "", group: "Bride's side", meal: "Standard",
  rsvp: "PENDING", notes: "", plusOne: false, email: "", phone: "",
};

export default function GuestsClient({ initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [form, setForm] = useState<GuestFormData>(defaultForm);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = guests.filter(g => {
    const matchFilter = filter === "all" || g.rsvp === filter;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.group.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function addGuest() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const guest = await res.json();
        setGuests(prev => [...prev, guest]);
        setForm(defaultForm);
      } else {
        const data = await res.json();
        setError(data.error?.formErrors?.[0] || "Failed to add guest");
      }
    });
  }

  async function updateRsvp(id: string, rsvp: RsvpStatus) {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvp }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGuests(prev => prev.map(g => g.id === id ? updated : g));
    }
  }

  async function removeGuest(id: string) {
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (res.ok) setGuests(prev => prev.filter(g => g.id !== id));
  }

  return (
    <div>
      {/* Add guest form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
        <h2 className="font-medium text-gray-900 mb-4">Add guest</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Full name</label>
            <input
              type="text" placeholder="Jane Smith" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Group</label>
            <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              {GROUP_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Meal</label>
            <select value={form.meal} onChange={e => setForm(f => ({ ...f, meal: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              {MEAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">RSVP</label>
            <select value={form.rsvp} onChange={e => setForm(f => ({ ...f, rsvp: e.target.value as RsvpStatus }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              {Object.entries(RSVP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input type="email" placeholder="jane@email.com" value={form.email || ""}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Notes (allergies, accessibility)</label>
            <input type="text" placeholder="e.g. nut allergy, wheelchair access" value={form.notes || ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
        <button onClick={addGuest} disabled={isPending}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? "Adding..." : "Add guest"}
        </button>
      </div>

      {/* Filter + search */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input type="text" placeholder="Search guests..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        {["all", "ACCEPTED", "PENDING", "DECLINED", "MAYBE"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {f === "all" ? "All" : RSVP_LABELS[f]}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} guests</span>
      </div>

      {/* Guest table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No guests found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Name", "Group", "Meal", "RSVP", "Table", "Notes", ""].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{g.name}{g.plusOne && <span className="ml-1 text-xs text-gray-400">+1</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{g.group}</td>
                  <td className="px-4 py-3 text-gray-500">{g.meal}</td>
                  <td className="px-4 py-3">
                    <select value={g.rsvp} onChange={e => updateRsvp(g.id, e.target.value as RsvpStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 ${RSVP_COLORS[g.rsvp]}`}>
                      {Object.entries(RSVP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(g.assignment as any)?.table?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">{g.notes || ""}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeGuest(g.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
