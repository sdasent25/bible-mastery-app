"use client"

type PaywallProps = {
  reason?: string | null
  onSelectPlan: (plan: "pro" | "pro_plus") => void
}

export default function Paywall({ onSelectPlan }: PaywallProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-3">
        Become a Bible Athlete
      </h1>

      <p className="text-center text-white/70 mb-8">
        Unlock the full system. Train without limits.
      </p>

      <div className="mb-10 text-center space-y-2 text-sm text-white/80">
        <p>✨ Full Bible Journey</p>
        <p>♾️ Unlimited Training</p>
        <p>🧠 Smart Recall System</p>
        <p>🔥 XP + Streak System</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="bg-[#121826] border border-neutral-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-white/70 mb-3">$6.99 / month</p>

          <ul className="text-sm space-y-1 text-white/90">
            <li>✔ Flashcards</li>
            <li>✔ Active Recall</li>
            <li>✔ Weak Card Training</li>
            <li>✔ XP + Streak</li>
            <li className="text-red-400">✖ No Journey</li>
          </ul>

          <button
            onClick={() => onSelectPlan("pro")}
            className="mt-4 w-full bg-neutral-700 hover:bg-neutral-600 transition py-2 rounded-lg font-semibold active:scale-95"
          >
            Continue with Pro
          </button>
        </div>

        <div className="bg-[#121826] border-2 border-green-500 rounded-xl p-5 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.45)] animate-pulse">
          <h2 className="text-xl font-bold mb-2">
            Pro+ 🚀
          </h2>

          <p className="text-white/85 mb-3">$12.99 / month</p>

          <ul className="text-sm space-y-1 text-white">
            <li>✔ Full Bible Journey</li>
            <li>✔ Unlimited Training</li>
            <li>✔ Scholar Mode</li>
            <li>✔ Full Progression</li>
            <li>✔ Everything in Pro</li>
          </ul>

          <button
            onClick={() => onSelectPlan("pro_plus")}
            className="mt-4 w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg transition active:scale-95"
          >
            Start My Journey
          </button>
        </div>
      </div>

      <p className="text-xs text-white/50 mt-6">
        Upgrade anytime to unlock full training
      </p>
    </div>
  )
}
