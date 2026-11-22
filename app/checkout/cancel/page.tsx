"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

function CheckoutCancelContent() {
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get("equipment_id")

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div className="h-14 w-14 rounded-xl bg-surface-2 text-accent-text flex items-center justify-center mx-auto border border-border">
        <AlertCircle className="h-7 w-7" />
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Payment Cancelled
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading mt-1">
          Checkout Was Cancelled
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your card was not charged and no reservation has been confirmed. You can retry your reservation at any time.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        {equipmentId ? (
          <Button asChild size="default">
            <Link
              href={`/equipment/${equipmentId}`}
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Equipment Booking</span>
            </Link>
          </Button>
        ) : (
          <Button asChild size="default">
            <Link href="/equipment">
              Browse Equipment Fleet
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild size="default">
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading...</div>}>
        <CheckoutCancelContent />
      </Suspense>
    </div>
  )
}
