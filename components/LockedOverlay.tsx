"use client"

type LockedOverlayProps = {
  title: string
  message: string
}

export default function LockedOverlay({
  title,
  message,
}: LockedOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl bg-gray-900 p-6 text-center">
        <div className="mb-2 text-3xl">🔒</div>

        <h2 className="mb-2 text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="mb-4 text-gray-300">
          {message}
        </p>

        <button
          onClick={() => {
            window.location.href = "/pricing"
          }}
          className="rounded bg-yellow-500 px-4 py-2 text-black"
        >
          Upgrade
        </button>
      </div>
    </div>
  )
}
