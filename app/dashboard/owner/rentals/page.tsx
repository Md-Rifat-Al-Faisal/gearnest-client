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
  Search,
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
import { Button } from "@/components/ui/button"

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
  rentalType?: string
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
  const limit = 8

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
      statusFilter === "all" ? true : (r.bookingStatus || "").toLowerCase() === statusFilter.toLowerCase()

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
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-accent-text" />
            Equipment Rental Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="owner-rentals-search"
            name="search"
            type="text"
            placeholder="Search by equipment, customer, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="owner-rentals-status" className="text-xs font-semibold text-muted-foreground">
            Status:
          </label>
          <select
            id="owner-rentals-status"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-border bg-surface text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground cursor-pointer"
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
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading equipment rentals...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="size-14 mx-auto rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">
              No Rental Reservations Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "No rentals match your current search and filter criteria. Try clearing filters."
                : "Your equipment has not received any active bookings yet. Ensure listings are approved and available."}
            </p>
          </div>
        ) : (
          <>
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-3">Equipment</th>
                    <th className="py-3 px-3">Customer & Dispatch Details</th>
                    <th className="py-3 px-3 whitespace-nowrap">Timeline</th>
                    <th className="py-3 px-3 whitespace-nowrap">Qty & Total</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedRentals.map((rental) => {
                    const isValidDate = (d?: string | null) => !!d && !isNaN(new Date(d).getTime())
                    const startFmt = isValidDate(rental.startDate)
                      ? new Date(rental.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })
                      : "Flexible"
                    const endFmt = isValidDate(rental.endDate)
                      ? new Date(rental.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })
                      : "Flexible"

                    const isProcessing = processingId === rental._id
                    const isActive = rental.bookingStatus === "active"

                    return (
                      <tr
                        key={rental._id}
                        className="odd:bg-surface even:bg-surface-2/40 hover:bg-surface-2 transition-colors"
                      >
                        {/* Equipment - 2 lines name */}
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="size-10 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border">
                              {rental.equipmentImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={rental.equipmentImage}
                                  alt={rental.equipmentName || "Equipment"}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-full p-2 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p
                                className="font-bold text-foreground text-xs leading-snug line-clamp-2"
                                title={rental.equipmentName || "Equipment Item"}
                              >
                                {rental.equipmentName || "Equipment Item"}
                              </p>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-muted-foreground border border-border">
                                {rental.category || "General"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer Info (Full display, clear and unwrapped) */}
                        <td className="py-3 px-3 align-top space-y-1">
                          <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                            <span>{rental.customerName || "Customer"}</span>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] leading-tight">
                            <Mail className="size-3 text-muted-foreground shrink-0" />
                            <span>{rental.customerEmail || "N/A"}</span>
                          </div>
                          {rental.contactNumber && (
                            <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                              <Phone className="size-3 text-muted-foreground shrink-0" />
                              <span>{rental.contactNumber}</span>
                            </div>
                          )}
                          {rental.deliveryAddress && (
                            <div className="text-muted-foreground flex items-start gap-1.5 text-[11px] leading-tight pt-0.5">
                              <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                              <span>{rental.deliveryAddress}</span>
                            </div>
                          )}
                        </td>

                        {/* Duration (2 Lines as requested) */}
                        <td className="py-3 px-3 align-top whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground text-xs">
                              {startFmt} – {endFmt}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="size-2.5 text-muted-foreground shrink-0" />
                              <span>
                                {rental.days ? `${rental.days} days` : "Standard"}{" "}
                                {rental.units ? `(${rental.units} ${(rental.rentalType || "day").toLowerCase()} unit)` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Qty & Price */}
                        <td className="py-3 px-3 align-top whitespace-nowrap space-y-1">
                          <div className="font-bold text-foreground text-xs sm:text-sm font-heading">
                            ${(rental.totalAmount ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {rental.quantity ?? 1} {(rental.quantity ?? 1) === 1 ? "unit" : "units"}
                          </div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rental.paymentStatus === "paid"
                                ? "bg-success/10 text-success border border-success/20"
                                : "bg-primary/10 text-accent-text border border-primary/20"
                            }`}
                          >
                            {(rental.paymentStatus || "pending").toUpperCase()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 align-top whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              rental.bookingStatus === "active"
                                ? "bg-success/10 text-success border border-success/20"
                                : rental.bookingStatus === "completed"
                                  ? "bg-primary/10 text-accent-text border border-primary/20"
                                  : rental.bookingStatus === "cancelled"
                                    ? "bg-danger/10 text-danger border border-danger/20"
                                    : "bg-surface-2 text-muted-foreground"
                            }`}
                          >
                            {rental.bookingStatus === "active" && <CheckCircle2 className="size-3" />}
                            {rental.bookingStatus === "completed" && <ShieldCheck className="size-3" />}
                            {rental.bookingStatus === "cancelled" && <XCircle className="size-3" />}
                            <span className="capitalize">{rental.bookingStatus || "pending"}</span>
                          </span>
                        </td>

                        {/* Action Controls */}
                        <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                          {isActive ? (
                            <div className="flex flex-col items-end gap-1">
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
                                className="w-full text-center px-2 py-1 rounded bg-success hover:opacity-90 text-band-foreground dark:text-primary-foreground font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
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
                                className="w-full text-center px-2 py-1 rounded bg-danger/10 hover:bg-danger/20 text-danger font-semibold text-[11px] border border-danger/20 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Cancel Rental
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">No actions needed</span>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-surface-2/40">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(page * limit, filteredRentals.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{filteredRentals.length}</span> rental records
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Button>
                  <div className="px-3 py-1.5 text-xs font-bold text-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.rental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-band/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  confirmModal.targetStatus === "completed"
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {confirmModal.targetStatus === "completed" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground font-heading">
                  {confirmModal.targetStatus === "completed"
                    ? "Complete Rental Order"
                    : "Cancel Rental Order"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Order ID: {confirmModal.rental._id}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {confirmModal.targetStatus === "completed"
                ? `Confirm that ${confirmModal.rental.equipmentName} has been safely inspected, returned by ${confirmModal.rental.customerName}, and restored to available inventory.`
                : `Are you sure you want to cancel this booking for ${confirmModal.rental.customerName}? Inventory will be restored.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ open: false, rental: null, targetStatus: null })}
              >
                Close
              </Button>
              <Button
                size="sm"
                variant={confirmModal.targetStatus === "completed" ? "default" : "danger"}
                onClick={handleStatusTransition}
                disabled={Boolean(processingId)}
              >
                {processingId ? "Updating..." : "Confirm Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
