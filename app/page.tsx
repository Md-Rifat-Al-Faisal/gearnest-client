"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Wrench,
  Search,
  HardHat,
  Camera,
  Truck,
  Tractor,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  Calendar,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  heroBadge,
  heroHeading,
  heroSubtitle,
  heroSearch,
  fadeInUp,
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
  brand: string
  model: string
  image: string
}

interface CustomerReview {
  _id: string
  reviewerName: string
  reviewerRole: string
  avatar: string
  rating: number
  comment: string
}

const CATEGORIES = [
  {
    name: "Construction",
    icon: HardHat,
    description: "Excavators, skid steers, scissor lifts & heavy compaction",
    color: "from-amber-500/20 to-orange-500/20",
    border: "group-hover:border-amber-500/50",
  },
  {
    name: "Photography",
    icon: Camera,
    description: "Cinema cameras, prime lenses, studio lighting & gimbals",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "group-hover:border-blue-500/50",
  },
  {
    name: "Vehicles",
    icon: Truck,
    description: "Heavy dually haulers, extended cargo vans & flatbeds",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "group-hover:border-emerald-500/50",
  },
  {
    name: "Agriculture",
    icon: Tractor,
    description: "Utility tractors, rotary mowers, seeders & field loaders",
    color: "from-green-500/20 to-lime-500/20",
    border: "group-hover:border-green-500/50",
  },
  {
    name: "Electronics",
    icon: Cpu,
    description: "Thermal cameras, RTK survey drones, oscilloscopes & power hubs",
    color: "from-purple-500/20 to-pink-500/20",
    border: "group-hover:border-purple-500/50",
  },
  {
    name: "Events",
    icon: Sparkles,
    description: "Line-array audio rigs, moving head lights & staging trusses",
    color: "from-rose-500/20 to-amber-500/20",
    border: "group-hover:border-rose-500/50",
  },
]

