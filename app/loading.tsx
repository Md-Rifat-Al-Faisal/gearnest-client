export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        {/* Top Header Skeleton */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="h-7 w-64 rounded-lg bg-surface-2" />
          <div className="h-4 w-96 max-w-full rounded-md bg-surface-2/70" />
        </div>

        {/* Content Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs"
            >
              <div className="h-44 w-full rounded-lg bg-surface-2" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded-md bg-surface-2" />
                <div className="h-4 w-1/2 rounded-md bg-surface-2/70" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="h-6 w-20 rounded-md bg-gold-fill/20" />
                <div className="h-8 w-24 rounded-lg bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
