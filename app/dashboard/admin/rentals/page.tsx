"use client"

import { useEffect, useState } from "react"
import {
  CalendarCheck2,
  Package,
  Search,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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
      statusFilter === "all" ? true : (r.bookingStatus || "").toLowerCase() === statusFilter.toLowerCase()

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
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-accent-text" />
            Platform Rental Operations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time oversight of all machinery bookings, equipment returns, and Stripe payment transactions
          </p>
        </div>

        {/* Quick KPI stats with .spec-line-kpi */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface border border-border text-right spec-line-kpi">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Active Leases
            </span>
            <span className="text-base font-bold text-success font-heading">
              {activeCount} Active
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-surface border border-border text-right spec-line-kpi">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Gross Volume
            </span>
            <span className="text-base font-bold text-accent-text font-heading">
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
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="admin-rentals-search"
            name="search"
            type="text"
            placeholder="Search by equipment, customer, or fleet owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-rentals-status" className="text-xs font-semibold text-muted-foreground">
            Booking Status:
          </label>
          <select
            id="admin-rentals-status"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-border bg-surface text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground cursor-pointer"
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
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading system reservations...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="size-10 mx-auto text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground font-heading">No Rentals Recorded</h3>
            <p className="text-xs text-muted-foreground">No rental reservations match the selected search or filter.</p>
          </div>
        ) : (
          <>
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Equipment Listing</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Fleet Owner</th>
                    <th className="py-3 px-4 whitespace-nowrap">Duration & Units</th>
                    <th className="py-3 px-4 whitespace-nowrap">Total & Payment</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedRentals.map((rental) => {
                    const startFmt = new Date(rental.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })
                    const endFmt = new Date(rental.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })

                    const statusStyle =
                      rental.bookingStatus === "active"
                        ? "bg-success/10 text-success border-success/20"
                        : rental.bookingStatus === "completed"
                          ? "bg-primary/10 text-accent-text border-primary/20"
                          : rental.bookingStatus === "cancelled"
                            ? "bg-danger/10 text-danger border-danger/20"
                            : "bg-surface-2 text-muted-foreground border-border"

                    return (
                      <tr
                        key={rental._id}
                        className="odd:bg-surface even:bg-surface-2/40 hover:bg-surface-2 transition-colors"
                      >
                        {/* Equipment */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="size-10 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border">
                              {rental.equipmentImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={rental.equipmentImage}
                                  alt={rental.equipmentName}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-full p-2 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-foreground line-clamp-2 leading-snug">
                                {rental.equipmentName}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {rental.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 align-top space-y-0.5">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <User className="size-3 text-muted-foreground" />
                            <span>{rental.customerName || "Customer"}</span>
                          </div>
                          <div className="text-muted-foreground text-[11px]">{rental.customerEmail}</div>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4 align-top space-y-0.5">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <Building className="size-3 text-muted-foreground" />
                            <span>{rental.ownerName || "Partner"}</span>
                          </div>
                          <div className="text-muted-foreground text-[11px]">{rental.ownerEmail || "owner@gearnest.com"}</div>
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 align-top space-y-0.5 whitespace-nowrap">
                          <div className="font-medium text-foreground">
                            {startFmt} – {endFmt}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {rental.days} days ({rental.quantity} {rental.quantity === 1 ? "unit" : "units"})
                          </div>
                        </td>

                        {/* Total & Payment */}
                        <td className="py-3.5 px-4 align-top space-y-1 whitespace-nowrap">
                          <div className="font-bold text-foreground text-sm font-heading">
                            ${rental.totalAmount.toLocaleString()}
                          </div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              rental.paymentStatus === "paid"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-primary/10 text-accent-text border-primary/20"
                            }`}
                          >
                            {(rental.paymentStatus || "pending").toUpperCase()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${statusStyle}`}
                          >
                            {rental.bookingStatus}
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
    </div>
  )
}
