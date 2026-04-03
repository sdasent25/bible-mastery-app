"use client"

import React, { useEffect, useState } from "react"

export default function XpPop({ value = 10 }: { value?: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute text-green-400 font-bold text-lg animate-xp-pop">
      +{value} XP
    </div>
  )
}
