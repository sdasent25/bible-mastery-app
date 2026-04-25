"use client"

type GameHeaderProps = {
  reference?: string
  progress: number
  total: number
  sessionXp: number
  totalXp: number
}

export default function GameHeader({
  reference,
  progress,
  total,
  sessionXp,
  totalXp,
}: GameHeaderProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {reference && (
        <div className="rounded-xl bg-gray-800 p-4">
          <div className="text-xs text-gray-400">REFERENCE</div>
          <div className="font-semibold text-white">{reference}</div>
        </div>
      )}

      <div className="rounded-xl bg-gray-800 p-4">
        <div className="text-xs text-gray-400">PROGRESS</div>
        <div className="font-semibold text-white">
          {progress} / {total}
        </div>
      </div>

      <div className="rounded-xl bg-gray-800 p-4">
        <div className="text-xs text-gray-400">SESSION XP</div>
        <div className="font-semibold text-green-400">
          +{sessionXp}
        </div>
      </div>

      <div className="rounded-xl bg-gray-800 p-4">
        <div className="text-xs text-gray-400">XP TOTAL</div>
        <div className="font-semibold text-yellow-400">
          {totalXp}
        </div>
      </div>
    </div>
  )
}
