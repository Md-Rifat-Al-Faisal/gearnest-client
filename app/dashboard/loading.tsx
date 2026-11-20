export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <div className="h-6 w-36 rounded-full bg-amber-500/15 border border-amber-500/20" />
          <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-32 rounded-xl bg-amber-500/20" />
        </div>
      </div>

      {/* KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-36 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations / Table Skeleton Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-56 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-64 w-full rounded-xl bg-slate-100 dark:bg-slate-800/50" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-48 rounded bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-52 w-full rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
