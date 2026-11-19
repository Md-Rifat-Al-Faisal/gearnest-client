"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Heart,
  Package,
  Trash2,
  ExternalLink,
  ArrowRight,
  Loader2,
  MapPin,
  CheckCircle2,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

interface FavoriteRecord {
  _id: string
  equipmentId: string
  createdAt: string
  equipment: {
    _id: string
    name: string
    description: string
    category: string
    location: string
    rentalPrice: number
    rentalType: string
    availableQuantity: number
    condition: string
    brand: string
    model: string
    image: string
    status: string
  }
}

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await apiRequest("/api/customer/favorites")
      const data = await res.json()

      if (res.ok && data.favorites) {
        setFavorites(data.favorites)
      } else {
        toast.error(data.message || "Failed to load favorites")
      }
    } catch {
      toast.error("Network error while connecting to GearNest")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleRemove = async (equipmentId: string, equipmentName: string) => {
    try {
      setRemovingId(equipmentId)
      const res = await apiRequest(`/api/customer/favorites/${equipmentId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`Removed "${equipmentName}" from favorites`)
        setFavorites((prev) => prev.filter((f) => f.equipmentId !== equipmentId))
      } else {
        const data = await res.json()
        toast.error(data.message || "Could not remove favorite")
      }
    } catch {
      toast.error("Network error while updating favorites")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Saved Equipment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bookmarked machinery and production tools with live rates and real-time inventory levels.
          </p>
        </div>

        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <span>Browse Full Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Favorites Table / Cards */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Loading your saved equipment...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No saved equipment yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Save excavators, camera rigs, and vehicles while browsing the catalog for fast access.
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
                  <th className="py-3.5 px-4">Category & Location</th>
                  <th className="py-3.5 px-4">Rate</th>
                  <th className="py-3.5 px-4 text-center">Live Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {favorites.map((f) => {
                  const eq = f.equipment
                  return (
                    <tr
                      key={f._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {eq.image ? (
                              <img
                                src={eq.image}
                                alt={eq.name}
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
                              href={`/equipment/${eq._id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-1"
                            >
                              {eq.name}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {eq.brand} {eq.model && `• ${eq.model}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {eq.category}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-amber-500" />
                          <span>{eq.location || "USA Metro"}</span>
                        </p>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        ${eq.rentalPrice}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          /{eq.rentalType?.toLowerCase()}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            eq.availableQuantity > 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {eq.availableQuantity > 0
                            ? `${eq.availableQuantity} available`
                            : "Out of stock"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/equipment/${eq._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                          >
                            <span>Book Now</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>

                          <button
                            onClick={() => handleRemove(f.equipmentId, eq.name)}
                            disabled={removingId === f.equipmentId}
                            title="Remove from favorites"
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
