"use client"

import { useEffect, useState } from "react"
import {
  CalendarCheck2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  CreditCard,
  Search,
  User,
  ShieldCheck,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

interface AdminRental {
  _id: string
  equipmentId: string
  equipmentName: string
  equipmentImage: string
  category: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  customerId: string
  customerName: string
  customerEmail: string
  contactNumber?: string
  deliveryAddress?: string
  startDate: string
  endDate: string
  days: number
  units: number
  rentalType: string
  rentalPrice: number
  quantity: number
  totalAmount: number
  paymentStatus: "paid" | "pending" | "failed"
  bookingStatus: "active" | "pending" | "completed" | "cancelled"
  transactionId?: string
  createdAt: string
}

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<AdminRental[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 8

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/admin/rentals")
      const data = await res.json()

      if (res.ok && data.rentals) {
        setRentals(data.rentals)
      } else {
        toast.error(data.message || "Failed to load platform rentals")
      }
    } catch {
      toast.error("Network error fetching rental bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [])

  // Filter rentals
  const filteredRentals = rentals.filter((r) => {
    const matchesStatus =
      statusFilter === "all" ? true : r.bookingStatus.toLowerCase() === statusFilter.toLowerCase()

    const term = search.toLowerCase().trim()
    const matchesSearch =
      !term ||
      r.equipmentName?.toLowerCase().includes(term) ||
      r.customerName?.toLowerCase().includes(term) ||
      r.customerEmail?.toLowerCase().includes(term) ||
      r.ownerName?.toLowerCase().includes(term) ||
      r.ownerEmail?.toLowerCase().includes(term) ||
      r.category?.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredRentals.length / limit) || 1
  const paginatedRentals = filteredRentals.slice((page - 1) * limit, page * limit)

  // Aggregate stats
  const totalVolume = rentals.reduce((acc, r) => acc + (r.totalAmount || 0), 0)
  const activeCount = rentals.filter((r) => r.bookingStatus === "active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-amber-500" />
            Platform Rental Operations
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time oversight of all machinery bookings, equipment returns, and Stripe payment transactions
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Leases
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeCount} Active
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Gross Volume
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              ${totalVolume.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="admin-rentals-search" className="sr-only">
            Search all rentals
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="admin-rentals-search"
            name="search"
            type="text"
            placeholder="Search by equipment, customer, or fleet owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-rentals-status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Booking Status:
          </label>
          <select
            id="admin-rentals-status"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses ({rentals.length})</option>
            <option value="active">Active Rentals</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading system reservations...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="size-10 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Rentals Recorded</h3>
            <p className="text-xs text-slate-500">No rental reservations match the selected search or filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Equipment Listing</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fleet Owner</th>
                  <th className="py-3 px-4">Duration & Units</th>
                  <th className="py-3 px-4">Total & Payment</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedRentals.map((rental) => {
                  const startFmt = new Date(rental.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  const endFmt = new Date(rental.endDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  const statusStyle =
                    rental.bookingStatus === "active"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : rental.bookingStatus === "completed"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : rental.bookingStatus === "cancelled"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"

                  return (
                    <tr key={rental._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Equipment */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="size-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            {rental.equipmentImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={rental.equipmentImage}
                                alt={rental.equipmentName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Package className="size-full p-2 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {rental.equipmentName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {rental.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="size-3 text-slate-400" />
                          <span>{rental.customerName || "Customer"}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">{rental.customerEmail}</div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building className="size-3 text-slate-400" />
                          <span>{rental.ownerName || "Partner"}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">{rental.ownerEmail || "owner@gearnest.com"}</div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {startFmt} – {endFmt}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rental.days} days ({rental.quantity} {rental.quantity === 1 ? "unit" : "units"})
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          ${rental.totalAmount.toLocaleString()}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            rental.paymentStatus === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {rental.paymentStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle}`}
                        >
                          {rental.bookingStatus === "active" && <CheckCircle2 className="size-3" />}
                          {rental.bookingStatus === "completed" && <ShieldCheck className="size-3" />}
                          {rental.bookingStatus === "cancelled" && <XCircle className="size-3" />}
                          <span className="capitalize">{rental.bookingStatus}</span>
                        </span>
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
                  {Math.min(page * limit, filteredRentals.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-white">{filteredRentals.length}</span> platform bookings
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
