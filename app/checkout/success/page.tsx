"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  CalendarCheck2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")

  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        setErrorMessage("No checkout session ID found in request.")
        setVerifying(false)
        return
      }

      try {
        setVerifying(true)
        const res = await apiRequest("/api/bookings/verify", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSuccess(true)
          setBookingId(data.bookingId)
          setTransactionId(data.transactionId)
          toast.success("Payment verified! Your rental booking is officially active.")
        } else {
          setErrorMessage(data.message || "Unable to verify payment with Stripe")
          toast.error(data.message || "Payment verification failed")
        }
      } catch (err: any) {
        console.error("Verification error:", err)
        setErrorMessage("Network error while verifying payment receipt.")
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (verifying) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Verifying Stripe Payment...
        </h2>
        <p className="text-xs text-slate-500">
          Verifying your booking transaction and confirming equipment reservation. Please do not close this window.
        </p>
      </div>
    )
  }

  if (errorMessage && !success) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verification Notice</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{errorMessage}</p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/customer/rentals"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
          >
            Check Rental Status
          </Link>
          <Link
            href="/equipment"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Return to Fleet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      {/* Success Card */}
      <div className="p-8 sm:p-10 rounded-3xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-center space-y-6 shadow-xl">
        <div className="h-20 w-20 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Complete • Rental Activated
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto">
            Your payment was processed securely via Stripe. Your reservation is confirmed and recorded in your customer dashboard.
          </p>
        </div>

        {/* Receipt metadata box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
          {bookingId && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Booking Reference:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {bookingId}
              </span>
            </div>
          )}
          {transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[200px]">
                {transactionId}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Payment Security:</span>
            <span className="font-semibold text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Encrypted via Stripe
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/customer/rentals"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <CalendarCheck2 className="h-4 w-4 stroke-[2.5]" />
            <span>View in My Rentals</span>
          </Link>
          <Link
            href="/equipment"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            Browse More Fleet
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading confirmation...</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  )
}
