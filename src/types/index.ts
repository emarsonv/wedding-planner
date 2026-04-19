// src/types/index.ts

export type RsvpStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  group: string;
  meal: string;
  rsvp: RsvpStatus;
  notes?: string | null;
  plusOne: boolean;
  email?: string | null;
  phone?: string | null;
  createdAt: Date;
  assignment?: Assignment | null;
}

export interface Table {
  id: string;
  eventId: string;
  name: string;
  seats: number;
  color: string;
  posX: number;
  posY: number;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  guestId: string;
  tableId: string;
  guest?: Guest;
  table?: Table;
}

export interface Event {
  id: string;
  clerkUserId: string;
  name: string;
  date?: Date | null;
  venue?: string | null;
  guests: Guest[];
  tables: Table[];
}

export interface GuestFormData {
  name: string;
  group: string;
  meal: string;
  rsvp: RsvpStatus;
  notes?: string;
  plusOne?: boolean;
  email?: string;
  phone?: string;
}

export interface TableFormData {
  name: string;
  seats: number;
  color?: string;
}

export interface DashboardStats {
  totalGuests: number;
  accepted: number;
  pending: number;
  declined: number;
  maybe: number;
  seated: number;
  totalSeats: number;
}
