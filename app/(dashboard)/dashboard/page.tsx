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
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <button
        onClick={() => router.push(`/mission?day=${currentDay}`)}
        style={{
          padding: "16px 24px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 8,
          fontSize: 18,
          marginTop: 20,
        }}
      >
        Start Daily Training
      </button>
    </div>
  )
}
