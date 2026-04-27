"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import GameHeader from "@/components/GameHeader"
import { addXp, getXp } from "@/lib/xp"

const supabase = createClient()

type QuestQuestion = {
  id: string
  type: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  reference: string | null
}

export default function WhoSaidItPlayPage() {
  const [questions, setQuestions] = useState<QuestQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [sessionXp, setSessionXp] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data, error: questionsError }, xp] = await Promise.all([
          supabase
            .from("quest_questions")
            .select("*")
            .eq("type", "who_said_it")
            .limit(10),
          getXp(),
        ])

        if (questionsError) {
          throw questionsError
        }

        setQuestions((data as QuestQuestion[]) || [])
        setTotalXp(xp)
      } catch (loadError) {
        console.error("Failed to load who said it quest", loadError)
        setError("Unable to load quest questions right now.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const current = questions[currentIndex]

  const handleAnswer = async (option: "A" | "B" | "C" | "D") => {
    if (!current || correct !== null) return

    const isCorrect = option === current.correct_answer
    setSelected(option)
    setCorrect(isCorrect)

    if (isCorrect) {
      const xpAmount = 5

      setSessionXp((prev) => prev + xpAmount)

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
    setCurrentIndex((prev) => prev + 1)
  }

  if (loading) {
    return <div className="p-6 text-white">Loading quest...</div>
  }

  if (error) {
    return <div className="p-6 text-white">{error}</div>
  }

  if (!questions.length) {
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

        <p className="text-gray-300">
          No quest questions were found yet.
        </p>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="p-6 text-white max-w-3xl mx-auto">
        <button
          onClick={() => window.location.href = "/quests"}
          className="mb-4 text-sm text-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-4">
          Quest Complete
        </h1>

        <p className="text-gray-200">
          You finished the Who Said It quest.
        </p>
        <p className="mt-2 text-sm text-green-400">
          Session XP earned: +{sessionXp}
        </p>
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
        {(["A", "B", "C", "D"] as const).map((letter) => (
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
            {current[`option_${letter.toLowerCase()}` as keyof Pick<
              QuestQuestion,
              "option_a" | "option_b" | "option_c" | "option_d"
            >]}
          </button>
        ))}
      </div>

      {correct === false && (
        <p className="mt-4 text-sm text-gray-300">
          Correct answer: {current.correct_answer}.{" "}
          {
            current[`option_${current.correct_answer.toLowerCase()}` as keyof Pick<
              QuestQuestion,
              "option_a" | "option_b" | "option_c" | "option_d"
            >]
          }
        </p>
      )}

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
