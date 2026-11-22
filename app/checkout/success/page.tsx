"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  CalendarCheck2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
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
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-bold text-foreground font-heading">
          Verifying Stripe Payment...
        </h2>
        <p className="text-xs text-muted-foreground">
          Verifying your booking transaction and confirming equipment reservation. Please do not close this window.
        </p>
      </div>
    )
  }

  if (errorMessage && !success) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-5 rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="h-14 w-14 rounded-xl bg-danger/10 text-danger flex items-center justify-center mx-auto border border-danger/20">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Verification Notice</h2>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="default">
            <Link href="/dashboard/customer/rentals">
              Check Rental Status
            </Link>
          </Button>
          <Button variant="outline" asChild size="default">
            <Link href="/equipment">
              Return to Fleet
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
      {/* Success Card */}
      <div className="p-8 sm:p-10 rounded-xl border border-border bg-surface text-center space-y-6 shadow-md">
        <div className="h-16 w-16 rounded-xl bg-success/10 text-success border border-success/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
            Payment Complete • Rental Activated
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading mt-1">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            Your payment was processed securely via Stripe. Your reservation is confirmed and recorded in your customer dashboard.
          </p>
        </div>

        {/* Receipt metadata box */}
        <div className="p-4 rounded-lg bg-surface-2 border border-border text-left text-xs space-y-2">
          {bookingId && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking Reference:</span>
              <span className="font-mono font-bold text-foreground truncate max-w-[200px]">
                {bookingId}
              </span>
            </div>
          )}
          {transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-accent-text font-bold truncate max-w-[200px]">
                {transactionId}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Security:</span>
            <span className="font-semibold text-success flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Encrypted via Stripe
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="default">
            <Link
              href="/dashboard/customer/rentals"
              className="flex items-center justify-center gap-2"
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>View in My Rentals</span>
            </Link>
          </Button>
          <Button variant="outline" asChild size="default">
            <Link href="/equipment">
              Browse More Fleet
            </Link>
          </Button>
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
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">Loading confirmation...</p>
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  )
}
