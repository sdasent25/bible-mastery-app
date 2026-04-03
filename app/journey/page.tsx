import JourneyPath from "@/components/journey/JourneyPath"
import SeriesHeader from "@/components/journey/SeriesHeader"

const navItems = ["Dashboard", "Journey", "Training", "Review", "Settings"]

export default function JourneyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative flex min-h-screen bg-slate-950 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-150px] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500 opacity-10 blur-3xl" />
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent" />
        </div>
        <aside className="hidden w-72 border-r border-white/5 bg-slate-900/60 px-5 py-6 backdrop-blur md:block">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item === "Journey"

              return (
                <button
                  key={item}
                  type="button"
                  className={[
                    "rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  ].join(" ")}
                >
                  {item}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="relative z-10 flex-1 px-10 py-8">
          <div className="mx-auto flex max-w-7xl gap-8">
            <div className="flex-1">
              <header className="mb-8 text-center md:hidden transition-all duration-200">
                <h1 className="text-3xl font-bold tracking-tight">Journey</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Pentateuch → Genesis
                </p>
              </header>

              <header className="mb-8 hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-center shadow-lg transition-all duration-200 md:block">
                <h1 className="text-4xl font-bold tracking-tight">Journey</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Pentateuch → Genesis
                </p>
              </header>

              <SeriesHeader />
              <JourneyPath />
            </div>

            <div className="hidden w-96 flex-col gap-4 border-l border-white/5 p-6 xl:flex">
              <div className="rounded-xl border border-white/5 bg-slate-900 p-5 transition-all duration-200">
                🔥 Progress: 4 / 6 complete
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-900 p-5 transition-all duration-200">
                🎯 Next: Tower of Babel
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-900 p-5 transition-all duration-200">
                ███░░ Progress to next unlock
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