const WHY_CHOOSE_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Vetted Equipment Partners",
    description:
      "Every machine is pre-screened and certified for job-site compliance, ensuring peak mechanical reliability without unexpected downtime.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description:
      "Straightforward daily, weekly, and monthly rates. No hidden maintenance markups, broker commissions, or last-minute surprise fees.",
  },
  {
    icon: Clock,
    title: "Instant Stripe Protection",
    description:
      "Payments are held safely in escrow until the equipment is verified and operational on-site, giving both renters and owners peace of mind.",
  },
  {
    icon: Layers,
    title: "Flexible Dispatch & Pickup",
    description:
      "Coordinate local job site delivery or easy warehouse pickup across multiple commercial hubs nationwide with full logistics support.",
  },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Search & Select Gear",
    description:
      "Explore 6 core industries, compare technical specifications, and check real-time fleet availability in your metro area.",
  },
  {
    step: "02",
    title: "Instant Escrow Checkout",
    description:
      "Select your rental dates, compute accurate rates, and complete booking via encrypted Stripe payment with security guarantee.",
  },
  {
    step: "03",
    title: "Job Site Delivery & Dispatch",
    description:
      "Coordinate with verified equipment owners for on-site dropoff or rapid pickup, complete your project, and return hassle-free.",
  },
]

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  const FALLBACK_API = "https://gearnest-server.vercel.app"
  const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API

  useEffect(() => {
    // Helper with automatic fallback from local to live backend
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
  }, [apiBase])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/equipment?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/equipment")
    }
  }

  const handleCardClick = (id: string) => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/equipment/${id}`)
    } else {
      router.push(`/equipment/${id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* 1. HERO BANNER - Seamless Light / Dark Theme Adaptation */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-20 pb-20 sm:pt-28 sm:pb-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-300/30 dark:bg-slate-700/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            variants={heroBadge}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Commercial & Industrial Equipment Rental Hub</span>
          </motion.div>

          <motion.h1
            variants={heroHeading}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-slate-900 dark:text-white"
          >
            Power Your Job Site with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-500">
              Verified Machinery
            </span>
          </motion.h1>

          <motion.p
            variants={heroSubtitle}
            initial="hidden"
            animate="visible"
            className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Access top-tier excavators, cinema cameras, utility tractors, and survey drones
            from certified equipment owners. Protected with instant Stripe payment escrow.
          </motion.p>

          {/* Quick Search Box */}
          <motion.form
            variants={heroSearch}
            initial="hidden"
            animate="visible"
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl flex flex-col sm:flex-row items-center gap-2 backdrop-blur-md"
          >
            <div className="relative flex-1 w-full flex items-center">
              <label htmlFor="hero-search" className="sr-only">
                Search equipment catalog
              </label>
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
              <input
                id="hero-search"
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment, location, or brand (e.g., CAT Excavator, Sony FX6)..."
                aria-label="Search equipment catalog"
                className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Explore Fleet</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>

          {/* Category Quick Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="font-semibold text-slate-500 dark:text-slate-400">Popular:</span>
            {["Construction", "Photography", "Vehicles", "Agriculture", "Electronics", "Events"].map(
              (cat) => (
                <Link
                  key={cat}
                  href={`/equipment?category=${cat}`}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 shadow-xs transition-colors"
                >
                  {cat}
                </Link>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Fleet Sectors
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              Explore by Equipment Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Select from our 6 certified industries for immediate job-site mobilization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.name}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx * 0.08}
                >
                  <Link
                    href={`/equipment?category=${cat.name}`}
                    className={`group block p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${cat.border}`}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {cat.name}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED EQUIPMENT (6 APPROVED ITEMS) */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                Handpicked Inventory
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Featured Equipment Listings
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Top-rated machinery and production gear available for dispatch right now.
              </p>
            </div>
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-500 hover:text-amber-500 transition-colors"
            >
              <span>View All Equipment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <Package className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No featured equipment currently listed.
              </p>
              <Link
                href="/equipment"
                className="mt-3 inline-block text-xs font-bold text-amber-500 hover:underline"
              >
                Browse catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item, idx) => (
                <motion.div
                  key={item._id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx * 0.08}
                  className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  {/* Image container */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
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
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 backdrop-blur-xs border border-amber-500/30">
                      {item.category}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/90 text-slate-950">
                      {item.availableQuantity} in stock
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        <span>{item.location || "USA Metro"}</span>
                        {item.brand && <span>• {item.brand}</span>}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Rate:</span>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                          ${item.rentalPrice}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            /{item.rentalType?.toLowerCase()}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleCardClick(item._id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (EXTRA SECTION 1) */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Streamlined Logistics
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-2">
              How GearNest Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From contract reservation to job-site dispatch in 3 transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx * 0.15}
                className="relative p-8 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black text-amber-500/30 mb-4">{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              The GearNest Standard
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              Why Project Leads Choose GearNest
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Built for commercial contractors, production houses, and industrial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_ITEMS.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx * 0.08}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS (4+ REVIEWS LOADED VIA /api/reviews) */}
      <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Verified Feedback
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              Trusted by Operational Leaders
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Real reviews from superintendents, directors, and fleet managers using GearNest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <motion.div
                key={rev._id || idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx * 0.08}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={rev.avatar}
                      alt={rev.reviewerName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.reviewerName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {rev.reviewerRole}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUSTED FLEET PARTNERS / INDUSTRY GUARANTEE (EXTRA SECTION 2) */}
      <section className="py-20 bg-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The GearNest Fleet Assurance
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every listed item is held to rigorous commercial safety standards. If any rented machine
            fails to match its stated specifications on delivery, our dispatch network guarantees an
            immediate replacement or a full Stripe escrow refund within 2 hours.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/equipment"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Browse Equipment Fleet
            </Link>
            <Link
              href="/dashboard/owner/equipment/new"
              className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              List Your Machinery
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
