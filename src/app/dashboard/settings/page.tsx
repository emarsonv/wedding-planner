// src/app/dashboard/settings/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/SettingsClient";

export default async function SettingsPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  const event = await prisma.event.findFirst({ where: { clerkUserId: userId } });
  if (!event) redirect("/");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Update your wedding details</p>
      </div>
      <SettingsClient event={event as any} />
    </div>
  );
}
