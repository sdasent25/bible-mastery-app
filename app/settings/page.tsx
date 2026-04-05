"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import LanguageToggle from "@/components/LanguageToggle"

export default function SettingsPage() {
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("Free")
  const [sound, setSound] = useState(true)
  const [notifications, setNotifications] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userRes } = await supabase.auth.getUser()

      if (userRes?.user) {
        setEmail(userRes.user.email || "")

        const { data } = await supabase
          .from("profiles")
          .select("plan_type")
          .eq("id", userRes.user.id)
          .single()

        if (data?.plan_type) {
          setPlan(data.plan_type)
        }
      }

      const savedSound = localStorage.getItem("sound") !== "off"
      setSound(savedSound)

      const savedNotifications = localStorage.getItem("notifications") === "on"
      setNotifications(savedNotifications)
    }

    load()
  }, [])

  function toggleSound() {
    const newValue = !sound
    setSound(newValue)
    localStorage.setItem("sound", newValue ? "on" : "off")
  }

  function toggleNotifications() {
    const newValue = !notifications
    setNotifications(newValue)
    localStorage.setItem("notifications", newValue ? "on" : "off")
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white text-center">
        Settings
      </h1>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-2">
        <p className="text-sm text-white/60">Account</p>
        <p className="text-white font-medium">{email}</p>
        <p className="text-white/80 text-sm">Plan: {plan}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 flex items-center justify-between">
        <span className="text-white">Sound</span>
        <button
          onClick={toggleSound}
          className={`px-4 py-2 rounded-xl ${
            sound ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          {sound ? "On" : "Off"}
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <span className="text-white">Language</span>
        <LanguageToggle />
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 flex items-center justify-between">
        <span className="text-white">Daily Reminder</span>
        <button
          onClick={toggleNotifications}
          className={`px-4 py-2 rounded-xl ${
            notifications ? "bg-blue-600" : "bg-neutral-700"
          }`}
        >
          {notifications ? "On" : "Off"}
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-3">
        <p className="text-white font-medium">Subscription</p>

        <button className="w-full bg-blue-600 py-3 rounded-xl font-semibold">
          Manage Plan
        </button>
      </div>
    </div>
  )
}
