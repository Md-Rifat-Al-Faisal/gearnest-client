"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Boxes,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  Package,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface AdminEquipmentItem {
  _id: string
  name: string
  description: string
  category: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
  condition: string
  brand: string
  model: string
  location: string
  image: string
  status: "Pending" | "Approved" | "Rejected"
  ownerId: string
  ownerName: string
  ownerEmail: string
  createdAt: string
}

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<AdminEquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<AdminEquipmentItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (statusFilter !== "all") query.set("status", statusFilter)
      if (search.trim()) query.set("search", search.trim())

      const res = await apiRequest(`/api/admin/equipment?${query.toString()}`)
      const data = await res.json()

      if (res.ok && data.equipment) {
        setEquipment(data.equipment)
      } else {
        toast.error(data.message || "Failed to load equipment catalog")
      }
    } catch {
      toast.error("Network error while loading equipment for administration")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEquipment()
  }

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Rejected") => {
    try {
      setUpdatingId(id)
      const res = await apiRequest(`/api/admin/equipment/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(`Equipment status updated to ${newStatus}`)
        setEquipment((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        )
      } else {
        toast.error(data.message || "Failed to update status")
      }
    } catch {
      toast.error("Network error while updating equipment status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (item: AdminEquipmentItem) => {
    try {
      setDeletingId(item._id)
      const res = await apiRequest(`/api/admin/equipment/${item._id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(`"${item.name}" deleted from platform`)
        setEquipment((prev) => prev.filter((e) => e._id !== item._id))
        setItemToDelete(null)
      } else {
        toast.error(data.message || "Failed to delete equipment listing")
      }
    } catch {
      toast.error("Network error while attempting deletion")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Boxes className="h-6 w-6 text-accent-text" />
          Equipment Fleet Moderation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, approve, or reject equipment listings submitted by partners before publication
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <label htmlFor="admin-equipment-search" className="sr-only">
            Search equipment
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="admin-equipment-search"
            name="search"
            type="text"
            placeholder="Search by title, owner, category, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-status-filter" className="text-xs font-semibold text-muted-foreground">
            Moderation Status:
          </label>
          <select
            id="admin-status-filter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-border bg-surface text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground cursor-pointer"
          >
            <option value="all">All ({equipment.length})</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading platform inventory...</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="h-14 w-14 rounded-full bg-surface-2 text-muted-foreground flex items-center justify-center mx-auto mb-4 border border-border">
              <Boxes className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground font-heading">No listings found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              No equipment matched your active moderation status or search query.
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile Cards View (< md) */}
            <div className="md:hidden divide-y divide-border">
              {equipment.map((item) => (
                <div key={item._id} className="p-4 space-y-3 bg-surface hover:bg-surface-2/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
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
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link
                        href={`/equipment/${item._id}`}
                        className="font-semibold text-foreground hover:text-accent-text text-sm line-clamp-2 leading-snug transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.brand} {item.model && `· ${item.model}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-foreground border border-border">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.location || "Location unlisted"}
                      </span>
                    </div>
                    <div className="font-bold text-foreground font-heading">
                      ${item.rentalPrice} <span className="text-[10px] font-normal text-muted-foreground">/{item.rentalType?.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border/60">
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      <span className="font-medium text-foreground">{item.ownerName || "Equipment Owner"}</span> · {item.ownerEmail}
                    </div>
                    <div>
                      {item.status === "Approved" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </span>
                      ) : item.status === "Pending" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-accent-text border border-primary/20">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger border border-danger/20">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions on Mobile */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item._id, "Approved")}
                        disabled={updatingId === item._id || item.status === "Approved"}
                        title="Approve Equipment"
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-success hover:opacity-90 disabled:opacity-30 text-band-foreground dark:text-primary-foreground transition-opacity cursor-pointer"
                      >
                        {updatingId === item._id ? "..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item._id, "Rejected")}
                        disabled={updatingId === item._id || item.status === "Rejected"}
                        title="Reject Equipment"
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-danger hover:opacity-90 disabled:opacity-30 text-band-foreground dark:text-primary-foreground transition-opacity cursor-pointer"
                      >
                        {updatingId === item._id ? "..." : "Reject"}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/equipment/${item._id}`}
                        title="View Catalog Page"
                        className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/admin/equipment/${item._id}/edit`}
                        title="Edit Equipment"
                        className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-accent-text"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        disabled={deletingId === item._id}
                        title="Delete Equipment"
                        className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="w-[24%] py-2.5 px-2.5">Equipment</th>
                    <th className="w-[14%] py-2.5 px-2">Category & Location</th>
                    <th className="w-[17%] py-2.5 px-2">Partner / Owner</th>
                    <th className="w-[9%] py-2.5 px-2 whitespace-nowrap">Rate</th>
                    <th className="w-[11%] py-2.5 px-2 text-center whitespace-nowrap">Status</th>
                    <th className="w-[13%] py-2.5 px-2 text-center whitespace-nowrap">Moderation</th>
                    <th className="w-[12%] py-2.5 px-2 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {equipment.map((item) => (
                    <tr
                      key={item._id}
                      className="odd:bg-surface even:bg-surface-2/40 hover:bg-surface-2 transition-colors"
                    >
                      <td className="py-2.5 px-2.5">
                        <div className="flex items-start gap-2">
                          <div className="h-9 w-9 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <Link
                              href={`/equipment/${item._id}`}
                              className="font-semibold text-foreground hover:text-accent-text text-xs line-clamp-2 leading-tight transition-colors"
                              title={item.name}
                            >
                              {item.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                              {item.brand} {item.model && `· ${item.model}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-foreground border border-border max-w-full">
                          {item.category}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {item.location || "Location unlisted"}
                        </p>
                      </td>

                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-5 w-5 rounded-full bg-surface-2 flex items-center justify-center text-[10px] text-foreground font-bold shrink-0 border border-border">
                            {item.ownerName ? item.ownerName.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                              {item.ownerName || "Equipment Owner"}
                            </p>
                            <p className="text-[10px] text-muted-foreground break-all leading-tight">
                              {item.ownerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <div className="font-bold text-xs text-foreground font-heading">
                          ${item.rentalPrice}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          /{item.rentalType?.toLowerCase()}
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {item.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </span>
                        ) : item.status === "Pending" ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-accent-text border border-primary/20">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger/10 text-danger border border-danger/20">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item._id, "Approved")}
                            disabled={updatingId === item._id || item.status === "Approved"}
                            title="Approve Equipment for Public Catalog"
                            className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-success hover:opacity-90 disabled:opacity-30 text-band-foreground dark:text-primary-foreground transition-opacity cursor-pointer"
                          >
                            {updatingId === item._id ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item._id, "Rejected")}
                            disabled={updatingId === item._id || item.status === "Rejected"}
                            title="Reject Equipment Listing"
                            className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-danger hover:opacity-90 disabled:opacity-30 text-band-foreground dark:text-primary-foreground transition-opacity cursor-pointer"
                          >
                            {updatingId === item._id ? "..." : "Reject"}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            href={`/equipment/${item._id}`}
                            title="View Catalog Page"
                            className="p-1 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/dashboard/admin/equipment/${item._id}/edit`}
                            title="Edit Equipment Specifications"
                            className="p-1 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-accent-text transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            disabled={deletingId === item._id}
                            title="Delete Equipment"
                            className="p-1 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-band/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center shrink-0 border border-danger/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground font-heading">Admin Deletion</h3>
                <p className="text-xs text-muted-foreground">Permanently delete equipment listing</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">&ldquo;{itemToDelete.name}&rdquo;</strong>? If there are active rental bookings, this deletion will be automatically blocked by the platform.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItemToDelete(null)}
                disabled={deletingId === itemToDelete._id}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(itemToDelete)}
                disabled={deletingId === itemToDelete._id}
              >
                {deletingId === itemToDelete._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Listing</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
