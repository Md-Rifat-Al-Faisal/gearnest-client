"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 sm:p-10 text-center shadow-xs">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-danger/10 border border-danger/20 text-danger">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="mt-6 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
            System Notice
          </span>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground sm:text-3xl">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected error processing your request. Our diagnostic telemetry has recorded the issue.
          </p>
        </div>

        {/* Error Detail preview (collapsible or discreet) */}
        {error.message && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-left text-xs font-mono text-danger">
            {error.message}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => reset()} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
