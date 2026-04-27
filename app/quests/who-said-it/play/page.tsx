"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import GameHeader from "@/components/GameHeader"
import { addXp, getXp } from "@/lib/xp"

const supabase = createClient()

type Question = {
  id: string
  question: string
  correct_answer: string
  reference: string | null
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

export default function WhoSaidItPlay() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("quest_questions")
        .select("*")
        .eq("type", "who_said_it")
        .limit(10)

      setQuestions((data as Question[]) || [])

      const xp = await getXp()
      setTotalXp(xp)

      setLoading(false)
    }

    void load()
  }, [])

  const current = questions[currentIndex]

  const handleAnswer = async (option: string) => {
    if (!current || correct !== null) return

    const isCorrect = option === current.correct_answer

    setSelected(option)
    setCorrect(isCorrect)

    if (isCorrect) {
      const xpAmount = 5

      setSessionXp(prev => prev + xpAmount)

      const xpResult = await addXp({
        amount: xpAmount,
        source: "who_said_it",
        cardId: current.id,
        isFirstAttempt: true,
      })

      if (xpResult.success) {
        setTotalXp(xpResult.xp)
      }
    }
  }

  const next = () => {
    setSelected(null)
    setCorrect(null)
    setCurrentIndex(prev => prev + 1)
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>
  }

  if (!current) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-2xl font-bold mb-2">Quest Complete 🎉</h1>
        <p className="mb-4">+{sessionXp} XP earned</p>
        <button
          onClick={() => window.location.href = "/quests"}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Back to Quests
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">

      <button
        onClick={() => window.location.href = "/quests"}
        className="mb-4 text-sm text-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">
        Who Said It
      </h1>

      <GameHeader
        reference={current.reference || undefined}
        progress={currentIndex + 1}
        total={questions.length}
        sessionXp={sessionXp}
        totalXp={totalXp}
      />

      <div className="bg-gray-800 p-6 rounded-2xl mb-6">
        {current.question}
      </div>

      <div className="grid gap-3">
        {["A", "B", "C", "D"].map(letter => (
          <button
            key={letter}
            onClick={() => void handleAnswer(letter)}
            className={`p-4 rounded-lg text-left ${
              selected === letter
                ? correct
                  ? "bg-green-600"
                  : "bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {current[`option_${letter.toLowerCase()}` as keyof Question]}
          </button>
        ))}
      </div>

      {correct !== null && (
        <button
          onClick={next}
          className="mt-6 bg-blue-600 px-4 py-2 rounded"
        >
          Next
        </button>
      )}
    </div>
  )
}
