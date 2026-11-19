"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, RotateCcw, Package } from "lucide-react"

function CheckoutCancelContent() {
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get("equipment_id")

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
      <div className="h-16 w-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Payment Cancelled
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          Checkout Was Cancelled
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Your card was not charged and no reservation has been confirmed. You can retry your reservation at any time.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        {equipmentId ? (
          <Link
            href={`/equipment/${equipmentId}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Equipment Booking</span>
          </Link>
        ) : (
          <Link
            href="/equipment"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Browse Equipment Fleet
          </Link>
        )}
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
        <CheckoutCancelContent />
      </Suspense>
    </div>
  )
}
