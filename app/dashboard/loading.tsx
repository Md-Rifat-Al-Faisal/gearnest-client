export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse text-foreground">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <div className="h-6 w-36 rounded-md bg-surface-2 border border-border" />
          <div className="h-8 w-64 rounded-lg bg-surface-2" />
          <div className="h-4 w-80 max-w-full rounded-md bg-surface-2/70" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-lg bg-surface-2" />
          <div className="h-10 w-32 rounded-lg bg-primary/20" />
        </div>
      </div>

      {/* KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-surface-2" />
              <div className="h-9 w-9 rounded-lg bg-surface-2" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-28 rounded-md bg-surface-2" />
              <div className="h-3.5 w-36 rounded bg-surface-2/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations / Table Skeleton Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded bg-surface-2" />
              <div className="h-3.5 w-56 rounded bg-surface-2/60" />
            </div>
            <div className="h-8 w-8 rounded-lg bg-surface-2" />
          </div>
          <div className="h-64 w-full rounded-lg bg-surface-2/50" />
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="h-5 w-36 rounded bg-surface-2" />
          <div className="h-3.5 w-48 rounded bg-surface-2/60" />
          <div className="h-52 w-full rounded-full border-8 border-surface-2 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
