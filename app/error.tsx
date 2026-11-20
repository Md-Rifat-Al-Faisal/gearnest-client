"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home, Wrench } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected runtime errors for observability
    console.error("GearNest caught runtime error:", error)
  }, [error])

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50/60 dark:bg-slate-950/60">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="mt-6 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Wrench className="h-3 w-3 text-amber-500" />
            System Malfunction
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We encountered an unexpected error processing your request. Our diagnostic telemetry has recorded the issue.
          </p>
        </div>

        {/* Error Detail preview (collapsible or discreet) */}
        {error.message && (
          <div className="mt-4 rounded-xl border border-red-200/60 bg-red-50/60 p-3 text-left text-xs font-mono text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            {error.message}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
