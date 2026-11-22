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
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
            My Equipment Rentals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your reserved machinery, active job-site contracts, and Stripe payment receipts.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/equipment" className="flex items-center gap-2">
            <span>Rent More Equipment</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Rentals Table Card */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your rental contracts...</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <CalendarCheck2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold font-heading text-foreground">No rental bookings yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              You haven't reserved any machinery yet. Explore our equipment fleet and book online with Stripe protection.
            </p>
            <Button asChild className="mt-5">
              <Link href="/equipment" className="flex items-center gap-2">
                <span>Explore Fleet Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 px-4">Equipment</TableHead>
                  <TableHead className="py-3.5 px-3">Start Date</TableHead>
                  <TableHead className="py-3.5 px-3">End Date</TableHead>
                  <TableHead className="py-3.5 px-3">Units & Qty</TableHead>
                  <TableHead className="py-3.5 px-3">Booked</TableHead>
                  <TableHead className="py-3.5 px-3 text-center">Payment</TableHead>
                  <TableHead className="py-3.5 px-3 text-center">Rental Status</TableHead>
                  <TableHead className="py-3.5 px-3 text-right">Amount</TableHead>
                  <TableHead className="py-3.5 px-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                    <TableRow key={r._id}>
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
                            {r.equipmentImage ? (
                              <img
                                src={r.equipmentImage}
                                alt={r.equipmentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/equipment/${r.equipmentId}`}
                              className="font-semibold text-foreground hover:text-accent-text transition-colors line-clamp-1"
                            >
                              {r.equipmentName}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {r.category} • Partner: {r.ownerName}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-3 text-xs font-semibold text-foreground whitespace-nowrap">
                        {startDateFormatted}
                      </TableCell>

                      <TableCell className="py-4 px-3 text-xs font-semibold text-foreground whitespace-nowrap">
                        {endDateFormatted}
                      </TableCell>

                      <TableCell className="py-4 px-3 text-xs text-muted-foreground">
                        <span>{r.days}d ({r.units} {r.rentalType?.toLowerCase()})</span>
                        <span className="block text-[11px] text-muted-foreground">x{r.quantity} machine{r.quantity > 1 ? "s" : ""}</span>
                      </TableCell>

                      <TableCell className="py-4 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {bookedDateFormatted}
                      </TableCell>

                      <TableCell className="py-4 px-3 text-center whitespace-nowrap">
                        {r.paymentStatus === "paid" ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3" />
                            Unpaid
                          </Badge>
                        )}
                        {r.transactionId && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate max-w-[100px] mx-auto">
                            {r.transactionId}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="py-4 px-3 text-center whitespace-nowrap">
                        {r.bookingStatus === "active" ? (
                          <Badge variant="success">Active</Badge>
                        ) : r.bookingStatus === "pending" ? (
                          <Badge variant="warning">Pending</Badge>
                        ) : r.bookingStatus === "completed" ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="font-extrabold text-sm text-foreground">
                          ${r.totalAmount}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {r.paymentStatus === "paid" ? "Paid" : "Due"}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                        {isPendingPayment ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handlePayNow(r)}
                            >
                              Pay Now
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelBooking(r._id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Link
                            href={`/equipment/${r.equipmentId}`}
                            className="text-xs text-accent-text hover:underline font-semibold"
                          >
                            View Item
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3.5 bg-surface-2/40">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * limit, rentals.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{rentals.length}</span> rental records
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
                <div className="px-3 py-1.5 text-xs font-bold text-foreground">
                  Page {page} of {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
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
