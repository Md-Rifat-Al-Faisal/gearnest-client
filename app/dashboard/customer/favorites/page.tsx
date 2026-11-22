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
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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

  const filteredFavorites = favorites.filter((f) => {
    const eq = f.equipment
    if (!eq) return false
    const q = search.toLowerCase()
    return (
      eq.name?.toLowerCase().includes(q) ||
      eq.category?.toLowerCase().includes(q) ||
      eq.brand?.toLowerCase().includes(q) ||
      eq.model?.toLowerCase().includes(q) ||
      eq.location?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage) || 1
  const paginatedFavorites = filteredFavorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-foreground">
            Saved Equipment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bookmarked machinery and production tools with live rates and real-time inventory levels.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/equipment" className="flex items-center gap-2">
            <span>Browse Full Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Search Filter Bar */}
      {favorites.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved equipment by title, category, brand..."
            className="w-full pl-10 pr-9 py-2 rounded-lg text-sm border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Favorites Table / Cards */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your saved equipment...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold font-heading text-foreground">No saved equipment yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Save excavators, camera rigs, and vehicles while browsing the catalog for fast access.
            </p>
            <Button asChild className="mt-5">
              <Link href="/equipment" className="flex items-center gap-2">
                <span>Explore Fleet Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="h-12 w-12 rounded-xl bg-surface-2 text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">No matching saved equipment</h4>
            <p className="text-xs text-muted-foreground mt-1">
              No saved items matched &quot;{search}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3.5 px-4">Equipment</TableHead>
                    <TableHead className="py-3.5 px-4">Category & Location</TableHead>
                    <TableHead className="py-3.5 px-4">Rate</TableHead>
                    <TableHead className="py-3.5 px-4 text-center">Live Availability</TableHead>
                    <TableHead className="py-3.5 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFavorites.map((f) => {
                    const eq = f.equipment
                    return (
                      <TableRow key={f._id}>
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
                              {eq.image ? (
                                <img
                                  src={eq.image}
                                  alt={eq.name}
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
                                href={`/equipment/${eq._id}`}
                                className="font-semibold text-foreground hover:text-accent-text transition-colors line-clamp-1"
                              >
                                {eq.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {eq.brand} {eq.model && `• ${eq.model}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 px-4 text-xs">
                          <Badge variant="outline">
                            {eq.category}
                          </Badge>
                          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-accent-text" />
                            <span>{eq.location || "USA Metro"}</span>
                          </p>
                        </TableCell>

                        <TableCell className="py-4 px-4 font-semibold text-foreground">
                          ${eq.rentalPrice}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            /{eq.rentalType?.toLowerCase()}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 px-4 text-center">
                          {eq.availableQuantity > 0 ? (
                            <Badge variant="success">
                              {eq.availableQuantity} available
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Out of stock
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button size="sm" asChild>
                              <Link
                                href={`/equipment/${eq._id}`}
                                className="flex items-center gap-1"
                              >
                                <span>Book</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(f.equipmentId, eq.name)}
                              disabled={removingId === f.equipmentId}
                              title="Remove from favorites"
                              className="text-muted-foreground hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
                    {Math.min(currentPage * itemsPerPage, filteredFavorites.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filteredFavorites.length}
                  </span>{" "}
                  saved items
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
    </div>
  )
}
