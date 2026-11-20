export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        {/* Top Header Skeleton */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <div className="h-7 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
        </div>

        {/* Content Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-44 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-1/2 rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="h-6 w-20 rounded-md bg-amber-500/20" />
                <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
