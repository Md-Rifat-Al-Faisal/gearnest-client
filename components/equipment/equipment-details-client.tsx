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
  SlidersHorizontal,
  Clock,
  Loader2,
  Package,
  Layers,
  Heart,
  Mail,
  CreditCard,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-accent-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Equipment Catalog</span>
        </Link>

        {/* Favorite Button (Hidden for non-customer roles) */}
        {!isNonCustomerRole && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavoriteToggle}
            disabled={togglingFavorite}
            className={`gap-2 text-xs ${isFavorited ? "text-danger border-danger/30 bg-danger/5" : ""}`}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? "fill-danger text-danger" : ""}`}
            />
            <span>{isFavorited ? "Saved in Favorites" : "Add to Favorites"}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo, Specifications, Terms, Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Card */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-xl border border-border bg-surface-2 overflow-hidden shadow-xs">
            {equipment.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="h-16 w-16" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-surface/90 text-foreground border border-border backdrop-blur-xs">
                {equipment.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-surface/90 text-foreground border border-border backdrop-blur-xs">
                {equipment.condition}
              </span>
            </div>
          </div>

          {/* Title & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent-text" />
              <span>{equipment.location || "USA Metro Logistics"}</span>
              {equipment.brand && <span>· Brand: {equipment.brand}</span>}
              {equipment.model && <span>· Model: {equipment.model}</span>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading">
              {equipment.name}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {equipment.description}
            </p>
          </div>

          {/* Technical Specifications Grid with .spec-line-kpi */}
          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-accent-text" />
              Technical Specifications & Fleet Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Manufacturer</span>
                <p className="font-bold text-foreground mt-0.5 font-heading">
                  {equipment.brand || "Standard OEM"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Model / Serial</span>
                <p className="font-bold text-foreground mt-0.5 font-heading">
                  {equipment.model || "Production Unit"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Condition Rating</span>
                <p className="font-bold text-foreground mt-0.5 font-heading">
                  {equipment.condition}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Fleet Inventory</span>
                <p className="font-bold text-foreground mt-0.5 font-heading">
                  {equipment.availableQuantity} units available
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Billing Period</span>
                <p className="font-bold text-foreground mt-0.5 font-heading">
                  Per {(equipment.rentalType || "day").toLowerCase()}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border spec-line-kpi">
                <span className="text-muted-foreground">Payment Security</span>
                <p className="font-bold text-success mt-0.5 font-heading">
                  Verified Stripe Checkout
                </p>
              </div>
            </div>
          </div>

          {/* Owner & Fleet Partner Information Card */}
          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading flex items-center gap-2">
              <Package className="h-4 w-4 text-accent-text" />
              Equipment Owner & Partner Information
            </h3>
            <div className="flex items-center gap-4 pt-1">
              <div className="h-12 w-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-foreground font-bold text-base shrink-0">
                {(equipment.ownerName || "P").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground font-heading">
                    {equipment.ownerName || "GearNest Verified Fleet Partner"}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-accent-text border border-primary/20">
                    Verified Partner
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-accent-text shrink-0" />
                  <span>Owner Email: <span className="font-semibold text-foreground">{equipment.ownerEmail || "owner@gearnest.com"}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                  <MapPin className="h-3 w-3 text-accent-text shrink-0" />
                  <span>Depot Operating Location: {equipment.location || "USA Metro Depots"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Terms & Policies */}
          <div className="p-6 rounded-xl border border-border bg-surface space-y-3 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent-text" />
              Rental Terms & Job-Site Dispatch Rules
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {equipment.rentalTerms ||
                "Standard commercial rental terms apply. Clear operating expectations, direct equipment handover, and secure card payment processing via Stripe."}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Quick Booking Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-surface space-y-6 shadow-md sticky top-24">
            {/* Price banner */}
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Rental Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-foreground font-heading">
                  ${equipment.rentalPrice}
                </span>
                <span className="text-sm text-muted-foreground">
                  / per {(equipment.rentalType || "day").toLowerCase()}
                </span>
              </div>
            </div>

            {/* Availability pill */}
            <div className="flex items-center gap-2">
              {equipment.availableQuantity > 0 ? (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-success/10 text-success border border-success/20">
                  {equipment.availableQuantity} units available now
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Self-booking alert if owner */}
            {isOwner && (
              <div className="p-3.5 rounded-lg bg-surface-2 border border-border text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You own this equipment listing. Owners cannot book their own machinery.</span>
              </div>
            )}

            {/* Quick Rent Action */}
            {isNonCustomerRole ? (
              <div className="p-4 rounded-lg bg-surface-2 border border-border text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {currentUser.role === "admin" ? "Admin Account Active" : "Equipment Owner Account Active"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Direct equipment booking is reserved for customer/renter accounts.
                </p>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                disabled={equipment.availableQuantity <= 0 || isOwner}
                className="w-full text-sm font-bold flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>
                  {isOwner
                    ? "Owner Cannot Book Own Equipment"
                    : equipment.availableQuantity > 0
                      ? "Book Equipment Now"
                      : "Currently Unavailable"}
                </span>
              </Button>
            )}

            {/* Owner assurance */}
            <div className="pt-2 text-center text-[11px] text-muted-foreground border-t border-border flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-text" />
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
              <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
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
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Start Date *
                </label>
                <input
                  id="modal-start-date"
                  type="date"
                  required
                  min={todayString}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label
                  htmlFor="modal-end-date"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Return Date *
                </label>
                <input
                  id="modal-end-date"
                  type="date"
                  required
                  min={startDate || todayString}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="modal-quantity"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Required Quantity * (Available: {equipment.availableQuantity})
              </label>
              <input
                id="modal-quantity"
                type="number"
                min="1"
                max={equipment.availableQuantity}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Contact number */}
            <div>
              <label
                htmlFor="modal-contact-number"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Contact Phone Number *
              </label>
              <input
                id="modal-contact-number"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Delivery address */}
            <div>
              <label
                htmlFor="modal-delivery-address"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Job-Site Delivery / Drop-off Address *
              </label>
              <input
                id="modal-delivery-address"
                type="text"
                autoComplete="street-address"
                required
                placeholder="e.g. 104 Industrial Pkwy, Austin, TX"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="modal-notes"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Additional Operator Notes (Optional)
              </label>
              <textarea
                id="modal-notes"
                rows={2}
                placeholder="Gate code, site contact person, trailer access..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Live Price Preview Box */}
            {startDate && endDate && (
              <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Duration:</span>
                  <span className="font-semibold text-foreground">
                    {totalDays} {totalDays === 1 ? "day" : "days"} ({units} {(equipment.rentalType || "day").toLowerCase()} units)
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Quantity:</span>
                  <span className="font-semibold text-foreground">
                    {quantity} machine(s)
                  </span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                  <span>Calculated Total:</span>
                  <span className="text-accent-text font-heading font-extrabold text-base">
                    ${estimatedTotal}
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingBooking || !startDate || !endDate}
                className="font-bold flex items-center gap-2"
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
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
