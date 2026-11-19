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
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

interface EquipmentItem {
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
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCount = equipment.length
  const approvedCount = equipment.filter((e) => e.status === "Approved").length
  const pendingCount = equipment.filter((e) => e.status === "Pending").length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Equipment Fleet
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your machinery inventory, listing status, and rental terms.
          </p>
        </div>

        <Link
          href="/dashboard/owner/equipment/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-sm shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Equipment</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved & Live
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{approvedCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="owner-equipment-search" className="sr-only">
            Search my equipment
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="owner-equipment-search"
            name="search"
            type="text"
            placeholder="Search by equipment name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="owner-status-filter" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Status:
          </label>
          <select
            id="owner-status-filter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Loading your equipment inventory...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Boxes className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No equipment found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {equipment.length === 0
                ? "You haven't listed any equipment yet. Click below to add your first machine."
                : "No items match your active search or filter criteria."}
            </p>
            {equipment.length === 0 && (
              <Link
                href="/dashboard/owner/equipment/new"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>List Equipment Now</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rental Rate</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredEquipment.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.brand} {item.model && `• ${item.model}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      ${item.rentalPrice}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        / {item.rentalType.toLowerCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.availableQuantity > 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.availableQuantity} available
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {item.status === "Approved" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </span>
                      ) : item.status === "Pending" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/equipment/${item._id}`}
                          title="View Catalog Page"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/owner/equipment/${item._id}/edit`}
                          title="Edit Equipment"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item)}
                          title="Delete Equipment"
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete Equipment?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 dark:text-white">"{itemToDelete.name}"</strong>? If there are any
              active rental bookings for this equipment, deletion will be blocked to protect ongoing rentals.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={deletingId === itemToDelete._id}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(itemToDelete)}
                disabled={deletingId === itemToDelete._id}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                {deletingId === itemToDelete._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
