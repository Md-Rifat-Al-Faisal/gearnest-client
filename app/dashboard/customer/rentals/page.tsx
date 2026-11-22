"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CalendarCheck2,
  Package,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

interface CustomerRental {
  _id: string
  equipmentId: string
  equipmentName: string
  equipmentImage: string
  category: string
  ownerName: string
  startDate: string
  endDate: string
  days: number
  units: number
  rentalType: string
  quantity: number
  totalAmount: number
  paymentStatus: "paid" | "pending" | "failed"
  bookingStatus: "active" | "pending" | "completed" | "cancelled"
  transactionId?: string
  createdAt: string
}

export default function CustomerRentalsPage() {
  const [rentals, setRentals] = useState<CustomerRental[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 5

  const totalPages = Math.ceil(rentals.length / limit) || 1
  const paginatedRentals = rentals.slice((page - 1) * limit, page * limit)

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/customer/rentals")
      const data = await res.json()

      if (res.ok && data.rentals) {
        setRentals(data.rentals)
      } else {
        toast.error(data.message || "Failed to load rental history")
      }
    } catch {
      toast.error("Network error while connecting to GearNest")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this pending reservation?")) return
    try {
      const res = await apiRequest(`/api/customer/rentals/${bookingId}/cancel`, {
        method: "PATCH",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Reservation cancelled successfully")
        fetchRentals()
      } else {
        toast.error(data.message || "Failed to cancel reservation")
      }
    } catch {
      toast.error("Network error while cancelling reservation")
    }
  }

  const handlePayNow = async (r: CustomerRental) => {
    try {
      toast.info("Preparing Stripe Checkout session...")
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: r._id,
          equipmentId: r.equipmentId,
          startDate: r.startDate,
          endDate: r.endDate,
          quantity: r.quantity || 1,
        }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Unable to initialize payment session")
      }
    } catch {
      toast.error("Network error while connecting to payment checkout")
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Equipment Rentals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your reserved machinery, active job-site contracts, and Stripe payment receipts.
          </p>
        </div>

        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <span>Rent More Equipment</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Rentals Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Loading your rental contracts...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No rental bookings yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't reserved any machinery yet. Explore our equipment fleet and book online with Stripe protection.
            </p>
            <Link
              href="/equipment"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              <span>Explore Fleet Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-3">Start Date</th>
                  <th className="py-3.5 px-3">End Date</th>
                  <th className="py-3.5 px-3">Units & Qty</th>
                  <th className="py-3.5 px-3">Booked</th>
                  <th className="py-3.5 px-3 text-center">Payment</th>
                  <th className="py-3.5 px-3 text-center">Rental Status</th>
                  <th className="py-3.5 px-3 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {paginatedRentals.map((r) => {
                  const startDateFormatted = new Date(r.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                  const endDateFormatted = new Date(r.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                  const bookedDateFormatted = new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  const isPendingPayment = r.paymentStatus === "pending" && r.bookingStatus !== "cancelled"

                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {r.equipmentImage ? (
                              <img
                                src={r.equipmentImage}
                                alt={r.equipmentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/equipment/${r.equipmentId}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-1"
                            >
                              {r.equipmentName}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {r.category} • Partner: {r.ownerName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {startDateFormatted}
                      </td>

                      <td className="py-4 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {endDateFormatted}
                      </td>

                      <td className="py-4 px-3 text-xs text-slate-600 dark:text-slate-300">
                        <span>{r.days}d ({r.units} {r.rentalType?.toLowerCase()})</span>
                        <span className="block text-[11px] text-slate-400">x{r.quantity} machine{r.quantity > 1 ? "s" : ""}</span>
                      </td>

                      <td className="py-4 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {bookedDateFormatted}
                      </td>

                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {r.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Unpaid
                          </span>
                        )}
                        {r.transactionId && (
                          <p className="text-[10px] text-slate-400 mt-1 font-mono truncate max-w-[100px] mx-auto">
                            {r.transactionId}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {r.bookingStatus === "active" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        ) : r.bookingStatus === "pending" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        ) : r.bookingStatus === "completed" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            Cancelled
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          ${r.totalAmount}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {r.paymentStatus === "paid" ? "Paid" : "Due"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isPendingPayment ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePayNow(r)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Pay Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(r._id)}
                              className="px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={`/equipment/${r.equipmentId}`}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                          >
                            View Item
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {Math.min(page * limit, rentals.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-white">{rentals.length}</span> rental records
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <div className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
