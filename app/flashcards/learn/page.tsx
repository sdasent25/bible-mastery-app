"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getFlashcards } from "@/lib/flashcards"
import { addXp } from "@/lib/xp"

const STOP_WORDS = new Set([
  "the", "and", "of", "so", "he", "she", "it", "in", "to", "a", "is", "was",
  "were", "be", "been", "being", "that", "this", "these", "those", "for",
  "on", "at", "by", "from", "with", "as", "an", "but", "if", "or", "nor", "not",
])

type Flashcard = {
  id: string
  verse_text: string
  reference: string
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^\w]/g, "").trim()
}

function tokenizeVerse(verse: string) {
  return verse.split(" ").map((token) => ({
    original: token,
    clean: normalizeWord(token),
  }))
}

function getEligibleIndices(tokens: { original: string; clean: string }[]) {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.clean.length > 2 && !STOP_WORDS.has(token.clean))
    .map(({ index }) => index)
}

function getRandomIndices(pool: number[], count: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, pool.length)).sort((a, b) => a - b)
}

export default function FlashcardsLearnPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [mascot, setMascot] = useState<"idle" | "happy" | "sad">("idle")
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([])
  const [inputs, setInputs] = useState<string[]>([])
  const [inputStatus, setInputStatus] = useState<("correct" | "wrong" | null)[]>([])
  const [fullVerseInput, setFullVerseInput] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [streak, setStreak] = useState(0)
  const [combo, setCombo] = useState(1)
  const [xpPop, setXpPop] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [showEnd, setShowEnd] = useState(false)

  const tapSound = useRef<HTMLAudioElement | null>(null)
  const correctSound = useRef<HTMLAudioElement | null>(null)
  const wrongSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("user_access")
        .select("final_plan")
        .eq("user_id", user.id)
        .single()

      const planType = data?.final_plan ?? "free"
      const hasAccess = planType === "pro" || planType === "pro_plus"

      console.log("FLASHCARD ROUTE PLAN:", planType)

      if (hasAccess) {
        setHasAccess(true)
      } else {
        router.push("/pricing?source=flashcards_locked")
      }

      setLoading(false)
    }

    void checkAccess()
  }, [router])

  useEffect(() => {
    if (!hasAccess) return

    async function load() {
      const data = await getFlashcards()
      setFlashcards((data || []) as Flashcard[])
    }

    void load()
  }, [hasAccess])

  useEffect(() => {
    tapSound.current = new Audio("/sounds/tap.mp3")
    correctSound.current = new Audio("/sounds/correct.mp3")
    wrongSound.current = new Audio("/sounds/wrong.mp3")
  }, [])

  const card = flashcards[index]

  const tokens = useMemo(() => {
    if (!card) return []
    return tokenizeVerse(card.verse_text)
  }, [card])

  const eligibleIndices = useMemo(() => {
    return getEligibleIndices(tokens)
  }, [tokens])

  const totalSteps = useMemo(() => {
    if (!tokens.length) return 3
    return tokens.length > 20 ? 4 : 3
  }, [tokens])

  useEffect(() => {
    if (!card || tokens.length === 0) return

    let nextHidden: number[] = []

    if (step === 0) {
      nextHidden = getRandomIndices(eligibleIndices, 2)
    } else if (step === 1) {
      nextHidden = getRandomIndices(eligibleIndices, 4)
    } else if (step === 2 && totalSteps === 4) {
      nextHidden = getRandomIndices(eligibleIndices, 6)
    } else {
      nextHidden = []
    }

    setHiddenIndices(nextHidden)
    setInputs(new Array(nextHidden.length).fill(""))
    setInputStatus(new Array(nextHidden.length).fill(null))
    setFullVerseInput("")
    setFeedback(null)
  }, [card, step, eligibleIndices, tokens.length, totalSteps])

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!hasAccess) return null

  if (!flashcards.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/flashcards")}
            className="text-sm text-gray-300"
          >
            ← Flashcards
          </button>

          <div className="text-sm text-white/80">
            Learn
          </div>
        </div>

        <div className="px-4 py-10 text-center text-white/80">
          No flashcards yet
        </div>
      </div>
    )
  }

  function renderPrompt() {
    if (step === totalSteps - 1) {
      return (
        <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[160px] flex items-center justify-center text-lg leading-relaxed">
          Type the full verse from memory
        </div>
      )
    }

    let blankCounter = -1

    return (
      <div className="p-6 rounded-2xl bg-neutral-900 text-white text-center border border-neutral-700 min-h-[180px] flex flex-wrap items-center justify-center gap-2 text-lg leading-relaxed">
        {tokens.map((token, tokenIndex) => {
          const isHidden = hiddenIndices.includes(tokenIndex)

          if (!isHidden) {
            return (
              <span key={`token-${tokenIndex}`} className="text-white">
                {token.original}
              </span>
            )
          }

          blankCounter += 1

          return (
            <span
              key={`blank-${tokenIndex}`}
              className="inline-flex items-center justify-center min-w-[48px] h-10 px-3 rounded-xl border border-blue-500 bg-blue-500/10 text-blue-300 text-sm font-semibold"
            >
              {blankCounter + 1}
            </span>
          )
        })}
      </div>
    )
  }

  function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim()
  }

  function handleInputChange(value: string, inputIndex: number) {
    setInputs((prev) => {
      const next = [...prev]
      next[inputIndex] = value
      return next
    })
  }

  function nextCard() {
    if (index >= flashcards.length - 1) {
      setShowEnd(true)
      return
    }

    setIndex((prev) => prev + 1)
    setStep(0)
    setMascot("idle")
    setHiddenIndices([])
    setInputs([])
    setInputStatus([])
    setFullVerseInput("")
    setFeedback(null)
  }

  function handleSubmit() {
    tapSound.current?.play().catch(() => undefined)

    if (step < totalSteps - 1) {
      const correctAnswers = hiddenIndices.map((hiddenIndex) => tokens[hiddenIndex]?.clean || "")
      const userAnswers = inputs.map((value) => normalizeWord(value))
      const isFirstTry = inputStatus.every((status) => status === null)

      const statusArray = correctAnswers.map((answer, i) =>
        userAnswers[i] === answer ? "correct" : "wrong"
      )

      setInputStatus(statusArray)

      const isCorrect = statusArray.every((status) => status === "correct")

      if (isCorrect) {
        correctSound.current?.play().catch(() => undefined)
        setFeedback("correct")
        let xpEarned = 0

        if (step === 0) xpEarned = 1
        if (step === 1) xpEarned = 2
        if (step === totalSteps - 1) xpEarned = 3

        if (xpEarned > 0) {
          addXp(xpEarned, "recall").catch(console.error)
          setXpPop(`+${xpEarned} XP ✨`)
        }
        setMascot("happy")
        if (streak >= 3) {
          // slight scale boost handled via class
        }
        const gainedXp = 1 * combo
        setXpPop(`+${gainedXp} XP`)
        setTimeout(() => setXpPop(null), 600)
        setStreak((prev) => prev + 1)
        setCombo((prev) => prev + 1)
        if (isFirstTry && combo >= 2) {
          setXpPop(`+${gainedXp} XP ✨`)
        }
        if (streak > 0 && streak % 3 === 0) {
          setXpPop("+5 Bonus XP 🎉")
        }
        setHiddenIndices([])

        setTimeout(() => {
          setMascot("idle")
          setFeedback(null)
          setInputStatus([])
          setStep((prev) => prev + 1)
        }, 500)
      } else {
        wrongSound.current?.play().catch(() => undefined)
        setFeedback("wrong")
        setMascot("sad")
        setShake(true)
        setTimeout(() => setShake(false), 300)
        setCombo(1)
        setStreak(0)

        setTimeout(() => {
          setMascot("idle")
        }, 600)
      }

      return
    }

    const isFullVerseCorrect =
      normalizeText(fullVerseInput) === normalizeText(card.verse_text)

    if (isFullVerseCorrect) {
      correctSound.current?.play().catch(() => undefined)
      setFeedback("correct")
      let xpEarned = 0

      if (step === 0) xpEarned = 1
      if (step === 1) xpEarned = 2
      if (step === totalSteps - 1) xpEarned = 3

      if (xpEarned > 0) {
        addXp(xpEarned, "recall").catch(console.error)
        setXpPop(`+${xpEarned} XP ✨`)
      }
      setMascot("happy")
      if (streak >= 3) {
        // slight scale boost handled via class
      }
      const gainedXp = 1 * combo
      setXpPop(combo >= 2 ? `+${gainedXp} XP ✨` : `+${gainedXp} XP`)
      setTimeout(() => setXpPop(null), 600)
      setStreak((prev) => prev + 1)
      setCombo((prev) => prev + 1)
      if (streak > 0 && streak % 3 === 0) {
        setXpPop("+5 Bonus XP 🎉")
      }

      setTimeout(() => {
        setMascot("idle")
        nextCard()
      }, 600)
    } else {
      wrongSound.current?.play().catch(() => undefined)
      setFeedback("wrong")
      setMascot("sad")
      setShake(true)
      setTimeout(() => setShake(false), 300)
      setCombo(1)
      setStreak(0)

      setTimeout(() => {
        setMascot("idle")
      }, 600)
    }
  }

  if (showEnd) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
        <img
          src="/flame-happy.png"
          className="w-20 h-20 animate-float"
          alt="happy flame mascot"
        />

        <h2 className="text-2xl font-bold text-white">
          You’re on a roll 🔥
        </h2>

        <p className="text-white/80">
          Want to keep going?
        </p>

        <button
          onClick={() => {
            setShowEnd(false)
            setIndex(0)
            setStep(0)
          }}
          className="w-full max-w-xs bg-blue-600 py-4 rounded-xl font-semibold"
        >
          Continue Training
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full max-w-xs bg-neutral-700 py-4 rounded-xl font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col border-t border-blue-500/20">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/flashcards")}
          className="text-sm text-gray-300"
        >
          ← Flashcards
        </button>

        <div className="text-sm text-white/80">
          Learn
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full relative">
        {xpPop && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-yellow-400 text-xl font-bold animate-bounce z-10 pointer-events-none">
            {xpPop}
          </div>
        )}

        <div key={`${card.id}-${step}`} className="transition-all duration-300 animate-fade-in space-y-5">
          <div className="flex justify-center mt-2 mb-2">
            <img
              src={
                mascot === "idle"
                  ? "/flame-idle.png"
                  : mascot === "happy"
                  ? "/flame-happy.png"
                  : "/flame-sad.png"
              }
              className={`w-20 h-20 object-contain animate-float transition-all duration-300 ${
                mascot === "happy" && streak >= 3 ? "scale-110" : ""
              }`}
              alt="mascot"
            />
          </div>

          <div className="text-center text-orange-400 font-semibold">
            🔥 {streak} streak
          </div>

          <h1 className="text-2xl font-bold text-white text-center">
            Active Recall
          </h1>

          <p className="text-center text-white/80 text-sm font-medium">
            {card.reference}
          </p>

          <p className="text-center text-white/80 text-sm">
            Fill in the missing parts of the verse
          </p>

          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-white/70">
              Step {step + 1} of {totalSteps}
            </span>
            {combo > 1 && (
              <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-yellow-300">
                Combo x{combo}
              </span>
            )}
          </div>

          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>

          <div className={shake ? "animate-shake" : ""}>
            {renderPrompt()}
          </div>

          {step < totalSteps - 1 ? (
            <>
              <p className="text-center text-white/70 text-sm">
                Enter each missing word below
              </p>

              <div className={`grid gap-3 ${inputs.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {inputs.map((value, inputIndex) => (
                  <input
                    key={`input-${inputIndex}`}
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value, inputIndex)}
                    placeholder={`Word ${inputIndex + 1}`}
                    className={`
                      w-full p-4 rounded-xl bg-neutral-900 text-white text-base min-h-[52px] border
                      ${inputStatus[inputIndex] === "correct" ? "border-green-500" : ""}
                      ${inputStatus[inputIndex] === "wrong" ? "border-red-500" : "border-neutral-700"}
                      focus:outline-none focus:border-blue-500
                    `}
                  />
                ))}
              </div>
            </>
          ) : (
            <textarea
              value={fullVerseInput}
              onChange={(e) => setFullVerseInput(e.target.value)}
              placeholder="Type the full verse..."
              className={`w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:border-blue-500 text-base min-h-[140px] ${shake ? "animate-shake" : ""}`}
            />
          )}

          {feedback === "correct" && (
            <div className="text-green-400 text-center font-semibold">
              Correct ✅
            </div>
          )}

          {feedback === "wrong" && (
            <div className="text-red-400 text-center font-semibold">
              Try again
            </div>
          )}

          {step === totalSteps - 1 && (
            <p className="text-center text-white/70 text-sm">
              Type the full verse as accurately as you can
            </p>
          )}

          <button
            onClick={handleSubmit}
            className={`w-full py-4 rounded-xl font-semibold transition hover:brightness-110 duration-150 active:scale-95 ${
              feedback === "correct"
                ? "bg-green-600"
                : feedback === "wrong"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            Check Answer
          </button>
        </div>
      </div>
    </div>
  )
}
