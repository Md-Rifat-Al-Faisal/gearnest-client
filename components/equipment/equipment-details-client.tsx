"use client"

import { useState, useEffect } from "react"
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
  Heart,
  Phone,
  Mail,
  X,
  CreditCard,
  FileText,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface EquipmentData {
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

interface EquipmentDetailsClientProps {
  equipment: EquipmentData
  currentUser: {
    id: string
    name: string
    email: string
    role?: string
    phone?: string
    address?: string
  }
}

export function EquipmentDetailsClient({
  equipment,
  currentUser,
}: EquipmentDetailsClientProps) {
  const router = useRouter()

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [contactNumber, setContactNumber] = useState(currentUser.phone || "")
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser.address || "")
  const [notes, setNotes] = useState("")
  const [submittingBooking, setSubmittingBooking] = useState(false)

  // Booking modal accessibility: Escape key listener and body scroll lock
  useEffect(() => {
    if (!modalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  const isOwner = currentUser.id === equipment.ownerId

  // Check if item is already in user's favorites
  useEffect(() => {
    if (currentUser.role !== "customer") return
    async function checkFavorite() {
      try {
        const res = await apiRequest("/api/customer/favorites")
        if (res.ok) {
          const data = await res.json()
          if (data.favorites) {
            const exists = data.favorites.some(
              (f: any) => f.equipmentId === equipment._id || f.equipment?._id === equipment._id
            )
            setIsFavorited(exists)
          }
        }
      } catch {
        // Silently ignore favorite check errors
      }
    }

    checkFavorite()
  }, [equipment._id, currentUser.role])

  // Handle Favorite toggle
  const handleFavoriteToggle = async () => {
    try {
      setTogglingFavorite(true)
      if (isFavorited) {
        const res = await apiRequest(`/api/customer/favorites/${equipment._id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setIsFavorited(false)
          toast.success("Removed from your saved equipment")
        } else {
          toast.error("Could not remove favorite")
        }
      } else {
        const res = await apiRequest("/api/customer/favorites", {
          method: "POST",
          body: JSON.stringify({ equipmentId: equipment._id }),
        })
        if (res.ok) {
          setIsFavorited(true)
          toast.success("Added to your saved equipment!")
        } else {
          toast.error("Could not save favorite")
        }
      }
    } catch {
      toast.error("Network error while updating favorite")
    } finally {
      setTogglingFavorite(false)
    }
  }

  // Live rental calculations: days, units, and total
  let totalDays = 0
  let units = 1
  let estimatedTotal = 0

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    const divisor =
      equipment.rentalType === "Monthly" ? 30 : equipment.rentalType === "Weekly" ? 7 : 1
    units = Math.max(1, Math.ceil(totalDays / divisor))
    estimatedTotal = equipment.rentalPrice * units * quantity
  }

  // Handle Booking Modal Checkout
  const handleProceedToStripe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isOwner) {
      toast.error("You cannot book your own machinery listing.")
      return
    }

    if (!startDate || !endDate) {
      toast.error("Please select both a start date and return date.")
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      toast.error("End date must be on or after start date.")
      return
    }

    if (quantity > equipment.availableQuantity) {
      toast.error(`Only ${equipment.availableQuantity} units are currently available.`)
      return
    }

    try {
      setSubmittingBooking(true)

      const payload = {
        equipmentId: equipment._id,
        startDate,
        endDate,
        quantity,
        contactNumber: contactNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
      }

      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        toast.info("Redirecting to secure Stripe Checkout...")
        window.location.href = data.url
      } else {
        toast.error(data.message || "Failed to initialize checkout session")
        setSubmittingBooking(false)
      }
    } catch (err: any) {
      console.error("Booking checkout error:", err)
      toast.error("Failed to connect to checkout service")
      setSubmittingBooking(false)
    }
  }

  // Local-date helper for calendar picker min bound
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  const todayString = getLocalDateString()
  const isNonCustomerRole = Boolean(currentUser.id && currentUser.role !== "customer")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Favorite action */}
      <div className="flex items-center justify-between">
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Equipment Catalog</span>
        </Link>

        {/* Favorite Button (Hidden for non-customer roles) */}
        {!isNonCustomerRole && (
          <button
            onClick={handleFavoriteToggle}
            disabled={togglingFavorite}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isFavorited
                ? "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
                : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-500"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`}
            />
            <span>{isFavorited ? "Saved in Favorites" : "Add to Favorites"}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo, Specifications, Terms, Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Card */}
          <div className="relative aspect-video w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            {equipment.image ? (
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Package className="h-16 w-16" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                {equipment.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                {equipment.condition}
              </span>
            </div>
          </div>

          {/* Title & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>{equipment.location || "USA Metro Logistics"}</span>
              {equipment.brand && <span>• Brand: {equipment.brand}</span>}
              {equipment.model && <span>• Model: {equipment.model}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {equipment.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {equipment.description}
            </p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" />
              Technical Specifications & Fleet Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Manufacturer</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {equipment.brand || "Standard OEM"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Model / Serial</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {equipment.model || "Production Unit"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Condition Rating</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {equipment.condition}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Units in Fleet</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {equipment.availableQuantity} units available
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Billing Period</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  Per {(equipment.rentalType || "day").toLowerCase()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Payment Security</span>
                <p className="font-bold text-emerald-500 mt-0.5">
                  Verified Stripe Checkout
                </p>
              </div>
            </div>
          </div>

          {/* Owner & Fleet Partner Information Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Equipment Owner & Partner Information
            </h3>
            <div className="flex items-center gap-4 pt-1">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-base shrink-0">
                {(equipment.ownerName || "P").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {equipment.ownerName || "GearNest Verified Fleet Partner"}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified Partner
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Owner Email: <span className="font-semibold text-slate-900 dark:text-white">{equipment.ownerEmail || "owner@gearnest.com"}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                  <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                  <span>Depot Operating Location: {equipment.location || "USA Metro Depots"}</span>
                </div>
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
              {equipment.rentalTerms ||
                "Standard commercial rental terms apply. Clear operating expectations, certified equipment handover, and secure digital payment protection via Stripe."}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Quick Booking Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-md sticky top-24">
            {/* Price banner */}
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Rental Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ${equipment.rentalPrice}
                </span>
                <span className="text-sm text-slate-500">
                  / per {(equipment.rentalType || "day").toLowerCase()}
                </span>
              </div>
            </div>

            {/* Availability pill */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  equipment.availableQuantity > 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {equipment.availableQuantity > 0
                  ? `${equipment.availableQuantity} units available now`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Self-booking alert if owner */}
            {isOwner && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>You own this equipment listing. Owners cannot book their own machinery.</span>
              </div>
            )}

            {/* Quick Rent Action (Hidden / restricted for non-customer roles) */}
            {isNonCustomerRole ? (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.role === "admin" ? "Admin Account Active" : "Equipment Owner Account Active"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Direct equipment booking is reserved for customer/renter accounts.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                disabled={equipment.availableQuantity <= 0 || isOwner}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Calendar className="h-4 w-4 stroke-[2.5]" />
                <span>
                  {isOwner
                    ? "Owner Cannot Book Own Equipment"
                    : equipment.availableQuantity > 0
                      ? "Book Equipment Now"
                      : "Currently Unavailable"}
                </span>
              </button>
            )}

            {/* Owner assurance */}
            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Partner: {equipment.ownerName || "GearNest Verified Partner"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* "BOOK NOW" MODAL (USING SHADCN DIALOG) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          {/* Modal Header */}
          <DialogHeader>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Rental Reservation
              </span>
              <DialogTitle>
                Book {equipment.name}
              </DialogTitle>
            </div>
            <DialogClose onClose={() => setModalOpen(false)} />
          </DialogHeader>

            <form onSubmit={handleProceedToStripe} className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-start-date"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Start Date *
                  </label>
                  <input
                    id="modal-start-date"
                    name="startDate"
                    type="date"
                    required
                    min={todayString}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-end-date"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Return Date *
                  </label>
                  <input
                    id="modal-end-date"
                    name="endDate"
                    type="date"
                    required
                    min={startDate || todayString}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label
                  htmlFor="modal-quantity"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Required Quantity * (Available: {equipment.availableQuantity})
                </label>
                <input
                  id="modal-quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max={equipment.availableQuantity}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Contact number */}
              <div>
                <label
                  htmlFor="modal-contact-number"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Contact Phone Number *
                </label>
                <input
                  id="modal-contact-number"
                  name="contactNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Delivery address */}
              <div>
                <label
                  htmlFor="modal-delivery-address"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Job-Site Delivery / Drop-off Address *
                </label>
                <input
                  id="modal-delivery-address"
                  name="deliveryAddress"
                  type="text"
                  autoComplete="street-address"
                  required
                  placeholder="e.g. 104 Industrial Pkwy, Austin, TX"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="modal-notes"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Additional Operator Notes (Optional)
                </label>
                <textarea
                  id="modal-notes"
                  name="notes"
                  rows={2}
                  placeholder="Gate code, site contact person, trailer access..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Live Price Preview Box */}
              {startDate && endDate && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {totalDays} {totalDays === 1 ? "day" : "days"} ({units} {(equipment.rentalType || "day").toLowerCase()} units)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Quantity:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {quantity} machine(s)
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-500/20 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Calculated Total:</span>
                    <span className="text-amber-500 font-extrabold text-base">
                      ${estimatedTotal}
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking || !startDate || !endDate}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {submittingBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay with Stripe (${estimatedTotal || equipment.rentalPrice})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  )
}
