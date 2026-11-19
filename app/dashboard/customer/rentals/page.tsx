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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Rental Duration</th>
                  <th className="py-3.5 px-4">Booking Date</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                  <th className="py-3.5 px-4 text-center">Rental Status</th>
                  <th className="py-3.5 px-4 text-right">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {rentals.map((r) => {
                  const startDateFormatted = new Date(r.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  const endDateFormatted = new Date(r.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  const bookedDateFormatted = new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

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
                            {r.quantity > 1 && (
                              <span className="text-[11px] text-amber-500 font-bold">
                                Quantity: {r.quantity} machines
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {startDateFormatted} — {endDateFormatted}
                        </div>
                        <p className="text-slate-400 mt-0.5">
                          {r.days} {r.days === 1 ? "day" : "days"} ({r.units} {r.rentalType?.toLowerCase()} units)
                        </p>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {bookedDateFormatted}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {r.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                        {r.transactionId && (
                          <p className="text-[10px] text-slate-400 mt-1 font-mono truncate max-w-[120px] mx-auto">
                            {r.transactionId}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {r.bookingStatus === "active" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active Rental
                          </span>
                        ) : r.bookingStatus === "pending" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pending Dispatch
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

                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white">
                          ${r.totalAmount}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
