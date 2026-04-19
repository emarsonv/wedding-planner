"use client";

// src/components/tables/TablesClient.tsx

import { useState, useTransition } from "react";
import type { Guest, Table } from "@/types";
import { TABLE_COLORS } from "@/lib/utils";

interface Props {
  initialTables: Table[];
  initialGuests: Guest[];
}

export default function TablesClient({ initialTables, initialGuests }: Props) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableSeats, setTableSeats] = useState(8);
  const [assignGuestId, setAssignGuestId] = useState("");
  const [assignTableId, setAssignTableId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const acceptedUnassigned = guests.filter(g => g.rsvp === "ACCEPTED" && !(g.assignment));

  // Canvas positions — distribute tables in a grid
  const getPosition = (index: number) => {
    const cols = 4;
    const col = index % cols;
    const row = Math.floor(index / cols);
    return { x: 60 + col * 160, y: 60 + row * 150 };
  };

  async function addTable() {
    if (!tableName.trim()) { setError("Table name is required"); return; }
    setError(null);
    const pos = getPosition(tables.length);
    startTransition(async () => {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tableName, seats: tableSeats, posX: pos.x, posY: pos.y }),
      });
      if (res.ok) {
        const table = await res.json();
        setTables(prev => [...prev, table]);
        setTableName("");
        setTableSeats(8);
      } else {
        setError("Failed to add table");
      }
    });
  }

  async function removeTable(id: string) {
    const res = await fetch(`/api/tables/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTables(prev => prev.filter(t => t.id !== id));
      setGuests(prev => prev.map(g => (g.assignment as any)?.tableId === id ? { ...g, assignment: null } : g));
      if (selectedTableId === id) setSelectedTableId(null);
    }
  }

  async function assignGuest() {
    if (!assignGuestId || !assignTableId) return;
    setError(null);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: assignGuestId, tableId: assignTableId }),
    });
    if (res.ok) {
      const assignment = await res.json();
      // Update guest assignment locally
      setGuests(prev => prev.map(g => g.id === assignGuestId ? { ...g, assignment } : g));
      // Update table assignments locally
      setTables(prev => prev.map(t => {
        if (t.id === assignTableId) {
          const existing = (t.assignments as any[]).filter((a: any) => a.guestId !== assignGuestId);
          return { ...t, assignments: [...existing, assignment] };
        }
        // Remove from old table if reassigned
        return { ...t, assignments: (t.assignments as any[]).filter((a: any) => a.guestId !== assignGuestId) };
      }));
      setAssignGuestId("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to assign guest");
    }
  }

  async function unassignGuest(guestId: string) {
    const res = await fetch("/api/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId }),
    });
    if (res.ok) {
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, assignment: null } : g));
      setTables(prev => prev.map(t => ({
        ...t,
        assignments: (t.assignments as any[]).filter((a: any) => a.guestId !== guestId),
      })));
    }
  }

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Add table */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-3">Add table</h2>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input value={tableName} onChange={e => setTableName(e.target.value)}
                placeholder="Table 1" onKeyDown={e => e.key === "Enter" && addTable()}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="w-20">
              <label className="block text-xs text-gray-500 mb-1">Seats</label>
              <input type="number" value={tableSeats} min={2} max={30}
                onChange={e => setTableSeats(parseInt(e.target.value) || 8)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <button onClick={addTable} disabled={isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Assign guest */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-3">Assign guest to table</h2>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Accepted guest</label>
              <select value={assignGuestId} onChange={e => setAssignGuestId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="">Select guest...</option>
                {acceptedUnassigned.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Table</label>
              <select value={assignTableId} onChange={e => setAssignTableId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="">Select table...</option>
                {tables.map(t => {
                  const assigned = (t.assignments as any[]).length;
                  return <option key={t.id} value={t.id}>{t.name} ({t.seats - assigned} free)</option>;
                })}
              </select>
            </div>
            <button onClick={assignGuest}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              Assign
            </button>
          </div>
        </div>
      </div>

      {/* Floor plan canvas */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl relative mb-4 overflow-hidden"
        style={{ height: Math.max(420, Math.ceil(tables.length / 4) * 150 + 80) }}>
        <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-gray-400 uppercase tracking-widest">Venue floor plan</span>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-14 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">Dance floor</span>
        </div>

        {tables.map((t, i) => {
          const pos = getPosition(i);
          const assigned = (t.assignments as any[]).length;
          const full = assigned >= t.seats;
          const isSelected = selectedTableId === t.id;
          return (
            <div key={t.id} className="absolute cursor-pointer select-none"
              style={{ left: pos.x, top: pos.y }}
              onClick={() => setSelectedTableId(isSelected ? null : t.id)}>
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all"
                style={{
                  background: t.color + "30",
                  border: `2px solid ${isSelected ? "#1a56db" : t.color}`,
                  boxShadow: isSelected ? `0 0 0 3px ${t.color}40` : "none",
                }}>
                <span className="text-xs font-medium text-gray-900 text-center leading-tight px-1">{t.name}</span>
                <span className="text-xs text-gray-500">{assigned}/{t.seats}</span>
              </div>
              {full && <div className="text-center text-xs text-red-500 mt-1">Full</div>}
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Add your first table above to get started
          </div>
        )}
      </div>

      {/* Selected table detail */}
      {selectedTable && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-medium text-gray-900">{selectedTable.name}</h2>
              <p className="text-sm text-gray-400">
                {(selectedTable.assignments as any[]).length} / {selectedTable.seats} seats filled
              </p>
            </div>
            <button onClick={() => removeTable(selectedTable.id)}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
              Remove table
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(selectedTable.assignments as any[]).length === 0 ? (
              <p className="text-sm text-gray-400">No guests assigned yet</p>
            ) : (
              (selectedTable.assignments as any[]).map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 text-sm">
                  <span className="text-gray-900">{a.guest?.name}</span>
                  {a.guest?.meal && a.guest.meal !== "Standard" && (
                    <span className="text-gray-400 text-xs">({a.guest.meal})</span>
                  )}
                  <button onClick={() => unassignGuest(a.guestId)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none">×</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
