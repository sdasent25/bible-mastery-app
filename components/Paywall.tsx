"use client"

type PaywallProps = {
  onSelectPlan: (plan: "pro" | "pro_plus") => void
}

export default function Paywall({ onSelectPlan }: PaywallProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs font-semibold tracking-wide uppercase mb-4">
          Upgrade
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-3">
          Unlock Your Full Bible Journey
        </h1>

        <p className="text-white/85 mb-8">
          Go beyond Genesis. Train, progress, and master scripture.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3 mb-10 text-center">
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
          ✨ Full Journey Access
        </p>
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
          ♾️ Unlimited Training
        </p>
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
          🧠 Smart Recall System
        </p>
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
          📈 Progress Tracking
        </p>
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
          🔥 Streak + XP System
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="border border-neutral-700 rounded-2xl p-5 bg-neutral-950">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-white font-medium mb-3">$6.99 / month</p>

          <ul className="text-sm space-y-2 text-white/90">
            <li>✔ Flashcards</li>
            <li>✔ Active Recall</li>
            <li>✔ Weak Card Training</li>
            <li className="text-red-400">✖ No Journey</li>
          </ul>

          <button
            onClick={() => onSelectPlan("pro")}
            className="mt-4 w-full bg-neutral-700 hover:bg-neutral-600 transition py-3 rounded-xl font-semibold active:scale-95"
          >
            Continue with Pro
          </button>
        </div>

        <div className="border-2 border-green-500 rounded-2xl p-5 bg-green-500/10 shadow-[0_0_24px_rgba(34,197,94,0.35)] animate-pulse">
          <div className="inline-flex px-3 py-1 rounded-full bg-green-500 text-black text-xs font-bold mb-3">
            BEST VALUE
          </div>

          <h2 className="text-xl font-bold mb-2">
            Pro+ 🚀
          </h2>

          <p className="text-white font-medium mb-3">$12.99 / month</p>

          <ul className="text-sm space-y-2 text-white">
            <li>✔ Full Bible Journey</li>
            <li>✔ Unlimited Training</li>
            <li>✔ Scholar Mode</li>
            <li>✔ Full Progression</li>
            <li>✔ Everything in Pro</li>
          </ul>

          <button
            onClick={() => onSelectPlan("pro_plus")}
            className="mt-4 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition active:scale-95"
          >
            Start My Journey
          </button>
        </div>
      </div>
    </div>
  )
}
