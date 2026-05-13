"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import {
  BooksQuestHero,
  BooksQuestPageShell,
  BooksQuestPanel,
  BooksQuestStatusBadge,
  BooksQuestTopBar,
} from "@/components/BooksQuestShell"
import { createClient } from "@/lib/supabase/client"
import { useXPStore } from "@/lib/xpStore"

type BookRow = {
  id: string
  book: string
  book_order: number
  testament: string | null
  category: string | null
  theme: string | null
}

type Question = {
  id: string
  prompt: string
  answer: BookRow
  mode: "after" | "before" | "number"
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

function createQuestion(sortedBooks: BookRow[], modeSelector: number): Question | null {
  if (sortedBooks.length < 4) return null

  const availableModes: Question["mode"][] = []

  if (sortedBooks.length > 1) {
    availableModes.push("after", "before")
  }

  availableModes.push("number")

  let weightedModes: Question["mode"][] = availableModes

  if (modeSelector === 0) {
    weightedModes = ["after", "after", "after", "before", "number"]
  } else if (modeSelector === 1) {
    weightedModes = ["before", "before", "before", "after", "number"]
  } else if (modeSelector === 2) {
    weightedModes = ["number", "number", "number", "after", "before"]
  }

  const validModes = weightedModes.filter((mode) => availableModes.includes(mode))
  const modePool = validModes.length > 0 ? validModes : availableModes
  const mode = modePool[Math.floor(Math.random() * modePool.length)]

  if (mode === "after") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1))
    const baseBook = sortedBooks[index]
    const answer = sortedBooks[index + 1]

    return {
      id: `${mode}-${baseBook.id}-${answer.id}`,
      prompt: `What comes AFTER ${baseBook.book}?`,
      answer,
      mode,
    }
  }

  if (mode === "before") {
    const index = Math.floor(Math.random() * (sortedBooks.length - 1)) + 1
    const baseBook = sortedBooks[index]
    const answer = sortedBooks[index - 1]

    return {
      id: `${mode}-${baseBook.id}-${answer.id}`,
      prompt: `What comes BEFORE ${baseBook.book}?`,
      answer,
      mode,
    }
  }

  const answer = sortedBooks[Math.floor(Math.random() * sortedBooks.length)]

  return {
    id: `${mode}-${answer.id}`,
    prompt: `Which book is #${answer.book_order}?`,
    answer,
    mode,
  }
}

