"use client"

import { motion } from "framer-motion"

export default function GameCard({
  title,
  desc,
  onClick,
  variant = "default",
}: {
  title: string
  desc: string
  onClick: () => void
  variant?: "primary" | "default"
}) {
  const base =
    "relative overflow-hidden cursor-pointer rounded-2xl p-5 text-white shadow-lg"

  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-2xl",
    default:
      "bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10",
  }

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 250 }}
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
    >
      <div className="absolute inset-0 bg-white/10 blur-2xl opacity-20" />

      <div className="relative z-10">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm opacity-80 mt-1">{desc}</p>
      </div>
    </motion.div>
  )
}
