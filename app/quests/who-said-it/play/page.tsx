"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const book = searchParams.get("book")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from("quest_questions")
        .select("*")
        .eq("type", "who_said_it")

      if (book) {
        query = query.contains("tags", [book])
      }

      const { data } = await query.limit(10)

      if (!data || data.length === 0) {
        console.error("No questions found for book:", book)
      }

      setQuestions((data as Question[]) || [])

      const xp = await getXp()
      setTotalXp(xp)

      setLoading(false)
    }

    void load()
  }, [book])

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
    return <div className="p-6 md:p-10 text-white max-w-lg mx-auto">Loading...</div>
  }

  if (!current) {
    return (
      <div className="p-6 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">
          Quest Complete 🎉
        </h1>
        <p className="text-green-400 text-xl mb-4">
          +{sessionXp} XP
        </p>
        <p className="text-gray-400 mb-6">
          Great work. Keep building your recall.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Replay
          </button>
          <button
            onClick={() => window.location.href = "/quests"}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Back to Quests
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 text-white max-w-lg mx-auto">

      <button
        onClick={() => window.location.href = "/quests"}
        className="mb-4 text-sm text-gray-300 transition transform active:scale-95"
      >
        ← Back
      </button>

      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        Who Said It
      </h1>

      <div className="w-full bg-gray-800 h-2 rounded mb-4">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

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
            className={`p-4 rounded-lg text-left transition transform active:scale-95 ${
              selected === letter
                ? correct
                  ? "bg-green-600 animate-pulse"
                  : "bg-red-600 animate-shake"
                : "bg-gray-700 hover:bg-gray-600 hover:scale-105"
            }`}
          >
            {current[`option_${letter.toLowerCase()}` as keyof Question]}
          </button>
        ))}
      </div>

      {correct !== null && (
        <button
          onClick={next}
          className="mt-6 bg-blue-600 px-4 py-2 rounded transition transform active:scale-95"
        >
          Next
        </button>
      )}
    </div>
  )
}
