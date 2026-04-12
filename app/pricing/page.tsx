"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function PricingPage() {
  const [plan, setPlan] = useState("free")

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single()

      setPlan(data?.plan || "free")
    }

    run()
  }, [])

  const Card = ({ title, features, highlight, current }: any) => (
    <div
      style={{
        border: highlight ? "2px solid gold" : "1px solid #333",
        borderRadius: 12,
        padding: 20,
        flex: 1,
        background: "#0a0a0a",
        color: "#ffffff",
      }}
    >
      <h2 style={{ color: "#ffffff" }}>{title}</h2>

      <ul style={{ marginTop: 10, color: "#ffffff" }}>
        {features.map((f: string, i: number) => (
          <li key={i} style={{ marginBottom: 6, color: "#ffffff" }}>
            {f}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        {current ? (
          <div style={{ color: "#ffffff" }}>Current Plan</div>
        ) : (
          <a
            href="/upgrade"
            style={{
              display: "block",
              padding: 12,
              background: "gold",
              color: "black",
              textAlign: "center",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            Upgrade
          </a>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 20, color: "#ffffff" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30, color: "#ffffff" }}>
        Choose Your Plan
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Card
          title="Free"
          current={plan === "free"}
          features={[
            "2 questions per node",
            "Easy difficulty only",
            "Limited XP",
          ]}
        />

        <Card
          title="Pro"
          current={plan === "pro" || plan === "family_pro"}
          features={[
            "7 questions per node",
            "Easy + Medium",
            "Flashcards",
            "Full journey",
            "Family leaderboard",
          ]}
        />

        <Card
          title="Pro+ 🚀"
          highlight
          current={plan === "pro_plus" || plan === "family_pro_plus"}
          features={[
            "15 questions per node",
            "All difficulties",
            "Flashcards",
            "Quests",
            "Scholar Mode",
            "Advanced training",
            "Global leaderboard (coming soon)",
            "Family leaderboard",
          ]}
        />
      </div>
    </div>
  )
}
