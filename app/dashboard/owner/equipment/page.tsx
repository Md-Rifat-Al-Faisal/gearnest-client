"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface EquipmentItem {
  _id: string
  name: string
  description: string
  category: string
  rentalPrice: number
  rentalType?: string
  availableQuantity: number
  condition: string
  brand: string
  model: string
  image: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

export default function OwnerEquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<EquipmentItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/owner/equipment")
      const data = await res.json()
      if (res.ok && data.equipment) {
        setEquipment(data.equipment)
      } else {
        toast.error(data.message || "Failed to load equipment list")
      }
    } catch {
      toast.error("Network error while connecting to GearNest server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const handleDelete = async (item: EquipmentItem) => {
    try {
      setDeletingId(item._id)
      const res = await apiRequest(`/api/owner/equipment/${item._id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(`"${item.name}" deleted successfully`)
        setEquipment((prev) => prev.filter((eq) => eq._id !== item._id))
        setItemToDelete(null)
      } else {
        toast.error(data.message || "Cannot delete equipment")
      }
    } catch {
      toast.error("Failed to delete equipment. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredEquipment = equipment.filter((item) => {
    const term = search.toLowerCase()
    const matchesSearch =
      (item.name || "").toLowerCase().includes(term) ||
      (item.brand || "").toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term)
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage) || 1
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalCount = equipment.length
  const approvedCount = equipment.filter((e) => e.status === "Approved").length
  const pendingCount = equipment.filter((e) => e.status === "Pending").length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
            Equipment Fleet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your machinery inventory, listing status, and rental terms.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/dashboard/owner/equipment/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Equipment</span>
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="spec-line-kpi p-5 rounded-xl border border-border bg-surface shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">{totalCount}</p>
        </div>
        <div className="spec-line-kpi p-5 rounded-xl border border-border bg-surface shadow-xs">
          <p className="text-xs font-semibold text-success uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved & Live
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">{approvedCount}</p>
        </div>
        <div className="spec-line-kpi p-5 rounded-xl border border-border bg-surface shadow-xs">
          <p className="text-xs font-semibold text-warning-text uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Approval
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="owner-equipment-search" className="sr-only">
            Search my equipment
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="owner-equipment-search"
            name="search"
            type="text"
            placeholder="Search by equipment name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="owner-status-filter" className="text-xs font-medium text-muted-foreground">
            Status:
          </label>
          <select
            id="owner-status-filter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your equipment inventory...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Boxes className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold font-heading text-foreground">No equipment found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {equipment.length === 0
                ? "You haven't listed any equipment yet. Click below to add your first machine."
                : "No items match your active search or filter criteria."}
            </p>
            {equipment.length === 0 && (
              <Button asChild className="mt-5">
                <Link href="/dashboard/owner/equipment/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>List Equipment Now</span>
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-3">Equipment</TableHead>
                    <TableHead className="py-3 px-3">Category</TableHead>
                    <TableHead className="py-3 px-3">Rental Rate</TableHead>
                    <TableHead className="py-3 px-3 text-center">Stock</TableHead>
                    <TableHead className="py-3 px-3 text-center">Status</TableHead>
                    <TableHead className="py-3 px-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEquipment.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[220px] sm:max-w-[280px]">
                            <p className="font-semibold text-foreground line-clamp-2 leading-snug">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {item.brand} {item.model && `• ${item.model}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-muted-foreground">
                        <Badge variant="outline">
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-3 font-semibold text-foreground">
                        ${item.rentalPrice}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          / {(item.rentalType || "day").toLowerCase()}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center">
                        {item.availableQuantity > 0 ? (
                          <Badge variant="success">
                            {item.availableQuantity} available
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Out of stock
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center">
                        {item.status === "Approved" ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        ) : item.status === "Pending" ? (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View Catalog Page"
                            className="size-8 text-muted-foreground hover:text-foreground"
                          >
                            <Link href={`/equipment/${item._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Edit Equipment"
                            className="size-8 text-muted-foreground hover:text-accent-text"
                          >
                            <Link href={`/dashboard/owner/equipment/${item._id}/edit`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete(item)}
                            title="Delete Equipment"
                            className="size-8 text-muted-foreground hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-2/40">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(currentPage * itemsPerPage, filteredEquipment.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filteredEquipment.length}
                  </span>{" "}
                  equipment listings
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </Button>

                  <span className="text-xs font-medium text-muted-foreground px-1">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-band/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <div className="h-10 w-10 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold font-heading text-lg text-foreground">Delete Equipment?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">&quot;{itemToDelete.name}&quot;</strong>? If there are any
              active rental bookings for this equipment, deletion will be blocked to protect ongoing rentals.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setItemToDelete(null)}
                disabled={deletingId === itemToDelete._id}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(itemToDelete)}
                disabled={deletingId === itemToDelete._id}
              >
                {deletingId === itemToDelete._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
