"use client"

import Paywall from "@/components/Paywall"

export default function UpgradePage() {
  return (
    <Paywall
      onSelectPlan={async (plan: string) => {
        console.log("PLAN CLICKED:", plan)

        try {
          const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ plan }),
          })

          console.log("RESPONSE STATUS:", res.status)

          const data = await res.json()
          console.log("RESPONSE DATA:", data)

          if (data.url) {
            window.location.href = data.url
          } else {
            console.error("NO URL RETURNED")
          }
        } catch (err) {
          console.error("CHECKOUT ERROR:", err)
        }
      }}
    />
  )
}
