"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Package,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"

interface EquipmentItem {
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
  createdAt: string
}

const CATEGORIES = [
  "All",
  "Construction",
  "Photography",
  "Vehicles",
  "Agriculture",
  "Electronics",
  "Events",
]

const RENTAL_TYPES = ["All", "Daily", "Weekly", "Monthly"]

function EquipmentCatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  // Initialize state from search parameters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "All")
  const [rentalType, setRentalType] = useState(searchParams.get("rentalType") || "All")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("availableOnly") === "true")
  const [sort, setSort] = useState(searchParams.get("sort") || "newest")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10))

  const [items, setItems] = useState<EquipmentItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchCatalog = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const params = new URLSearchParams()

      if (search.trim()) params.set("search", search.trim())
      if (category && category !== "All") params.set("category", category)
      if (rentalType && rentalType !== "All") params.set("rentalType", rentalType)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      if (availableOnly) params.set("availableOnly", "true")
      if (sort) params.set("sort", sort)
      params.set("page", String(page))
      params.set("limit", "9")

      const res = await fetch(`${apiBase}/api/equipment?${params.toString()}`)
      if (!res.ok) {
        throw new Error(`Failed to load catalog (HTTP ${res.status})`)
      }
      const data = await res.json()

      if (data?.equipment) {
        setItems(data.equipment)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.total || 0)
      } else {
        setItems([])
      }
    } catch (err: any) {
      console.warn("Equipment catalog network notice:", err.message)
      setFetchError("Unable to reach the equipment catalog server. Please verify your connection or retry.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalog()
  }, [category, rentalType, availableOnly, sort, page])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCatalog()
  }

  const handleReset = () => {
    setSearch("")
    setCategory("All")
    setRentalType("All")
    setMinPrice("")
    setMaxPrice("")
    setAvailableOnly(false)
    setSort("newest")
    setPage(1)
  }

  const handleCardClick = (id: string) => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/equipment/${id}`)
    } else {
      router.push(`/equipment/${id}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner - Adaptive Light / Dark Theme */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 text-slate-900 dark:text-white relative overflow-hidden transition-colors shadow-xs">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Certified Inventory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
            Browse Equipment Catalog
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Filter through commercial machinery, cinema kits, tractors, and production tools.
            Instant online reservations backed by Stripe escrow protection.
          </p>
        </div>

        {/* Search input in banner */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 max-w-xl flex items-center gap-2 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl shadow-xs"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by equipment name, location, or brand..."
              className="w-full bg-transparent pl-11 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Layout: Filters Sidebar + 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                Filters
              </h2>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Category
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      setPage(1)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rental Billing Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Rental Period
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {RENTAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setRentalType(type)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                      rentalType === type
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => {
                  setPage(1)
                  fetchCatalog()
                }}
                className="mt-2 w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply Price
              </button>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => {
                    setAvailableOnly(e.target.checked)
                    setPage(1)
                  }}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Available in Stock Only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog 3-Column Grid Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Toolbar: Count & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{items.length}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{totalCount}</strong> equipment listings
            </p>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="newest">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid / Graceful Error / Empty State */}
          {fetchError ? (
            <div className="py-20 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Connection Notice</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{fetchError}</p>
              <button
                onClick={fetchCatalog}
                className="mt-4 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
              >
                Retry Connecting
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No matching equipment found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try expanding your search query, selecting another category, or resetting price limits.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  {/* Photo with category badge */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 backdrop-blur-xs border border-amber-500/30">
                      {item.category}
                    </span>
                    <span
                      className={`absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.availableQuantity > 0
                          ? "bg-emerald-500/90 text-slate-950"
                          : "bg-rose-500/90 text-white"
                      }`}
                    >
                      {item.availableQuantity > 0 ? `${item.availableQuantity} available` : "Out of stock"}
                    </span>
                  </div>

                  {/* Body - equal height flex */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        <span className="truncate">{item.location || "USA Metro"}</span>
                        {item.brand && <span>• {item.brand}</span>}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400">Rental:</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          ${item.rentalPrice}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            /{item.rentalType?.toLowerCase()}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleCardClick(item._id)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function EquipmentCatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Loading catalog...</p>
          </div>
        }
      >
        <EquipmentCatalogContent />
      </Suspense>
    </div>
  )
}
