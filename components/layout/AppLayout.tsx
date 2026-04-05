"use client"

import Link from "next/link"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <div className="hidden md:flex flex-col w-64 border-r border-neutral-800 p-4 space-y-4">
        <h1 className="text-xl font-bold">Bible Athlete</h1>

        <Link href="/journey" className="hover:text-blue-400 transition-colors">
          Journey
        </Link>
        <Link href="/flashcards" className="hover:text-blue-400 transition-colors">
          Training
        </Link>
        <Link href="/review" className="hover:text-blue-400 transition-colors">
          Review
        </Link>
        <Link href="/programs" className="hover:text-blue-400 transition-colors">
          Programs
        </Link>
        <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
          Dashboard
        </Link>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden sticky top-0 z-40 border-b border-neutral-800 bg-[#020617]/95 backdrop-blur px-4 py-3">
          <div className="text-lg font-bold">Bible Athlete</div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