export default function BooksSpeedRoundPage() {
  const today = new Date().toISOString().slice(0, 10)
  const seed = Number(today.replace(/-/g, ""))
  let challengeLabel = ""

  const modeSelector = seed % 4

  if (modeSelector === 0) {
    challengeLabel = "What comes next?"
  } else if (modeSelector === 1) {
    challengeLabel = "What comes before?"
  } else if (modeSelector === 2) {
    challengeLabel = "Book positions"
  } else {
    challengeLabel = "Mixed challenge"
  }

  const [books, setBooks] = useState<BookRow[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [choices, setChoices] = useState<BookRow[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [showPoint, setShowPoint] = useState(false)
  const [xpEarned, setXpEarned] = useState<number | null>(null)
  const [isPractice, setIsPractice] = useState(false)
  const [bestScore, setBestScore] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modeStatus, setModeStatus] = useState<"xp" | "practice" | null>(null)
  const incrementXP = useXPStore((s) => s.incrementXP)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/quests/books")
        const payload = await res.json()

        if (!res.ok) {
          throw new Error(payload?.error || "Failed to load books")
        }

        const nextBooks = Array.isArray(payload?.books) ? payload.books : []
        setBooks(nextBooks)

        const supabase = createClient()

        const checkStatus = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return

          const { data } = await supabase
            .from("user_daily_activity")
            .select("id")
            .eq("user_id", user.id)
            .eq("mode", "speed_round")
            .eq("activity_date", new Date().toISOString().split("T")[0])

          if (data && data.length > 0) {
            setModeStatus("practice")
          } else {
            setModeStatus("xp")
          }
        }

        await checkStatus()
      } catch (loadError) {
        console.error("Failed to load books speed round data", loadError)
        setError("Unable to load books right now.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.book_order - b.book_order),
    [books]
  )

  const buildQuestion = useCallback(() => {
    const nextQuestion = createQuestion(sortedBooks, modeSelector)
    if (!nextQuestion) return

    const incorrectChoices = shuffle(
      sortedBooks.filter((book) => book.id !== nextQuestion.answer.id)
    ).slice(0, 3)

    setCurrentQuestion(nextQuestion)
    setChoices(shuffle([nextQuestion.answer, ...incorrectChoices]))
    setFeedback(null)
    setShowPoint(false)
    setSelectedId(null)
  }, [modeSelector, sortedBooks])

  useEffect(() => {
    if (sortedBooks.length >= 4 && hasStarted && !currentQuestion && !gameOver) {
      buildQuestion()
    }
  }, [sortedBooks, currentQuestion, gameOver, hasStarted, buildQuestion])

  useEffect(() => {
    if (loading || !hasStarted || gameOver || !sortedBooks.length || !currentQuestion) {
      return
    }

    if (timeLeft <= 0) {
      setGameOver(true)
      return
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [timeLeft, gameOver, loading, sortedBooks, hasStarted, currentQuestion])

  useEffect(() => {
    if (!gameOver) return

    setBestScore((prev) => (score > prev ? score : prev))

    let cancelled = false

    const syncDailyReward = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("CURRENT USER ID:", user?.id)
        console.log("SCORE BEING SENT:", score)

        if (!user) {
          return
        }

        const { data, error } = await supabase.rpc("award_speed_round_xp", {
          user_id_input: user.id,
          score_input: score,
        })

        console.log("XP RPC RESULT:", {
          data,
          error,
        })

        if (error) {
          console.error("XP error:", error)
          if (!cancelled) {
            setIsPractice(true)
            setXpEarned(null)
          }
          return
        }

        if (!cancelled) {
          if (data.awarded) {
            await supabase.rpc("update_streak", {
              user_id_input: user.id,
            })
            incrementXP(data.xp)
            setXpEarned(data.xp)
            setIsPractice(false)
          } else {
            setXpEarned(null)
            setIsPractice(true)
          }
        }
      } catch (rewardError) {
        console.error("Failed to sync speed round daily reward", rewardError)
        if (!cancelled) {
          setIsPractice(true)
          setXpEarned(null)
        }
      }
    }

    void syncDailyReward()

    return () => {
      cancelled = true
    }
  }, [gameOver, incrementXP, score])

  const startGame = () => {
    setHasStarted(true)
    setScore(0)
    setTimeLeft(30)
    setGameOver(false)
    setCurrentQuestion(null)
    setChoices([])
    setFeedback(null)
    setShowPoint(false)
    setXpEarned(null)
    setIsPractice(false)
    setSelectedId(null)
  }

  const handleAnswer = (book: BookRow) => {
    if (!currentQuestion || gameOver) return

    const isCorrect = book.id === currentQuestion.answer.id
    setSelectedId(book.id)

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setFeedback("correct")
      setShowPoint(true)
    } else {
      setFeedback("wrong")
    }

    window.setTimeout(() => {
      if (timeLeft <= 0) {
        setGameOver(true)
        setCurrentQuestion(null)
        setChoices([])
        setFeedback(null)
        setShowPoint(false)
        setSelectedId(null)
        return
      }

      setFeedback(null)
      setShowPoint(false)
      buildQuestion()
    }, 250)
  }

  if (loading) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>Loading speed round...</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (error) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>{error}</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (!sortedBooks.length) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel>No books loaded</BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (gameOver) {
    return (
      <BooksQuestPageShell>
        <BooksQuestPanel className="text-center">
          <div className="ba-badge-gold">Speed Round Complete</div>
          <h2 className="mt-4 text-3xl font-black text-white">Time&apos;s up</h2>
          <p className="mt-4 text-lg text-slate-200">Score: {score}</p>
          <p className="mt-2 text-sm text-slate-400">Best today: {bestScore}</p>
          {xpEarned !== null ? (
            <>
              <div className="mt-4 text-2xl font-black text-emerald-300">+{xpEarned} XP</div>
              <div className="text-xs text-slate-400">Daily reward earned</div>
            </>
          ) : isPractice ? (
            <>
              <div className="mt-4 font-semibold text-amber-200">Practice Mode</div>
              <div className="text-xs text-slate-400">No XP. New rewards refresh tomorrow.</div>
            </>
          ) : (
            <p className="mt-4 text-2xl font-semibold text-white">Checking reward...</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={startGame}
              className="ba-button-primary px-5 py-3 text-base font-black"
            >
              Play Again
            </button>

            <Link
              href="/quests/books"
              className="ba-button-secondary px-5 py-3 text-base font-semibold"
            >
              Back to Books
            </Link>
          </div>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  if (!hasStarted) {
    return (
      <BooksQuestPageShell maxWidth="max-w-4xl">
        <BooksQuestHero
          eyebrow="Books Quest"
          title="Speed Round"
          subtitle="Race the clock and sharpen recall through fast order, before, and position prompts. Your first run each day keeps the reward rules already in place."
          actions={
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                onClick={startGame}
                className="ba-button-primary flex-1 px-5 py-4 text-base font-black lg:flex-none"
              >
                Start Speed Round
              </button>
              <Link
                href="/quests/books"
                className="ba-button-secondary flex-1 px-5 py-4 text-center font-semibold lg:flex-none"
              >
                Back to Books
              </Link>
            </div>
          }
          stats={
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-2xl font-black text-white">30s</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Clock</div>
              </div>
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-2xl font-black text-white">3</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Prompt Types</div>
              </div>
              <div className="ba-card-soft rounded-[1.2rem] px-4 py-4 text-center">
                <div className="text-2xl font-black text-white">4</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Choices</div>
              </div>
            </div>
          }
        />

        <BooksQuestPanel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Today&apos;s Challenge
              </div>
              <div className="mt-2 text-xl font-black text-white">{challengeLabel}</div>
            </div>
            {modeStatus === "xp" ? (
              <BooksQuestStatusBadge tone="ready">Daily XP Ready</BooksQuestStatusBadge>
            ) : modeStatus === "practice" ? (
              <BooksQuestStatusBadge tone="practice">Practice Mode</BooksQuestStatusBadge>
            ) : null}
          </div>
        </BooksQuestPanel>
      </BooksQuestPageShell>
    )
  }

  return (
    <BooksQuestPageShell>
      <BooksQuestPanel>
        <BooksQuestTopBar
          backHref="/quests/books"
          meta={
            <div className="text-right">
              <div>Time {timeLeft}s</div>
              <div>Score {score}</div>
            </div>
          }
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="ba-badge-gold">Speed Round</div>
            <h1 className="mt-3 text-3xl font-black text-white">Fast recall challenge</h1>
            <p className="mt-2 text-sm text-slate-400">Today&apos;s challenge: {challengeLabel}</p>
          </div>
          {modeStatus === "xp" ? (
            <BooksQuestStatusBadge tone="ready">Daily XP Available</BooksQuestStatusBadge>
          ) : modeStatus === "practice" ? (
            <BooksQuestStatusBadge tone="practice">Practice Mode</BooksQuestStatusBadge>
          ) : null}
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-emerald-300 transition-[width] duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        <div
          className={`rounded-[1.6rem] border px-5 py-8 text-center transition ${
            feedback === "correct"
              ? "border-emerald-300/40 bg-emerald-400/12"
              : feedback === "wrong"
                ? "border-rose-400/40 bg-rose-500/14"
                : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Question</div>
          <div className="mt-4 text-3xl font-black text-white">
            {currentQuestion?.prompt || "Get ready..."}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {showPoint && (
            <div className="text-center text-lg font-bold text-emerald-300 animate-pulse">+1</div>
          )}
          {choices.map((book) => (
            <button
              key={book.id}
              onClick={() => handleAnswer(book)}
              disabled={selectedId !== null}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all duration-150 active:scale-95 ${
                feedback === "correct"
                  ? "border-emerald-400 bg-emerald-400/80 text-slate-950"
                  : feedback === "wrong"
                    ? "border-rose-400 bg-rose-500/80 text-white"
                    : selectedId !== null
                      ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="text-lg font-semibold">{book.book}</div>
            </button>
          ))}
        </div>
      </BooksQuestPanel>
    </BooksQuestPageShell>
  )
}
