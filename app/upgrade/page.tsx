"use client"

import Paywall from "@/components/Paywall"

export default function UpgradePage() {
  return (
    <Paywall
      onSelectPlan={(plan: string) => {
        fetch("/api/stripe/checkout", {
          method: "POST",
          body: JSON.stringify({ plan }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              window.location.href = data.url
            }
          })
      }}
    />
  )
}
