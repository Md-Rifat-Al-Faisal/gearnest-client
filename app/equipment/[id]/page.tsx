"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Truck,
  Wrench,
  Clock,
  Loader2,
  Package,
  Layers,
  Sparkles,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

interface SingleEquipment {
  _id: string
  name: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: "Daily" | "Weekly" | "Monthly"
  availableQuantity: number
  condition: string
  brand: string
  model: string
  image: string
  rentalTerms: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  createdAt: string
}

export default function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const equipmentId = resolvedParams.id
  const router = useRouter()
  const { data: session } = useSession()

  const [item, setItem] = useState<SingleEquipment | null>(null)
  const [loading, setLoading] = useState(true)

  // Booking estimation state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rentQuantity, setRentQuantity] = useState(1)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true)
        const res = await fetch(`${apiBase}/api/equipment/${equipmentId}`)
        const data = await res.json()

        if (res.ok && data.equipment) {
          setItem(data.equipment)
        } else {
          toast.error(data.message || "Equipment item not found")
        }
      } catch (err) {
        console.error("Failed to load equipment:", err)
        toast.error("Could not load equipment details")
      } finally {
        setLoading(false)
      }
    }

    if (equipmentId) {
      loadEquipment()
    }
  }, [equipmentId, apiBase])

  // Calculation logic matching server: units = Math.ceil(days / (1 | 7 | 30))
  let totalDays = 0
  let units = 1
  let estimatedTotal = 0

  if (startDate && endDate && item) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    const divisor = item.rentalType === "Monthly" ? 30 : item.rentalType === "Weekly" ? 7 : 1
    units = Math.max(1, Math.ceil(totalDays / divisor))
    estimatedTotal = item.rentalPrice * units * rentQuantity
  }

  const handleBookingClick = () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/equipment/${equipmentId}`)
      return
    }

    if (item && session.user.id === item.ownerId) {
      toast.error("You cannot book your own equipment listing.")
      return
    }

    if (!startDate || !endDate) {
      toast.info("Please select both a start date and return date for your rental.")
      return
    }

    toast.info("Stripe payment checkout will be initiated in Phase 3!")
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading equipment specifications...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Equipment Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested equipment may have been removed or does not exist.
        </p>
        <Link
          href="/equipment"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Equipment Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image, Details, Specifications, Terms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Card */}
          <div className="relative aspect-video w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Package className="h-16 w-16" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                {item.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                {item.condition}
              </span>
            </div>
          </div>

          {/* Title & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>{item.location || "USA Metro Logistics"}</span>
              {item.brand && <span>• {item.brand}</span>}
              {item.model && <span>• Model: {item.model}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {item.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Quick Specifications Grid */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" />
              Technical Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Manufacturer</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.brand || "Standard OEM"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Model / Serial</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.model || "Production Unit"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Condition Rating</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.condition}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Fleet Units in Stock</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.availableQuantity} units
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Rental Type</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {item.rentalType}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Stripe Escrow</span>
                <p className="font-bold text-emerald-500 mt-0.5">
                  Protected & Verified
                </p>
              </div>
            </div>
          </div>

          {/* Rental Terms & Policies */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              Rental Terms & Job-Site Dispatch Rules
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.rentalTerms ||
                "Standard commercial rental terms apply. Valid operator license required for heavy machinery. Refundable security deposit held via Stripe until equipment is inspected upon return."}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Reservation Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-md sticky top-24">
            {/* Price banner */}
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Rental Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ${item.rentalPrice}
                </span>
                <span className="text-sm text-slate-500">
                  / per {item.rentalType.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rental Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity (Max: {item.availableQuantity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={item.availableQuantity}
                  value={rentQuantity}
                  onChange={(e) => setRentQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Price Breakdown Calculation */}
            {startDate && endDate && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Rental duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {totalDays} {totalDays === 1 ? "day" : "days"} ({units} {item.rentalType.toLowerCase()} units)
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Quantity:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{rentQuantity} machine</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Estimated Total:</span>
                  <span className="text-amber-500 font-extrabold">${estimatedTotal}</span>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <button
              onClick={handleBookingClick}
              disabled={item.availableQuantity <= 0}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4 stroke-[2.5]" />
              <span>{item.availableQuantity > 0 ? "Reserve Equipment" : "Currently Out of Stock"}</span>
            </button>

            {/* Owner assurance */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Equipment Partner: {item.ownerName || "GearNest Verified Fleet"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
