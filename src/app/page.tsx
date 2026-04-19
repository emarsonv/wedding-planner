// src/app/page.tsx

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4">
      <div className="max-w-xl w-full text-center">
        <div className="mb-6 text-5xl">💍</div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-3">Wedding Planner</h1>
        <p className="text-gray-500 text-lg mb-8">
          Guest management, table layout, and RSVP tracking — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                Get started
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Go to dashboard →
            </Link>
          </SignedIn>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          {[
            { icon: "👥", title: "Guest list", desc: "Track RSVPs, meal preferences, and dietary notes" },
            { icon: "🪑", title: "Table layout", desc: "Drag-and-drop floor plan with visual seat tracking" },
            { icon: "📊", title: "RSVP analytics", desc: "Live breakdown of responses, meals, and group balance" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-medium text-gray-900 text-sm mb-1">{f.title}</div>
              <div className="text-gray-500 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
