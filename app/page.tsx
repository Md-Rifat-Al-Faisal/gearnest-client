"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  DollarSign,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Package,
  Layers,
  MapPin,
  Send,
  Building2,
  Mail,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { apiRequest } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CountUp } from "@/components/count-up"
import {
  heroStagger,
  heroItem,
  heroSearchSlideUp,
  heroPhotoScale,
  cardStagger,
  cardFadeUp,
} from "@/lib/motion"

interface FeaturedItem {
  _id: string
  name: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
  brand?: string
  model?: string
  condition?: string
  ownerName?: string
  image: string
}

interface CustomerReview {
  _id: string
  reviewerName: string
  reviewerRole: string
  avatar?: string
  rating: number
  comment: string
}

const CATEGORIES = [
  {
    name: "Construction",
    fullName: "Construction Equipment",
    shortName: "Construction",
    tag: "Excavators & Cranes",
    image: "/images/categories/construction.webp",
    description: "Excavators, skid steers, scissor lifts & heavy compaction",
  },
  {
    name: "Photography",
    fullName: "Photography Equipment",
    shortName: "Photography",
    tag: "Cinema & Lenses",
    image: "/images/categories/photography.webp",
    description: "Cinema cameras, prime lenses, studio lighting & gimbals",
  },
  {
    name: "Vehicles",
    fullName: "Vehicles & Transportation",
    shortName: "Vehicles",
    tag: "Haulers & Trucks",
    image: "/images/categories/vehicles.webp",
    description: "Heavy haulers, dually pickups & enclosed cargo vans",
  },
  {
    name: "Agriculture",
    fullName: "Agriculture Equipment",
    shortName: "Agriculture",
    tag: "Tractors & Tillers",
    image: "/images/categories/agriculture.webp",
    description: "Utility tractors, rotary mowers, seeders & field loaders",
  },
  {
    name: "Electronics",
    fullName: "Electronics & Drones",
    shortName: "Electronics",
    tag: "Drones & Thermal",
    image: "/images/categories/electronics.webp",
    description: "Thermal cameras, RTK survey drones & diagnostic gear",
  },
  {
    name: "Events",
    fullName: "Event Equipment",
    shortName: "Events",
    tag: "Audio & Staging",
    image: "/images/categories/events.webp",
    description: "Line-array audio rigs, moving heads & staging trusses",
  },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Browse Equipment Catalog",
    description:
      "Explore 6 commercial industries, review technical specifications, and check real-time fleet availability in your metro area.",
  },
  {
    step: "02",
    title: "Direct Stripe Checkout",
    description:
      "Select your exact rental dates, review calculated daily or weekly rates, and reserve with encrypted card checkout.",
  },
  {
    step: "03",
    title: "Jobsite Dispatch & Return",
    description:
      "Coordinate directly with the equipment owner for site delivery or depot pickup, complete your project, and return.",
  },
]

const WHY_CHOOSE_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Reviewed Fleet Listings",
    description:
      "Every partner listing is reviewed by our operations team for specification accuracy before appearing in the public catalog.",
  },
  {
    icon: DollarSign,
    title: "Transparent Daily & Weekly Rates",
    description:
      "Clear, upfront pricing with no hidden broker markups or unexpected maintenance surcharges at checkout.",
  },
  {
    icon: Clock,
    title: "Direct Owner Communication",
    description:
      "Connect straight to local machine owners for handover timing, site drop-off access, and operational walkthroughs.",
  },
  {
    icon: Layers,
    title: "Secure Stripe Checkout",
    description:
      "Card transactions are processed directly through Stripe with instant digital receipts and verified booking IDs.",
  },
]

