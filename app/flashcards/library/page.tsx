"use client"

export default function LibraryPage() {
  const cards = [
    {
      text: "Trust in the Lord with all your heart and lean not on your own understanding",
      ref: "Proverbs 3:5",
    },
    {
      text: "I can do all things through Christ who strengthens me",
      ref: "Philippians 4:13",
    },
    {
      text: "The Lord is my shepherd I shall not want",
      ref: "Psalm 23:1",
    },
  ]

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 py-8">

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        My Flashcards
      </h1>

      {/* List */}
      <div className="max-w-xl mx-auto flex flex-col gap-4">

        {cards.map((card, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-zinc-900 border border-white/10 shadow-md"
          >
            <div className="text-sm text-blue-400 mb-2 font-medium">
              {card.ref}
            </div>

            <div className="text-lg font-semibold leading-relaxed">
              {card.text}
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}
