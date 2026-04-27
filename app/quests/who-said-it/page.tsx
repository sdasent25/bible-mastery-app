"use client"

export default function WhoSaidItPage() {
  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Who Said It</h1>
        <p className="text-sm text-zinc-400">
          Start the quest and identify who spoke each line.
        </p>

        <button
          onClick={() => window.location.href = "/quests/who-said-it/play?set=ot"}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Old Testament
        </button>

        <button
          onClick={() => window.location.href = "/quests/who-said-it/play?set=nt"}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          New Testament
        </button>
      </div>
    </div>
  )
}
