"use client"

import Sidebar from "@/components/layout/Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
