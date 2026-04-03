import JourneyPath from "@/components/journey/JourneyPath"
import SeriesHeader from "@/components/journey/SeriesHeader"

const navItems = ["Dashboard", "Journey", "Training", "Review", "Settings"]

export default function JourneyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <aside className="hidden w-full border-b border-slate-200 bg-white/70 px-5 py-6 backdrop-blur md:block md:w-[220px] md:border-b-0 md:border-r dark:border-slate-800 dark:bg-slate-900/60">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item === "Journey"

              return (
                <button
                  key={item}
                  type="button"
                  className={[
                    "rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  ].join(" ")}
                >
                  {item}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl gap-8">
            <div className="flex-1">
              <header className="mb-8 text-center md:hidden">
                <h1 className="text-3xl font-bold tracking-tight">Journey</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Pentateuch → Genesis
                </p>
              </header>

              <header className="mb-8 hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-center shadow-lg md:block">
                <h1 className="text-4xl font-bold tracking-tight">Journey</h1>
                <p className="mt-2 text-sm text-slate-300 dark:text-slate-300">
                  Pentateuch → Genesis
                </p>
              </header>

              <SeriesHeader />
              <JourneyPath />
            </div>

            <div className="hidden w-80 p-6 xl:block">
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
                  🔥 Progress: 4 / 6 complete
                </div>

                <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
                  🎯 Next: Tower of Babel
                </div>

                <div className="rounded-xl bg-slate-900 p-4 text-slate-100">
                  🧠 Review Genesis 4–6
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
