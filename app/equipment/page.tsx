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
  X,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
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

  const FALLBACK_API = "https://gearnest-server.vercel.app"
  const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API

  // Sync state whenever external searchParams change
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "All"
    const urlSearch = searchParams.get("search") || ""
    const urlRentalType = searchParams.get("rentalType") || "All"
    const urlMinPrice = searchParams.get("minPrice") || ""
    const urlMaxPrice = searchParams.get("maxPrice") || ""
    const urlAvailableOnly = searchParams.get("availableOnly") === "true"
    const urlSort = searchParams.get("sort") || "newest"
    const urlPage = parseInt(searchParams.get("page") || "1", 10)

    setCategory((prev) => (prev !== urlCategory ? urlCategory : prev))
    setSearch((prev) => (prev !== urlSearch ? urlSearch : prev))
    setRentalType((prev) => (prev !== urlRentalType ? urlRentalType : prev))
    setMinPrice((prev) => (prev !== urlMinPrice ? urlMinPrice : prev))
    setMaxPrice((prev) => (prev !== urlMaxPrice ? urlMaxPrice : prev))
    setAvailableOnly((prev) => (prev !== urlAvailableOnly ? urlAvailableOnly : prev))
    setSort((prev) => (prev !== urlSort ? urlSort : prev))
    setPage((prev) => (prev !== urlPage ? urlPage : prev))
  }, [searchParams])

  // Sync active filters to URL search parameters without full page reloads
  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (category && category !== "All") params.set("category", category)
    if (rentalType && rentalType !== "All") params.set("rentalType", rentalType)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (availableOnly) params.set("availableOnly", "true")
    if (sort && sort !== "newest") params.set("sort", sort)
    if (page > 1) params.set("page", String(page))

    const newQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (newQuery !== currentQuery) {
      router.replace(newQuery ? `/equipment?${newQuery}` : "/equipment", { scroll: false })
    }
  }, [search, category, rentalType, minPrice, maxPrice, availableOnly, sort, page, router, searchParams])

  const fetchCatalog = async (signal?: AbortSignal) => {
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

      let res: Response
      try {
        res = await fetch(`${apiBase}/api/equipment?${params.toString()}`, { signal })
      } catch (err: any) {
        if (err.name === "AbortError") return
        res = await fetch(`${FALLBACK_API}/api/equipment?${params.toString()}`, { signal })
      }

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
      if (err.name === "AbortError") return
      console.warn("Equipment catalog network notice:", err.message)
      setFetchError("Unable to reach the equipment catalog server. Please verify your connection or retry.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchCatalog(controller.signal)
    return () => controller.abort()
  }, [category, rentalType, availableOnly, sort, page, search])

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

  // Active filters list for chip display
  const activeFilters = [
    category !== "All" && { label: `Category: ${category}`, clear: () => setCategory("All") },
    rentalType !== "All" && { label: `Period: ${rentalType}`, clear: () => setRentalType("All") },
    search.trim() && { label: `Search: "${search.trim()}"`, clear: () => setSearch("") },
    minPrice && { label: `Min: $${minPrice}`, clear: () => setMinPrice("") },
    maxPrice && { label: `Max: $${maxPrice}`, clear: () => setMaxPrice("") },
    availableOnly && { label: "In Stock Only", clear: () => setAvailableOnly(false) },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-xl p-6 sm:p-10 text-foreground relative overflow-hidden shadow-xs">
        <div className="max-w-2xl relative z-10">
          <div className="spec-line-heading" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            Equipment Fleet Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Commercial machinery, cinema packages, utility tractors, and diagnostic tools.
            Instant online reservations with secure Stripe checkout.
          </p>
        </div>

        {/* Search input in banner */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 max-w-xl flex items-center gap-2 bg-surface-2 border border-border p-1.5 rounded-lg shadow-xs"
        >
          <div className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Search equipment catalog
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="catalog-search"
              name="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by equipment name, location, or brand..."
              aria-label="Search equipment catalog"
              className="w-full bg-transparent pl-10 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Main Layout: Filters Sidebar + 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-surface space-y-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-accent-text" />
                Filters
              </h2>
              {activeFilters.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-accent-text hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Category
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat)
                        setPage(1)
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-surface-2 text-foreground font-bold border-l-[3px] border-l-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rental Billing Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Rental Period
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {RENTAL_TYPES.map((type) => {
                  const isActive = rentalType === type
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setRentalType(type)
                        setPage(1)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                        isActive
                          ? "border-primary/60 bg-primary/10 text-accent-text font-bold"
                          : "border-border text-muted-foreground hover:bg-surface-2"
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Price Range ($)
              </span>
              <div className="flex items-center gap-2">
                <input
                  id="catalog-min-price"
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-muted-foreground text-xs">-</span>
                <input
                  id="catalog-max-price"
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPage(1)
                  fetchCatalog()
                }}
                className="mt-2 w-full text-xs"
              >
                Apply Price
              </Button>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-border">
              <label htmlFor="catalog-available-only" className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="catalog-available-only"
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => {
                    setAvailableOnly(e.target.checked)
                    setPage(1)
                  }}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground">
                  Available in Stock Only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog 3-Column Grid Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Active filter chip row */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-surface">
              <span className="text-xs font-bold text-foreground">Active:</span>
              {activeFilters.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-surface-2 border border-border text-foreground"
                >
                  <span>{f.label}</span>
                  <button
                    onClick={f.clear}
                    className="hover:text-danger text-muted-foreground transition-colors cursor-pointer"
                    aria-label={`Remove filter ${f.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-accent-text hover:underline ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Toolbar: Count & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
            <p className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{items.length}</strong> of{" "}
              <strong className="text-foreground">{totalCount}</strong> equipment listings
            </p>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="py-1.5 px-3 rounded-lg border border-border bg-surface-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="newest">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid / Graceful Error / Empty State */}
          {fetchError ? (
            <div className="py-20 text-center rounded-xl border border-danger/30 bg-danger/5 p-8 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-danger/10 text-danger flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading">Connection Notice</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">{fetchError}</p>
              <Button
                onClick={() => fetchCatalog()}
                size="sm"
                className="mt-4"
              >
                Retry Connecting
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[900px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-border p-5 space-y-4 bg-surface animate-pulse flex flex-col justify-between h-[420px]"
                >
                  <div className="aspect-[4/3] w-full rounded-lg bg-surface-2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-2 rounded w-3/4" />
                    <div className="h-3 bg-surface-2 rounded w-1/2" />
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <div className="h-3 bg-surface-2 rounded w-1/4" />
                    <div className="h-8 bg-surface-2 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center rounded-xl border border-dashed border-border bg-surface p-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground font-heading">
                No matching equipment found
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try expanding your search query, selecting another category, or resetting price limits.
              </p>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group flex flex-col h-full rounded-xl border border-border bg-surface overflow-hidden shadow-xs hover:border-primary/50 transition-colors"
                >
                  {/* Photo with real 4:3 Aspect Ratio */}
                  <div className="relative aspect-[4/3] w-full bg-surface-2 overflow-hidden shrink-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-10 w-10" />
                      </div>
                    )}

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface/90 text-foreground border border-border backdrop-blur-xs">
                      {item.category}
                    </span>

                    {/* Out of stock badge if 0 quantity */}
                    {item.availableQuantity === 0 ? (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-danger text-band-foreground dark:text-primary-foreground">
                        Out of stock
                      </span>
                    ) : null}

                    {/* Gold Price Tag Pill top-right */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="gold" className="text-xs shadow-sm">
                        ${item.rentalPrice} / {item.rentalType?.toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Body - equal height flex */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Specs Row: Brand · Condition · Location */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-accent-text shrink-0" />
                        <span className="truncate">{item.location || "USA Metro"}</span>
                        {item.brand && <span>· {item.brand}</span>}
                        {item.condition && <span>· {item.condition}</span>}
                      </div>

                      <h3 className="text-base font-bold text-foreground font-heading line-clamp-2 group-hover:text-accent-text transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {item.availableQuantity > 0 ? (
                          <span className="text-success font-medium">
                            {item.availableQuantity} available
                          </span>
                        ) : (
                          <span className="text-danger font-medium">Currently rented</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCardClick(item._id)}
                        className="text-xs font-semibold"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                disabled={page <= 1}
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-4 py-1.5 text-xs font-bold text-foreground bg-surface-2 rounded-lg border border-border">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                disabled={page >= totalPages}
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function EquipmentCatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[1600px]">
      <Suspense
        fallback={
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-[1200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading catalog...</p>
          </div>
        }
      >
        <EquipmentCatalogContent />
      </Suspense>
    </div>
  )
}
