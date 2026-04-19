// src/app/dashboard/layout.tsx

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  if (!userId) redirect("/");

  // Ensure the user has an event — create a default one if not
  let event = await prisma.event.findFirst({ where: { clerkUserId: userId } });
  if (!event) {
    event = await prisma.event.create({
      data: { clerkUserId: userId, name: "My Wedding" },
    });
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-4 fixed h-full">
        <div className="mb-8">
          <span className="text-lg font-semibold text-gray-900">💍 Wedding</span>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{event.name}</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { href: "/dashboard", label: "Overview", icon: "📊" },
            { href: "/dashboard/guests", label: "Guests", icon: "👥" },
            { href: "/dashboard/tables", label: "Table layout", icon: "🪑" },
            { href: "/dashboard/rsvp", label: "RSVP tracker", icon: "📋" },
            { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-gray-400">Account</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
