'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  createFlashcard,
  createFlashcardCategory,
  getFlashcardCategories,
  getFlashcards,
  type Flashcard,
  type FlashcardCategory
} from '@/lib/flashcards'
import { getSubscriptionStatus } from '@/lib/user'

type FlashcardForm = {
  verse: string
  reference: string
  categoryId: string
}

const defaultFlashcardForm: FlashcardForm = {
  verse: '',
  reference: '',
  categoryId: ''
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

  const safeCurrentCardIndex = filteredFlashcards.length > 0
    ? currentCardIndex % filteredFlashcards.length
    : 0

  const currentCard = filteredFlashcards[safeCurrentCardIndex] || null

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleNextCard = () => {
    if (filteredFlashcards.length === 0) {
      return
    }

    setCurrentCardIndex((previousIndex) => (previousIndex + 1) % filteredFlashcards.length)
    setShowAnswer(false)
  }

  const handleCategoryFilterChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentCardIndex(0)
    setShowAnswer(false)
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

    if (!verse || !reference || !categoryId) {
      return
    }

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

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-900">Category</span>
                    <select
                      value={flashcardForm.categoryId}
                      onChange={(event) => setFlashcardForm((current) => ({ ...current, categoryId: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingFlashcard || categories.length === 0}
                  className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmittingFlashcard ? 'Saving...' : 'Save Flashcard'}
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
          </div>

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
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {currentCard.categoryId ? categoryMap.get(currentCard.categoryId)?.name || 'Uncategorized' : 'Uncategorized'}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Card {safeCurrentCardIndex + 1} of {filteredFlashcards.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRevealAnswer}
                className="flex min-h-80 w-full flex-col justify-between rounded-3xl border border-gray-200 bg-linear-to-br from-white to-slate-50 p-6 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {showAnswer ? 'Reference' : 'Verse'}
                  </p>
                </div>

                <div className="py-6 text-center">
                  {showAnswer ? (
                    <p className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                      {currentCard.reference}
                    </p>
                  ) : (
                    <p className="text-xl leading-relaxed font-semibold text-gray-900 md:text-2xl">
                      {currentCard.verse}
                    </p>
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
