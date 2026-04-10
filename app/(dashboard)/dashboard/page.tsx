"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [currentDay, setCurrentDay] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_progress")
        .select("current_day")
        .eq("user_id", user.id)
        .single()

      if (data?.current_day) {
        setCurrentDay(data.current_day)
      }
    }

    load()
  }, [])

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <button
          onClick={() => router.push(`/mission?day=${currentDay}`)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-lg font-semibold transition"
        >
          Start Daily Training
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-400">Level</p>
            <p className="text-lg font-semibold text-white">1</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Streak</p>
            <p className="text-lg font-semibold text-white">🔥 0</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-2">Daily Progress</p>

          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[30%]" />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Continue your daily journey
          </p>
        </div>
      </div>
    </div>
  )
}
