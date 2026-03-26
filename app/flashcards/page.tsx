'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  createFlashcard,
  createFlashcardCategory,
  getFlashcardCategories,
  getFlashcards,
  type Flashcard,
  type FlashcardCategory,
  updateFlashcardStatus
} from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

type FlashcardForm = {
  verse: string
  reference: string
  categoryId: string
}

type TrainingMode = 'single' | 'multi'

type ComparedWord = {
  word: string
  isCorrect: boolean
}

type ComparedVerse = {
  flashcardId: string
  reference: string
  words: ComparedWord[]
}

const defaultFlashcardForm: FlashcardForm = {
  verse: '',
  reference: '',
  categoryId: ''
}

const statusPriority: Record<Flashcard['status'], number> = {
  learning: 0,
  new: 1,
  mastered: 2
}

function getNextStatus(currentStatus: Flashcard['status'], result: 'correct' | 'review'): Flashcard['status'] {
  if (result === 'review') {
    return 'learning'
  }

  if (currentStatus === 'new') {
    return 'learning'
  }

  if (currentStatus === 'learning') {
    return 'mastered'
  }

  return 'mastered'
}

function getStatusLabelClasses(status: Flashcard['status']) {
  if (status === 'mastered') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (status === 'learning') {
    return 'bg-amber-100 text-amber-800'
  }

  return 'bg-slate-100 text-slate-700'
}

function formatStatusLabel(status: Flashcard['status']) {
  if (status === 'mastered') {
    return 'Mastered'
  }

  if (status === 'learning') {
    return 'Learning'
  }

  return 'New'
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, '')
}

function compareVerseWords(expectedText: string, typedWords: string[], startIndex: number) {
  const expectedWords = expectedText.trim().split(/\s+/).filter(Boolean)
  const words = expectedWords.map((word, index) => ({
    word,
    isCorrect: normalizeWord(word) === normalizeWord(typedWords[startIndex + index] || '')
  }))

  return {
    words,
    nextIndex: startIndex + expectedWords.length
  }
}

function buildComparedVerses(flashcards: Flashcard[], typedText: string): ComparedVerse[] {
  const typedWords = typedText.trim().split(/\s+/).filter(Boolean)
  let wordCursor = 0

  return flashcards.map((flashcard) => {
    const comparison = compareVerseWords(flashcard.verse, typedWords, wordCursor)
    wordCursor = comparison.nextIndex

    return {
      flashcardId: flashcard.id,
      reference: flashcard.reference,
      words: comparison.words
    }
  })
}

function getActiveCards(cards: Flashcard[], startIndex: number, mode: TrainingMode) {
  if (cards.length === 0) {
    return []
  }

  if (mode === 'single' || cards.length === 1) {
    return [cards[startIndex % cards.length]]
  }

  const batchSize = Math.min(4, Math.max(2, cards.length >= 3 ? 3 : 2))
  return Array.from({ length: batchSize }, (_, offset) => cards[(startIndex + offset) % cards.length])
}