const FAQ_ITEMS = [
  {
    q: "How does equipment reservation and jobsite handover work?",
    a: "Browse approved machinery, select your required rental dates and quantity, and complete instant Stripe checkout. Once confirmed, equipment specifications, site address, and owner contact details are immediately accessible in your customer dashboard.",
  },
  {
    q: "How are rental costs and durations calculated?",
    a: "Pricing is transparently calculated based on the equipment owner's daily, weekly, or monthly rate and the number of days selected. The system automatically determines required rental units and total pricing prior to payment.",
  },
  {
    q: "What payment methods are supported?",
    a: "All equipment reservations are processed securely using Stripe Checkout with credit or debit cards, generating a verified digital transaction ID upon confirmation.",
  },
  {
    q: "How do equipment owners list and manage machinery?",
    a: "Registered partners can list machinery with photos, specifications, rental rates, and terms. Every listing undergoes administrative review before appearing in the public catalog.",
  },
  {
    q: "Can I cancel a pending equipment reservation?",
    a: "Yes. Customers can view and cancel any pending, unpaid reservations directly from their customer dashboard under the My Rentals section.",
  },
]

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [totalEquipmentCount, setTotalEquipmentCount] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState("all")
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Contact Form State
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactCategory, setContactCategory] = useState("Construction")
  const [contactMessage, setContactMessage] = useState("")
  const [contactSubmitting, setContactSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in your name, email, and inquiry details.")
      return
    }
    try {
      setContactSubmitting(true)
      const res = await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          subject: `${contactCategory} Equipment Inquiry`,
          message: contactMessage.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Inquiry received! Our team will review your equipment request.")
        setContactName("")
        setContactEmail("")
        setContactPhone("")
        setContactMessage("")
      } else {
        toast.error(data.message || "Failed to submit inquiry")
      }
    } catch {
      toast.error("Network error while submitting inquiry")
    } finally {
      setContactSubmitting(false)
    }
  }

  const FALLBACK_API = "https://gearnest-server.vercel.app"
  const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API

  useEffect(() => {
    const resilientFetch = async (path: string) => {
      try {
        const res = await fetch(`${apiBase}${path}`)
        if (res.ok) return await res.json()
        throw new Error(`HTTP ${res.status}`)
      } catch {
        const fallbackRes = await fetch(`${FALLBACK_API}${path}`)
        if (fallbackRes.ok) return await fallbackRes.json()
        throw new Error(`Fallback HTTP ${fallbackRes.status}`)
      }
    }

    // 1. Fetch featured equipment
    resilientFetch("/api/equipment/featured")
      .then((data) => {
        if (data?.equipment) setFeatured(data.equipment)
      })
      .catch((err) => {
        console.warn("Featured equipment temporarily unavailable:", err.message)
      })
      .finally(() => setLoadingFeatured(false))

    // 2. Fetch customer reviews
    resilientFetch("/api/reviews")
      .then((data) => {
        if (data?.reviews) setReviews(data.reviews)
      })
      .catch((err) => {
        console.warn("Reviews temporarily unavailable:", err.message)
      })

    // 3. Fetch equipment count for live stats
    resilientFetch("/api/equipment?limit=1")
      .then((data) => {
        if (typeof data?.total === "number") {
          setTotalEquipmentCount(data.total)
        }
      })
      .catch(() => {
        setTotalEquipmentCount(14)
      })
  }, [apiBase])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
    }
    if (searchCategory && searchCategory !== "all") {
      params.set("category", searchCategory)
    }
    const queryString = params.toString()
    router.push(queryString ? `/equipment?${queryString}` : "/equipment")
  }

  const handleCardClick = (id: string) => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/equipment/${id}`)
    } else {
      router.push(`/equipment/${id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
      <Navbar />

      {/* 1. HERO BANNER - High-End Photo-Led Hero with Gradient Blend & Floating Search */}
      <section className="relative overflow-hidden bg-background pt-12 pb-24 md:pt-20 md:pb-32 border-b border-border">
        {/* Right Photo with Desktop Left-to-Right Fade */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 overflow-hidden pointer-events-none z-0">
          <motion.div
            variants={heroPhotoScale}
            initial="hidden"
            animate="visible"
            className="w-full h-full relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.webp"
              alt="Autonomous industrial excavator on jobsite at dusk"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            {/* photo overlay */}
            <div className="absolute inset-0 bg-black/35 dark:bg-black/55" />
            {/* Desktop Left-to-right fade gradient */}
            <div
              className="hidden lg:block absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, var(--background) 0%, color-mix(in srgb, var(--background) 88%, transparent) 40%, transparent 78%)",
              }}
            />
            {/* Bottom transition blend */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 55%, var(--background) 100%)",
              }}
            />
          </motion.div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={heroItem}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-border text-xs font-semibold text-accent-text">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Vetted Commercial Equipment Fleet</span>
                </span>
              </motion.div>

              <motion.h1
                variants={heroItem}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]"
              >
                Industrial machinery & professional gear.{" "}
                <span className="text-accent-text">Rented smart.</span>
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal max-w-xl"
              >
                Access excavators, cinema cameras, utility tractors, and survey gear from
                screened equipment owners with instant card checkout powered by Stripe.
              </motion.p>

              <motion.div
                variants={heroItem}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <Button size="lg" asChild>
                  <Link href="/equipment" className="flex items-center gap-2">
                    <span>Browse equipment</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard/owner/equipment/new">
                    <span>List your gear</span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating Search Card */}
          <motion.div
            variants={heroSearchSlideUp}
            initial="hidden"
            animate="visible"
            className="mt-12 lg:mt-16 max-w-4xl"
          >
            <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-md p-3 sm:p-4 shadow-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col md:flex-row items-center gap-3"
              >
                {/* Keyword input */}
                <div className="relative flex-1 w-full">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment, brand, or city (e.g. CAT 308, Sony FX6)..."
                    aria-label="Search equipment catalog"
                    className="w-full bg-surface-2 border border-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Category select */}
                <div className="w-full md:w-56 shrink-0">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    aria-label="Select industry category"
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="all">All Industries</option>
                    <option value="Construction">Construction Equipment</option>
                    <option value="Photography">Photography Equipment</option>
                    <option value="Vehicles">Vehicles & Transport</option>
                    <option value="Agriculture">Agriculture Equipment</option>
                    <option value="Electronics">Electronics & Drones</option>
                    <option value="Events">Event Production</option>
                  </select>
                </div>

                {/* Search button */}
                <Button type="submit" size="default" className="w-full md:w-auto shrink-0 px-6">
                  <Search className="h-4 w-4 mr-1.5" />
                  <span>Search Fleet</span>
                </Button>
              </form>

              {/* Popular quick links */}
              <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Popular:</span>
                {["Construction", "Photography", "Vehicles", "Agriculture", "Electronics", "Events"].map(
                  (cat) => (
                    <Link
                      key={cat}
                      href={`/equipment?category=${encodeURIComponent(cat)}`}
                      className="px-2 py-0.5 rounded-md bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      {cat}
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Live Stats Strip */}
          <div className="mt-10 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <div className="p-3.5 rounded-xl bg-surface border border-border spec-line-kpi">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                {totalEquipmentCount !== null ? (
                  <CountUp end={totalEquipmentCount} suffix="+" duration={1.2} />
                ) : (
                  <div className="h-7 w-12 bg-surface-2 rounded animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Active Machinery Items</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border spec-line-kpi">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                <CountUp end={6} duration={0.8} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Commercial Industries</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border spec-line-kpi">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                {reviews.length > 0 ? (
                  <CountUp
                    end={reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length}
                    decimals={1}
                    suffix=" / 5.0"
                    duration={1.0}
                  />
                ) : (
                  <CountUp end={4.9} decimals={1} suffix=" / 5.0" duration={1.0} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Verified Client Rating</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border spec-line-kpi">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                <CountUp end={100} suffix="%" duration={1.0} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Admin Moderated Listings</p>
            </div>
          </div>
        </div>

        {/* Section transition: modern angled divider */}
        <div className="hero-clip-divider" aria-hidden="true" />
      </section>

      {/* 2. CATEGORIES SECTION - 6 Compact Category Tiles in One Single Row on Desktop */}
      <section className="py-12 md:py-16 bg-surface-2/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <div className="spec-line-heading" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
                Commercial Equipment Categories
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Select a category to explore available machinery, specifications, and regional availability.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-accent-text font-semibold">
              <Link href="/equipment" className="inline-flex items-center gap-1.5">
                <span>All Categories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={cardFadeUp}>
                <Link
                  href={`/equipment?category=${encodeURIComponent(cat.shortName)}`}
                  className="group relative block rounded-xl overflow-hidden border border-border bg-surface aspect-[4/3] shadow-xs hover:border-primary/50 transition-colors"
                >
                  {/* Photo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.fullName || cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-106"
                  />
                  {/* Gradient Overlay and Content */}
                  <div className="absolute inset-0 bg-overlay-scrim flex flex-col justify-end p-3 pointer-events-none">
                    <div className="transform transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-overlay-foreground font-heading flex items-center justify-between">
                        <span className="truncate">{cat.shortName}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-overlay-muted truncate mt-0.5 font-medium">
                        {cat.tag}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURED MACHINERY - Photo-First Cards with Real Aspect Ratio & Gold Price Pill */}
      <section className="py-16 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="spec-line-heading" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
                Featured Fleet Listings
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Moderated machinery ready for immediate mobilization and rental booking.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/equipment" className="inline-flex items-center gap-1.5 text-accent-text font-semibold">
                <span>View All Fleet</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 space-y-4 bg-surface animate-pulse"
                >
                  <div className="aspect-[4/3] w-full rounded-lg bg-surface-2" />
                  <div className="h-4 bg-surface-2 rounded w-3/4" />
                  <div className="h-3 bg-surface-2 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="py-16 text-center rounded-xl border border-dashed border-border bg-surface">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No featured equipment currently listed.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link href="/equipment">Browse catalog</Link>
              </Button>
            </div>
          ) : (
            <motion.div
              variants={cardStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featured.map((item) => (
                <motion.div
                  key={item._id}
                  variants={cardFadeUp}
                  className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden shadow-xs hover:border-primary/50 transition-colors"
                >
                  {/* Photo with real 4:3 Aspect Ratio */}
                  <div className="relative aspect-[4/3] w-full bg-surface-2 overflow-hidden">
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

                    {/* Category pill top-left */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface/90 text-foreground border border-border backdrop-blur-xs">
                      {item.category}
                    </span>

                    {/* Stock status or Out of stock badge bottom-left */}
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

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Specs Row: Brand · Condition · Location */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                        <MapPin className="h-3.5 w-3.5 text-accent-text shrink-0" />
                        <span className="truncate">{item.location || "USA Metro"}</span>
                        {item.brand && <span>· {item.brand}</span>}
                        {item.condition && <span>· {item.condition}</span>}
                      </div>

                      <h3 className="text-base font-bold text-foreground font-heading line-clamp-1 group-hover:text-accent-text transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {item.availableQuantity > 0 ? (
                          <span className="text-success font-medium">
                            {item.availableQuantity} unit{item.availableQuantity > 1 ? "s" : ""} available
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS - Band Section with 3 Numbered Steps & Connecting Line */}
      <section id="how-it-works" className="py-20 md:py-28 theme-band border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
              Streamlined Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 font-heading">
              How GearNest Works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              From reservation inquiry to jobsite handover in 3 transparent steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Desktop connecting dashed line */}
            <div
              className="hidden md:block absolute top-8 left-12 right-12 h-[1px] border-t border-dashed border-border pointer-events-none z-0"
              aria-hidden="true"
            />

            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.step}
                className="relative z-10 p-6 rounded-xl border border-border bg-surface backdrop-blur-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-accent-text font-heading mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US - 4 Benefit Cards with Honest Claims */}
      <section id="why-us" className="py-16 md:py-24 bg-surface-2/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="spec-line-heading" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Why Project Leads Rely on GearNest
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Built for commercial contractors, film directors, and independent fleet operators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-surface-2 text-accent-text flex items-center justify-center border border-border">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. ABOUT US & OPERATIONAL PILLARS - Split Layout with Allocated Reviews */}
      <section id="about" className="py-16 md:py-24 bg-background border-b border-border scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="spec-line-heading" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
              About GearNest
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading mt-2">
              Modern Machinery Rental Infrastructure
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Founded to eliminate rental downtime, opaque pricing, and machinery fraud, GearNest connects commercial contractors, media leads, and agricultural operators directly with vetted fleet owners.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: About Pillars & Company Story (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-xl border border-border bg-surface shadow-xs space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-foreground font-heading">
                  Engineered for Jobsite Reliability
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Every project milestone depends on equipment arriving on spec and on schedule. Traditional equipment brokering adds costly middleman markups and uncertain availability. GearNest provides a modern, transparent platform with atomic real-time inventory locking and Stripe payment processing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-surface-2 border border-border">
                    <div className="flex items-center gap-2 text-accent-text font-bold text-xs">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>Moderated Fleet</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      Every machine is administratively vetted before appearing in the public catalog.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-2 border border-border">
                    <div className="flex items-center gap-2 text-accent-text font-bold text-xs">
                      <Layers className="h-4 w-4 text-primary shrink-0" />
                      <span>Atomic Stock</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      Real-time inventory locks prevent double-bookings during checkout.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-2 border border-border">
                    <div className="flex items-center gap-2 text-accent-text font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Direct Dispatch</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      Direct owner coordination with transparent daily, weekly, and monthly rates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Metrics Banner */}
              <div className="p-5 rounded-xl border border-border bg-surface-2/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-foreground block">Enterprise-Ready Standards</span>
                  <span className="text-muted-foreground">Stripe encrypted payments · Role-based access control</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/equipment" className="inline-flex items-center gap-1.5">
                    <span>Explore Fleet</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Customer Reviews / Testimonials (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
                  Verified Reviews
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {reviews.length > 0 ? `${reviews.length} Verified Operators` : "Rated 4.9/5.0"}
                </span>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.slice(0, 2).map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 sm:p-5 rounded-xl border border-border bg-surface shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gold-fill">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < (rev.rating || 5)
                                  ? "fill-gold-fill text-gold-fill"
                                  : "text-border"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {(rev.rating || 5).toFixed(1)} / 5.0
                        </span>
                      </div>

                      <blockquote className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </blockquote>

                      <div className="flex items-center gap-2.5 pt-2 border-t border-border">
                        <div className="h-7 w-7 rounded-full bg-surface-2 border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                          {rev.reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {rev.reviewerName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {rev.reviewerRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-border bg-surface text-center">
                  <Star className="h-6 w-6 text-gold-fill mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Reviews from verified equipment operators will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS - Accordion */}
      <section id="faq" className="py-16 md:py-24 bg-surface-2/20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="spec-line-heading" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Common questions regarding machinery dispatch, reservation terms, and Stripe verification.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-accent-text transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-accent-text" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 8. CONTACT US SECTION - Clean Form with Tokens */}
      <section id="contact" className="py-16 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="spec-line-heading" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Equipment Inquiries & Site Dispatch
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Have questions about machinery availability, custom rental schedules, or fleet onboarding?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Information Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
                <div className="h-10 w-10 rounded-lg bg-surface-2 text-accent-text flex items-center justify-center border border-border">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-sm font-heading">
                  Inquiries Desk
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our dispatch operations team responds to equipment inquiries:
                </p>
                <div className="text-sm font-semibold text-accent-text">
                  dispatch@gearnest.com
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-surface space-y-3">
                <div className="h-10 w-10 rounded-lg bg-surface-2 text-accent-text flex items-center justify-center border border-border">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-sm font-heading">
                  Fleet Operations Network
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verified equipment partners and machinery hubs across major US metropolitan regions.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-xl border border-border bg-surface shadow-xs">
              <h3 className="text-lg font-bold text-foreground font-heading mb-1">
                Send an Equipment Inquiry
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Submit project requirements and requested machinery specifications for prompt owner coordination.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      Work Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. marcus@buildcorp.com"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +1 555 0100"
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-category"
                      className="block text-xs font-semibold text-foreground mb-1"
                    >
                      Machinery Industry
                    </label>
                    <select
                      id="contact-category"
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="Construction">Construction Equipment</option>
                      <option value="Photography">Photography & Film Gear</option>
                      <option value="Vehicles">Vehicles & Haulers</option>
                      <option value="Agriculture">Agriculture & Tractors</option>
                      <option value="Electronics">Thermal & Survey Electronics</option>
                      <option value="Events">Event Audio & Stage Lighting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-foreground mb-1"
                  >
                    Jobsite Requirements & Duration *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Specify project address, dates, machine specs, and any site constraints..."
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Button type="submit" disabled={contactSubmitting}>
                    <Send className={`h-3.5 w-3.5 mr-1.5 ${contactSubmitting ? "animate-pulse" : ""}`} />
                    <span>{contactSubmitting ? "Submitting..." : "Send Inquiry"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA BAND BEFORE FOOTER - Band background with dot-grid pattern */}
      <section className="py-20 theme-band relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Ready to mobilize your next project?
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Browse verified heavy machinery, cinema packages, and agricultural equipment
            available for instant test-checkout booking.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/equipment" className="flex items-center gap-2">
                <span>Browse equipment catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <Link href="/dashboard/owner/equipment/new">
                <span>List machinery</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
