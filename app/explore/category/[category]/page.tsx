import Link from "next/link"

function formatCategory(category: string) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default async function ExploreCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#10203f_0%,_#080d1b_38%,_#04060d_100%)] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/explore"
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
        >
          ← Back to Explorer
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,39,0.98),rgba(7,10,18,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200/80">
            Category
          </div>
          <h1 className="mt-3 text-4xl font-black text-white">
            {formatCategory(category)}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Category exploration is staged for the next phase. The route is live so the
            explorer foundation can already navigate into each collection.
          </p>
        </section>
      </div>
    </main>
  )
}
