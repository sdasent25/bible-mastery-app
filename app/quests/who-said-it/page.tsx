export default function WhoSaidItPage() {
  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-3xl font-bold text-white">Who Said It</h1>
        <p className="text-sm text-zinc-400">
          Choose a testament to begin.
        </p>

        <button className="w-full rounded-2xl bg-zinc-900 px-5 py-5 text-left text-lg font-semibold text-white transition hover:bg-zinc-800">
          Old Testament
        </button>

        <button className="w-full rounded-2xl bg-zinc-900 px-5 py-5 text-left text-lg font-semibold text-white transition hover:bg-zinc-800">
          New Testament
        </button>
      </div>
    </div>
  )
}