export default function FlashcardsPage() {
  const [categories, setCategories] = useState<FlashcardCategory[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [isProPlusUser, setIsProPlusUser] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showFlashcardForm, setShowFlashcardForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [flashcardForm, setFlashcardForm] = useState<FlashcardForm>(defaultFlashcardForm)
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [isSubmittingFlashcard, setIsSubmittingFlashcard] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [flashcardFormError, setFlashcardFormError] = useState('')
  const [typedAnswer, setTypedAnswer] = useState('')
  const [showTypingResult, setShowTypingResult] = useState(false)
  const [showAnimatedResult, setShowAnimatedResult] = useState(false)
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('single')

  useEffect(() => {
    async function initialize() {
      const { isProPlus } = await getSubscriptionStatus()
      setIsProPlusUser(isProPlus)
      setLoadingPlan(false)

      if (!isProPlus) {
        return
      }

      setLoadingData(true)
      const [loadedCategories, loadedFlashcards] = await Promise.all([
        getFlashcardCategories(),
        getFlashcards()
      ])

      setCategories(loadedCategories)
      setFlashcards(loadedFlashcards)
      setLoadingData(false)
    }

    initialize()
  }, [])

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]))
  }, [categories])

  const filteredFlashcards = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return flashcards
    }

    return flashcards.filter((flashcard) => flashcard.categoryId === selectedCategoryId)
  }, [flashcards, selectedCategoryId])

  const orderedFlashcards = useMemo(() => {
    return [...filteredFlashcards].sort((left, right) => {
      const priorityDifference = statusPriority[left.status] - statusPriority[right.status]
      if (priorityDifference !== 0) {
        return priorityDifference
      }

      return left.createdAt?.localeCompare(right.createdAt || '') || 0
    })
  }, [filteredFlashcards])

  const safeCurrentCardIndex = orderedFlashcards.length > 0
    ? currentCardIndex % orderedFlashcards.length
    : 0

  const activeCards = useMemo(() => {
    return getActiveCards(orderedFlashcards, safeCurrentCardIndex, trainingMode)
  }, [orderedFlashcards, safeCurrentCardIndex, trainingMode])

  const currentCard = activeCards[0] || null
  const comparedVerses = useMemo(() => buildComparedVerses(activeCards, typedAnswer), [activeCards, typedAnswer])
  const allComparedWords = comparedVerses.flatMap((verse) => verse.words)
  const correctWordCount = allComparedWords.filter((item) => item.isCorrect).length
  const accuracyScore = allComparedWords.length > 0 ? correctWordCount / allComparedWords.length : 0
  const isMostlyCorrect = accuracyScore >= 0.8

  useEffect(() => {
    if (!showTypingResult) return

    const timeoutId = window.setTimeout(() => {
      setShowAnimatedResult(true)
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [showTypingResult])

  const resetTypingFeedback = () => {
    setTypedAnswer('')
    setShowTypingResult(false)
    setShowAnimatedResult(false)
  }

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleNextCard = () => {
    if (orderedFlashcards.length === 0) {
      return
    }

    const stepSize = trainingMode === 'multi' ? activeCards.length : 1
    setCurrentCardIndex((previousIndex) => (previousIndex + stepSize) % orderedFlashcards.length)
    setShowAnswer(false)
    resetTypingFeedback()
  }

  const handleCategoryFilterChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    resetTypingFeedback()
  }

  const handleTrainingModeToggle = () => {
    setTrainingMode((currentMode) => currentMode === 'single' ? 'multi' : 'single')
    setCurrentCardIndex(0)
    setShowAnswer(false)
    resetTypingFeedback()
  }

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = categoryName.trim()

    if (!trimmedName) {
      return
    }

    setIsSubmittingCategory(true)
    const newCategory = await createFlashcardCategory(trimmedName)
    setIsSubmittingCategory(false)

    if (!newCategory) {
      return
    }

    const nextCategories = [...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name))
    setCategories(nextCategories)
    setCategoryName('')
    setShowCategoryForm(false)

    setFlashcardForm((currentForm) => ({
      ...currentForm,
      categoryId: currentForm.categoryId || newCategory.id
    }))
  }

  const handleCreateFlashcard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const verse = flashcardForm.verse.trim()
    const reference = flashcardForm.reference.trim()
    const categoryId = flashcardForm.categoryId

    if (!categoryId) {
      setFlashcardFormError('Please select a category before adding a flashcard')
      return
    }

    if (!verse || !reference) {
      return
    }

    setFlashcardFormError('')
    setIsSubmittingFlashcard(true)
    const newFlashcard = await createFlashcard({ verse, reference, categoryId })
    setIsSubmittingFlashcard(false)

    if (!newFlashcard) {
      return
    }

    setFlashcards((currentFlashcards) => [...currentFlashcards, newFlashcard])
    setFlashcardForm({
      verse: '',
      reference: '',
      categoryId
    })
    setShowFlashcardForm(false)
  }

  const handleFlashcardResult = async (result: 'correct' | 'review') => {
    if (activeCards.length === 0) {
      return
    }

    setIsUpdatingStatus(true)
    const updatedCards = await Promise.all(
      activeCards.map((card) =>
        updateFlashcardStatus(card.id, getNextStatus(card.status, result))
      )
    )
    setIsUpdatingStatus(false)

    const successfulUpdates = updatedCards.filter((card): card is Flashcard => card !== null)
    if (successfulUpdates.length === 0) {
      return
    }

    const updatedCardMap = new Map(successfulUpdates.map((card) => [card.id, card]))

    setFlashcards((currentItems) =>
      currentItems.map((flashcard) =>
        updatedCardMap.get(flashcard.id) || flashcard
      )
    )

    setShowAnswer(false)
    resetTypingFeedback()

    const stepSize = trainingMode === 'multi' ? activeCards.length : 1
    setCurrentCardIndex((previousIndex) => (previousIndex + stepSize) % orderedFlashcards.length)
  }

  const handleCheckTypedAnswer = () => {
    if (!typedAnswer.trim()) {
      return
    }

    setShowTypingResult(true)
  }

  if (loadingPlan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-700">Loading flashcards...</p>
      </div>
    )
  }

  if (!isProPlusUser) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-3xl text-white">
            🔒
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Flashcard Training
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Memorize and master scripture
          </p>
          <p className="mt-6 text-lg font-semibold text-gray-900">
            Unlock Flashcard Training with Pro+
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/upgrade"
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-black"
            >
              Upgrade to Pro+
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Flashcard Training
          </h1>
          <p className="mt-2 text-base text-gray-600 md:text-lg">
            Memorize and master scripture
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Flashcards</h2>
              <p className="mt-1 text-sm text-gray-600">
                Create categories, add verses, and train by recalling each reference.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCategoryForm((current) => !current)}
                className="rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                New Category
              </button>
              <button
                type="button"
                onClick={() => setShowFlashcardForm((current) => !current)}
                className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-black"
              >
                Add Flashcard
              </button>
            </div>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCreateCategory} className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-900">Category name</span>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Ex: Gospels"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmittingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          )}

          {showFlashcardForm && (
            <form onSubmit={handleCreateFlashcard} className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-900">Verse text</span>
                  <textarea
                    value={flashcardForm.verse}
                    onChange={(event) => setFlashcardForm((current) => ({ ...current, verse: event.target.value }))}
                    placeholder="Enter the verse text"
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-900">Reference</span>
                    <input
                      type="text"
                      value={flashcardForm.reference}
                      onChange={(event) => setFlashcardForm((current) => ({ ...current, reference: event.target.value }))}
                      placeholder="John 3:16"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <div className="block">
                    <span className="text-sm font-semibold text-gray-900">Category *</span>
                    {categories.length > 0 ? (
                      <>
                        <select
                          value={flashcardForm.categoryId}
                          onChange={(event) => {
                            setFlashcardForm((current) => ({ ...current, categoryId: event.target.value }))
                            if (event.target.value) {
                              setFlashcardFormError('')
                            }
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-600">
                          Required — create a category first if none exist
                        </p>
                      </>
                    ) : (
                      <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-white p-4">
                        <p className="text-sm font-medium text-gray-900">
                          You need to create a category first
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryForm(true)
                            setShowFlashcardForm(true)
                          }}
                          className="mt-3 rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-100"
                        >
                          Create Category
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {flashcardFormError && (
                <p className="mt-4 text-sm font-medium text-red-600">
                  {flashcardFormError}
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingFlashcard || categories.length === 0 || !flashcardForm.categoryId}
                  className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmittingFlashcard ? 'Saving...' : 'Add Flashcard'}
                </button>
              </div>

              {categories.length === 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Create a category first before adding a flashcard.
                </p>
              )}
            </form>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Training Deck</h2>
              <p className="mt-1 text-sm text-gray-600">
                Reveal the reference, move to the next card, and loop through your set.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="block md:min-w-64">
                <span className="text-sm font-semibold text-gray-900">Category Filter</span>
                <select
                  value={selectedCategoryId}
                  onChange={(event) => handleCategoryFilterChange(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="block">
                <span className="text-sm font-semibold text-gray-900">Training Mode</span>
                <button
                  type="button"
                  onClick={handleTrainingModeToggle}
                  disabled={orderedFlashcards.length < 2}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {trainingMode === 'multi' ? 'Single Verse Mode' : 'Multi-Verse Mode'}
                </button>
              </div>
            </div>
          </div>

          {trainingMode === 'multi' && orderedFlashcards.length < 2 && (
            <p className="mt-4 text-sm text-gray-600">
              Add at least two flashcards in this deck to use Multi-Verse Mode.
            </p>
          )}

          {loadingData ? (
            <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
              Loading your flashcards...
            </div>
          ) : flashcards.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Create your first flashcard to begin training
              </p>
            </div>
          ) : filteredFlashcards.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <p className="text-lg font-semibold text-gray-900">
                No flashcards in this category yet
              </p>
            </div>
          ) : currentCard ? (
            <div className="mt-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    {currentCard.categoryId ? categoryMap.get(currentCard.categoryId)?.name || 'Uncategorized' : 'Uncategorized'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusLabelClasses(currentCard.status)}`}>
                    {formatStatusLabel(currentCard.status)}
                  </span>
                  {trainingMode === 'multi' && (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                      Multi-Verse
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {trainingMode === 'multi'
                    ? `Sequence of ${activeCards.length} verses`
                    : `Card ${safeCurrentCardIndex + 1} of ${orderedFlashcards.length}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRevealAnswer}
                className="flex min-h-80 w-full flex-col justify-between rounded-3xl border border-gray-200 bg-linear-to-br from-white to-slate-50 p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {showAnswer ? 'Reference' : trainingMode === 'multi' ? 'Verse Sequence' : 'Verse'}
                  </p>
                </div>

                <div className="space-y-5 py-6 text-center">
                  {showAnswer ? (
                    <div className="space-y-3">
                      {activeCards.map((card, index) => (
                        <p key={card.id} className="text-2xl font-extrabold text-slate-900 md:text-3xl">
                          {trainingMode === 'multi' ? `Verse ${index + 1}: ` : ''}{card.reference}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {activeCards.map((card, index) => (
                        <div key={card.id}>
                          {trainingMode === 'multi' && (
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                              Verse {index + 1}
                            </p>
                          )}
                          <p className="text-xl leading-relaxed font-semibold text-gray-900 md:text-2xl">
                            {card.verse}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-center text-sm text-gray-500">
                  {showAnswer ? 'Tap next to continue training.' : 'Tap the card or use the button to reveal the answer.'}
                </p>
              </button>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleRevealAnswer}
                  disabled={showAnswer}
                  className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {showAnswer ? 'Answer Shown' : 'Show Answer'}
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                >
                  Next Card
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Typing Practice</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {trainingMode === 'multi'
                        ? 'Type the entire multi-verse sequence from memory.'
                        : 'Type the verse from memory for word-by-word feedback.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {trainingMode === 'multi' ? 'Sequence Recall' : 'Verse Recall'}
                  </span>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-gray-900">Your answer</span>
                  <textarea
                    value={typedAnswer}
                    onChange={(event) => {
                      setTypedAnswer(event.target.value)
                      if (showTypingResult) {
                        setShowTypingResult(false)
                        setShowAnimatedResult(false)
                      }
                    }}
                    placeholder={trainingMode === 'multi' ? 'Type the full verse sequence here' : 'Type the verse here'}
                    rows={trainingMode === 'multi' ? 6 : 4}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCheckTypedAnswer}
                    disabled={!typedAnswer.trim()}
                    className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Check Answer
                  </button>
                  <button
                    type="button"
                    onClick={resetTypingFeedback}
                    className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
                  >
                    Reset
                  </button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    showTypingResult ? 'mt-4 max-h-[48rem] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div
                    className={`rounded-2xl border p-4 transition duration-300 ${
                      isMostlyCorrect
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-amber-200 bg-amber-50'
                    } ${showAnimatedResult ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'}`}
                  >
                    <p className={`text-base font-bold ${
                      isMostlyCorrect ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {isMostlyCorrect ? "Great job! 🎉" : "Keep going — you're close 💪"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Correct version
                    </p>
                    <div className="mt-4 space-y-4">
                      {comparedVerses.map((verse, index) => (
                        <div key={verse.flashcardId}>
                          <p className="mb-2 text-sm font-semibold text-gray-700">
                            {trainingMode === 'multi' ? `Verse ${index + 1} • ${verse.reference}` : verse.reference}
                          </p>
                          <div className="flex flex-wrap gap-x-2 gap-y-3 text-base leading-7">
                            {verse.words.map((item, wordIndex) => (
                              <span
                                key={`${verse.flashcardId}-${wordIndex}`}
                                className={`rounded-md px-2 py-1 font-semibold transition-colors duration-200 ${
                                  item.isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {item.word}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {showAnswer && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleFlashcardResult('correct')}
                    disabled={isUpdatingStatus}
                    className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {isUpdatingStatus ? 'Saving...' : trainingMode === 'multi' ? 'Got them right' : 'Got it right'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFlashcardResult('review')}
                    disabled={isUpdatingStatus}
                    className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                  >
                    {isUpdatingStatus ? 'Saving...' : trainingMode === 'multi' ? 'Review this sequence' : 'Need to review'}
                  </button>
                </div>
              )}

              {showAnswer && trainingMode === 'multi' && (
                <p className="mt-3 text-sm text-gray-600">
                  This result will update all verses in the current sequence.
                </p>
              )}
            </div>
          ) : null}
        </section>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-600 transition hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
