"use client"

import React, { useEffect, useState } from "react"

export default function XpPop({ value = 10 }: { value?: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute text-green-400 font-bold text-3xl animate-xp-pop drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">
      +{value} XP
    </div>
  )
}
