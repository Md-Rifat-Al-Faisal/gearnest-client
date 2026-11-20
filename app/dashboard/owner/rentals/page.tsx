"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CalendarCheck2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  CreditCard,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

interface OwnerRental {
  _id: string
  equipmentId: string
  equipmentName: string
  equipmentImage: string
  category: string
  customerId: string
  customerName: string
  customerEmail: string
  contactNumber?: string
  deliveryAddress?: string
  notes?: string
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

export default function OwnerRentalsPage() {
  const [rentals, setRentals] = useState<OwnerRental[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 6

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    rental: OwnerRental | null
    targetStatus: "completed" | "cancelled" | null
  }>({
    open: false,
    rental: null,
    targetStatus: null,
  })

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/owner/rentals")
      const data = await res.json()

      if (res.ok && data.rentals) {
        setRentals(data.rentals)
      } else {
        toast.error(data.message || "Failed to load rental orders")
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

  const handleStatusTransition = async () => {
    if (!confirmModal.rental || !confirmModal.targetStatus) return

    const { _id } = confirmModal.rental
    const target = confirmModal.targetStatus

    try {
      setProcessingId(_id)
      const res = await apiRequest(`/api/owner/rentals/${_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: target }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(data.message || `Rental marked as ${target}`)
        setRentals((prev) =>
          prev.map((r) => (r._id === _id ? { ...r, bookingStatus: target } : r))
        )
      } else {
        toast.error(data.message || "Failed to update rental status")
      }
    } catch {
      toast.error("Network error updating status")
    } finally {
      setProcessingId(null)
      setConfirmModal({ open: false, rental: null, targetStatus: null })
    }
  }

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
      r.category?.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredRentals.length / limit) || 1
  const paginatedRentals = filteredRentals.slice((page - 1) * limit, page * limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-amber-500" />
            Equipment Rental Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your fleet bookings, customer dispatches, and inventory return workflows
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="owner-rentals-search" className="sr-only">
            Search orders
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="owner-rentals-search"
            name="search"
            type="text"
            placeholder="Search by equipment, customer, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="owner-rentals-status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Status:
          </label>
          <select
            id="owner-rentals-status"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses ({rentals.length})</option>
            <option value="active">Active Rentals</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading equipment rentals...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="size-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Rental Reservations Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "No rentals match your current search and filter criteria. Try clearing filters."
                : "Your equipment has not received any active bookings yet. Ensure listings are approved and available."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Equipment & Machinery</th>
                  <th className="py-3 px-4">Customer & Dispatch Details</th>
                  <th className="py-3 px-4">Rental Duration</th>
                  <th className="py-3 px-4">Qty & Total</th>
                  <th className="py-3 px-4">Booking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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

                  const isProcessing = processingId === rental._id
                  const isActive = rental.bookingStatus === "active"

                  return (
                    <tr key={rental._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Equipment */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="size-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            {rental.equipmentImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={rental.equipmentImage}
                                alt={rental.equipmentName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Package className="size-full p-3 text-slate-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {rental.equipmentName}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {rental.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="size-3.5 text-slate-400" />
                          <span>{rental.customerName || "Customer"}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3 text-slate-400" />
                          <span>{rental.customerEmail}</span>
                        </div>
                        {rental.contactNumber && (
                          <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                            <Phone className="size-3 text-slate-400" />
                            <span>{rental.contactNumber}</span>
                          </div>
                        )}
                        {rental.deliveryAddress && (
                          <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                            <MapPin className="size-3 text-slate-400" />
                            <span className="line-clamp-1">{rental.deliveryAddress}</span>
                          </div>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {startFmt} – {endFmt}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          <span>
                            {rental.days} {rental.days === 1 ? "day" : "days"} ({rental.units}{" "}
                            {rental.rentalType.toLowerCase()} unit)
                          </span>
                        </div>
                      </td>

                      {/* Qty & Price */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          ${rental.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rental.quantity} {rental.quantity === 1 ? "unit" : "units"}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            rental.paymentStatus === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {rental.paymentStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            rental.bookingStatus === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : rental.bookingStatus === "completed"
                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                : rental.bookingStatus === "cancelled"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                          }`}
                        >
                          {rental.bookingStatus === "active" && <CheckCircle2 className="size-3.5" />}
                          {rental.bookingStatus === "completed" && <ShieldCheck className="size-3.5" />}
                          {rental.bookingStatus === "cancelled" && <XCircle className="size-3.5" />}
                          <span className="capitalize">{rental.bookingStatus}</span>
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-4 align-top text-right space-y-1.5">
                        {isActive ? (
                          <div className="flex flex-col sm:flex-row items-end justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  rental,
                                  targetStatus: "completed",
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? "Processing..." : "Mark Completed"}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  rental,
                                  targetStatus: "cancelled",
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 font-semibold text-[11px] border border-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Cancel Rental
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No actions needed</span>
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
                  {Math.min(page * limit, filteredRentals.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-900 dark:text-white">{filteredRentals.length}</span> rental records
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

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.rental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmModal.targetStatus === "completed"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-rose-500/10 text-rose-600"
                }`}
              >
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {confirmModal.targetStatus === "completed"
                    ? "Complete Rental & Restore Stock"
                    : "Cancel Rental & Return Inventory"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirmation required for equipment order #{confirmModal.rental._id.slice(-6)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to transition this booking to{" "}
              <strong className="capitalize">{confirmModal.targetStatus}</strong>?{" "}
              {confirmModal.rental.quantity} unit(s) of <strong>{confirmModal.rental.equipmentName}</strong> will
              be automatically restored to your available inventory stock.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, rental: null, targetStatus: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusTransition}
                disabled={Boolean(processingId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  confirmModal.targetStatus === "completed"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                {processingId ? "Updating..." : "Confirm & Restore Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
