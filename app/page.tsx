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
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  Calendar,
  Building2,
  Phone,
  Mail,
  Send,
  Award,
  Users2,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { apiRequest } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    name: "Construction Equipment",
    displayTitle: "Construction Equipment",
    icon: HardHat,
    description: "Excavators, skid steers, scissor lifts & heavy compaction",
    color: "from-amber-500/20 to-orange-500/20",
    border: "group-hover:border-amber-500/50",
  },
  {
    name: "Photography Equipment",
    displayTitle: "Photography Equipment",
    icon: Camera,
    description: "Cinema cameras, prime lenses, studio lighting & gimbals",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "group-hover:border-blue-500/50",
  },
  {
    name: "Vehicles & Transportation",
    displayTitle: "Vehicles & Transportation",
    icon: Truck,
    description: "Heavy dually haulers, extended cargo vans & flatbeds",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "group-hover:border-emerald-500/50",
  },
  {
    name: "Agriculture Equipment",
    displayTitle: "Agriculture Equipment",
    icon: Tractor,
    description: "Utility tractors, rotary mowers, seeders & field loaders",
    color: "from-green-500/20 to-lime-500/20",
    border: "group-hover:border-green-500/50",
  },
  {
    name: "Electronics",
    displayTitle: "Electronics",
    icon: Cpu,
    description: "Thermal cameras, RTK survey drones, oscilloscopes & power hubs",
    color: "from-purple-500/20 to-pink-500/20",
    border: "group-hover:border-purple-500/50",
  },
  {
    name: "Event Equipment",
    displayTitle: "Event Equipment",
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
    title: "Secure Card Checkout",
    description:
      "Direct card payments powered by Stripe with instant reservation confirmation and digital transaction receipts.",
  },
  {
    icon: Layers,
    title: "Flexible Handover & Pickup",
    description:
      "Coordinate convenient job site delivery or direct equipment pickup directly with verified equipment owners.",
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
    title: "Instant Stripe Checkout",
    description:
      "Select your rental dates, review calculated rental rates, and complete booking via encrypted Stripe card payment.",
  },
  {
    step: "03",
    title: "Job Site Handover & Return",
    description:
      "Coordinate with the equipment owner for handover, complete your project, and return the equipment per agreed rental terms.",
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
  const [searchQuery, setSearchQuery] = useState("")
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
      {/* 1. HERO BANNER - High-Quality Machinery Fleet Background with Cinematic Contrast Overlay */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-20 sm:pt-28 sm:pb-28 border-b border-slate-800 transition-colors">
        {/* Background Machinery Fleet Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=2000&q=85"
            alt="Commercial heavy machinery fleet at industrial site"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        </div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-700/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            variants={heroBadge}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Commercial & Industrial Equipment Rental Hub</span>
          </motion.div>

          <motion.h1
            variants={heroHeading}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-white"
          >
            Power Your Job Site with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
              Verified Machinery
            </span>
          </motion.h1>

          <motion.p
            variants={heroSubtitle}
            initial="hidden"
            animate="visible"
            className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Access top-tier excavators, cinema cameras, utility tractors, and survey drones
            from verified equipment partners. Secured with instant card checkout powered by Stripe.
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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
          </div>

          {/* High-Quality Hero Showcase Image */}
          <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-slate-900 group">
            <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=85"
                alt="Commercial heavy machinery fleet on job site"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Floating Verified Trust Badges */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-bold shadow-lg">
                <ShieldCheck className="size-3.5 text-amber-400" />
                <span>Verified Commercial Fleet</span>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-bold shadow-lg">
                <MapPin className="size-3.5 text-emerald-400" />
                <span>Multi-Category Machinery Hub</span>
              </div>

              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] sm:text-xs font-extrabold shadow-lg">
                <Clock className="size-3.5 text-slate-950" />
                <span>Direct Partner Coordination</span>
              </div>
            </div>
          </div>
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
                        {cat.displayTitle || cat.name}
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
                Approved machinery and production gear available for booking right now.
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
                    {item.availableQuantity > 0 ? (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/90 text-slate-950">
                        {item.availableQuantity} in stock
                      </span>
                    ) : (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/90 text-white">
                        Rented Out
                      </span>
                    )}
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
      <section id="how-it-works" className="scroll-mt-16 py-20 bg-slate-900 text-white border-b border-slate-800">
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
      <section id="why-us" className="scroll-mt-16 py-20 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
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
      <section id="reviews" className="scroll-mt-16 py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
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
                    {[...Array(5)].map((_, i) => {
                      const isFilled = i < (rev.rating || 5)
                      return (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${isFilled ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                        />
                      )
                    })}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                      {(rev.rating || 5).toFixed(1)}
                    </span>
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
            Every listed item is held to rigorous commercial quality standards. If any rented machine
            fails to match its stated specifications, our team coordinates prompt owner resolution
            and transparent assistance for peace of mind.
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

      {/* 8. ABOUT US (MISSION, FLEET STANDARDS & STATS) */}
      <section id="about" className="scroll-mt-16 py-24 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Building2 className="size-3.5" />
                About GearNest Marketplace
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Pioneering the Next Generation of Heavy Machinery Logistics
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Founded to eliminate downtime on high-stakes construction, film, agriculture, and infrastructure sites, GearNest provides contractors and project superintendents with instant, frictionless access to vetted machinery from certified fleet owners nationwide.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Every transaction is backed by server-verified Stripe checkout, dynamic inventory tracking, and transparent equipment specifications — empowering contractors to rent with complete confidence.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-amber-500">6</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Fleet Sectors</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-emerald-500">100%</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Admin Moderated</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-blue-500">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
                      : "5.0"}★
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Verified Reviews</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
                  <div className="text-2xl font-black text-purple-500">Stripe</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Instant Checkout</div>
                </div>
              </div>
            </motion.div>

            {/* Visual Feature Grid */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Award className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Admin Moderated Fleet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every machine undergoes specifications verification and administrative review prior to catalog listing publication.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Clear Rental Terms</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Transparent daily, weekly, and monthly rates with owner-defined operational terms and real-time inventory tracking.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Users2 className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Verified Fleet Owners</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Direct connection to authorized industrial suppliers, local fleet managers, and independent heavy machinery partners.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Direct Owner Coordination</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Coordinate directly with local equipment owners for jobsite handover, machine walkthrough, and scheduled return.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <section id="faq" className="scroll-mt-16 py-24 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <HelpCircle className="size-3.5" />
              Contract & Fleet FAQs
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything you need to know about machinery reservation, delivery logistics, and insurance terms.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 10. CONTACT US (SUPPORT INQUIRY & DISPATCH HOTLINE) */}
      <section id="contact" className="scroll-mt-16 py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Direct Assistance
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              Contact & Equipment Inquiries
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Have questions about machinery availability, rental terms, or fleet partner onboarding? Send our team a message.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Contact Information Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Mail className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Online Inquiries Desk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submit equipment inquiries via the form. Our team reviews all requests promptly:
                </p>
                <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  dispatch@gearnest.com
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Mail className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Corporate & Fleet Inquiries</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  For fleet partner onboarding, contract agreements, and general support:
                </p>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  support@gearnest.com
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MapPin className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">National Partner Network</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distributed equipment listings:
                </p>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Verified equipment owners and contractors across major metro hubs nationwide.
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-2 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Send an Equipment Inquiry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Our team reviews submitted equipment inquiries and coordinates with fleet owners regarding equipment availability.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      name="contactName"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Work Email *
                    </label>
                    <input
                      id="contact-email"
                      name="contactEmail"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. marcus@buildcorp.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +1 555 0100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Machinery Segment
                    </label>
                    <select
                      id="contact-category"
                      name="contactCategory"
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="Construction">Heavy Construction</option>
                      <option value="Photography">Photography & Film Gear</option>
                      <option value="Vehicles">Commercial Haulers & Vans</option>
                      <option value="Agriculture">Agriculture & Tractors</option>
                      <option value="Electronics">Thermal & Survey Electronics</option>
                      <option value="Events">Event Audio & Stage Lighting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jobsite Requirements & Duration *
                  </label>
                  <textarea
                    id="contact-message"
                    name="contactMessage"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Specify project address, target rental dates, machine specs, and any site constraints..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`size-3.5 ${contactSubmitting ? "animate-pulse" : ""}`} />
                    <span>{contactSubmitting ? "Submitting..." : "Send Inquiry"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
