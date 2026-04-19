// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Guest, DashboardStats, Table } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeStats(guests: Guest[], tables: Table[]): DashboardStats {
  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
  const seated = guests.filter((g) => g.assignment !== null && g.assignment !== undefined).length;

  return {
    totalGuests: guests.length,
    accepted: guests.filter((g) => g.rsvp === "ACCEPTED").length,
    pending: guests.filter((g) => g.rsvp === "PENDING").length,
    declined: guests.filter((g) => g.rsvp === "DECLINED").length,
    maybe: guests.filter((g) => g.rsvp === "MAYBE").length,
    seated,
    totalSeats,
  };
}

export function getMealCounts(guests: Guest[]): Record<string, number> {
  return guests
    .filter((g) => g.rsvp === "ACCEPTED")
    .reduce((acc, g) => {
      acc[g.meal] = (acc[g.meal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
}

export const TABLE_COLORS = [
  "#B5D4F4", "#9FE1CB", "#F4C0D1", "#FAC775",
  "#C0DD97", "#F5C4B3", "#CECBF6", "#85B7EB",
];

export const RSVP_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  MAYBE: "Maybe",
};

export const RSVP_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-800",
  MAYBE: "bg-blue-100 text-blue-800",
};

export const MEAL_OPTIONS = [
  "Standard", "Vegetarian", "Vegan",
  "Gluten-free", "Halal", "Kosher",
];

export const GROUP_OPTIONS = [
  "Bride's side", "Groom's side", "Both", "Other",
];
