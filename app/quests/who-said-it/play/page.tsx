"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WhoSaidItPlay() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/quests/who-said-it")
  }, [router])

  return (
    <div className="p-6 text-white">
      Redirecting...
    </div>
  )
}
