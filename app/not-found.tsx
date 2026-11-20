import Link from "next/link"
import { Compass, Home, Search, Wrench } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50/60 dark:bg-slate-950/60">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* 404 Visual Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-4xl font-extrabold tracking-tight text-amber-600 dark:text-amber-500">
            404
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Equipment Not Located
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The page, machine specification, or catalog route you are looking for does not exist or has been relocated in the fleet registry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/equipment"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400"
          >
            <Search className="h-4 w-4" />
            Browse Catalog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800">
          <div className="flex items-center justify-center gap-1.5">
            <Wrench className="h-3 w-3 text-amber-500" />
            <span>GearNest Heavy Equipment Network</span>
          </div>
        </div>
      </div>
    </div>
  )
}
