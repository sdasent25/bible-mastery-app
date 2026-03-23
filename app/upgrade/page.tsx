'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { setPro } from "../../lib/user"

export default function UpgradePage() {
  const [proActivated, setProActivated] = useState(false)

  useEffect(() => {
    const activatePro = async () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get("success") === "true") {
        try {
          await setPro()
          setProActivated(true)
        } catch (error) {
          console.error('Error activating pro:', error)
        }
      }
    }

    activatePro()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-6 space-y-6">

        {proActivated && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            🎉 You're now a Pro member!
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Unlock Full Bible Mastery
        </h1>

        <p className="text-gray-700 text-center">
          Go deeper with full quizzes, advanced difficulty levels, and a complete mastery system.
        </p>

        <ul className="space-y-2 text-gray-800">
          <li>• 15-question full quizzes</li>
          <li>• Easy, Medium, and Hard questions</li>
          <li>• Full learning system</li>
          <li>• Faster progress and mastery</li>
        </ul>

        <div className="border-t pt-4 space-y-3">
          <div className="text-gray-900 font-semibold">Individual</div>
          <div className="text-gray-700">$4.99/month or $39/year</div>

          <div className="text-gray-900 font-semibold mt-4">Family</div>
          <div className="text-gray-700">$9.99/month or $79/year</div>
        </div>

        <a
          href="https://buy.stripe.com/9B614nf729SEg681w15c400"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Pro Subscription
        </a>

        <Link href="/dashboard">
          <button className="w-full bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 transition">
            Back to Dashboard
          </button>
        </Link>

      </div>
    </div>
  )
}