"use client"

import React from "react"

type FlameState =
  | "idle"
  | "happy"
  | "super"
  | "sad"
  | "sleep"
  | "levelup"

export default function Flame({
  state = "idle",
  size = 64,
}: {
  state?: FlameState
  size?: number
}) {
  const flameMap: Record<FlameState, string> = {
    idle: "/flame/flame-idle.png",
    happy: "/flame/flame-happy.png",
    super: "/flame/flame-super.png",
    sad: "/flame/flame-sad.png",
    sleep: "/flame/flame-sleep.png",
    levelup: "/flame/flame-levelup.png",
  }

  return (
    <div className="flex justify-center items-center">
      <img
        src={flameMap[state]}
        alt="Flame"
        style={{ width: size, height: size }}
        className={`
          transition-all duration-300 ease-out

          ${state === "idle" ? "animate-float" : ""}
          ${state === "happy" ? "scale-110 animate-bounce-soft" : ""}
          ${state === "super" ? "scale-125 animate-pulse-glow" : ""}
          ${state === "sad" ? "translate-y-2 opacity-80" : ""}
          ${state === "sleep" ? "animate-float opacity-80" : ""}
          ${state === "levelup" ? "scale-125 animate-pop" : ""}
        `}
      />
    </div>
  )
}
