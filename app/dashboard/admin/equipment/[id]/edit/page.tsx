"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ShieldCheck,
  Upload,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { uploadImageToImgBB } from "@/lib/upload"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const CATEGORIES = [
  "Construction",
  "Photography",
  "Vehicles",
  "Agriculture",
  "Electronics",
  "Events",
]

const RENTAL_TYPES = ["Daily", "Weekly", "Monthly"]
const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"]
const STATUSES = ["Pending", "Approved", "Rejected"]

export default function AdminEditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const equipmentId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Construction")
  const [location, setLocation] = useState("")
  const [rentalPrice, setRentalPrice] = useState("")
  const [rentalType, setRentalType] = useState("Daily")
  const [availableQuantity, setAvailableQuantity] = useState("1")
  const [condition, setCondition] = useState("Excellent")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [image, setImage] = useState("")
  const [rentalTerms, setRentalTerms] = useState("")
  const [status, setStatus] = useState("Pending")
  const [ownerName, setOwnerName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")

  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true)
        const res = await apiRequest(`/api/admin/equipment/${equipmentId}`)
        const data = await res.json()

        if (res.ok && data.equipment) {
          const eq = data.equipment
          setName(eq.name || "")
          setDescription(eq.description || "")
          setCategory(eq.category || "Construction")
          setLocation(eq.location || "")
          setRentalPrice(eq.rentalPrice !== undefined ? String(eq.rentalPrice) : "")
          setRentalType(eq.rentalType || "Daily")
          setAvailableQuantity(eq.availableQuantity !== undefined ? String(eq.availableQuantity) : "1")
          setCondition(eq.condition || "Excellent")
          setBrand(eq.brand || "")
          setModel(eq.model || "")
          setImage(eq.image || "")
          setRentalTerms(eq.rentalTerms || "")
          setStatus(eq.status || "Pending")
          setOwnerName(eq.ownerName || "")
          setOwnerEmail(eq.ownerEmail || "")
        } else {
          toast.error(data.message || "Failed to find equipment item")
          router.push("/dashboard/admin/equipment")
        }
      } catch {
        toast.error("Failed to load equipment data")
      } finally {
        setLoading(false)
      }
    }

    if (equipmentId) {
      loadItem()
    }
  }, [equipmentId, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const url = await uploadImageToImgBB(file)
      setImage(url)
      toast.success("Image uploaded successfully to ImgBB!")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const price = parseFloat(rentalPrice)
    const quantity = parseInt(availableQuantity, 10)

    if (isNaN(price) || price < 0) {
      toast.error("Rental price must be a valid positive number")
      return
    }

    if (isNaN(quantity) || quantity < 0) {
      toast.error("Available quantity must be a non-negative integer")
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        rentalPrice: price,
        rentalType,
        availableQuantity: quantity,
        condition,
        brand: brand.trim(),
        model: model.trim(),
        image: image.trim(),
        rentalTerms: rentalTerms.trim(),
        status,
      }

      const res = await apiRequest(`/api/admin/equipment/${equipmentId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Equipment updated by administrator!")
        router.push("/dashboard/admin/equipment")
      } else {
        toast.error(data.message || "Failed to update equipment")
      }
    } catch {
      toast.error("Network error while updating equipment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading equipment for moderation...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="size-9"
        >
          <Link href="/dashboard/admin/equipment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            Admin Equipment Override
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modify equipment specifications or moderation status. Partner: {ownerName} ({ownerEmail})
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Moderation Status Card */}
        <div className="p-6 rounded-xl border border-primary/20 bg-surface space-y-3 shadow-xs">
          <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-text" />
            Moderation Status
          </h2>
          <div className="flex items-center gap-4">
            {STATUSES.map((st) => (
              <label
                key={st}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all ${
                  status === st
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-surface border-border text-foreground hover:bg-surface-2"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={st}
                  checked={status === st}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden"
                />
                <span>{st}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-5 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground">
            General Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label
                htmlFor="admin-edit-name"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Equipment Title / Name *
              </label>
              <input
                id="admin-edit-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-category"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Category *
              </label>
              <select
                id="admin-edit-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-edit-location"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Location *
              </label>
              <input
                id="admin-edit-location"
                name="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-brand"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Brand
              </label>
              <input
                id="admin-edit-brand"
                name="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-model"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Model
              </label>
              <input
                id="admin-edit-model"
                name="model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-condition"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Condition
              </label>
              <select
                id="admin-edit-condition"
                name="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-edit-quantity"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Available Units
              </label>
              <input
                id="admin-edit-quantity"
                name="availableQuantity"
                type="number"
                min="0"
                required
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="admin-edit-description"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Description
              </label>
              <textarea
                id="admin-edit-description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-5 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground">
            Pricing & Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="admin-edit-price"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Rental Price ($)
              </label>
              <input
                id="admin-edit-price"
                name="rentalPrice"
                type="number"
                step="0.01"
                min="0"
                required
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-rental-type"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Billing Period
              </label>
              <select
                id="admin-edit-rental-type"
                name="rentalType"
                value={rentalType}
                onChange={(e) => setRentalType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {RENTAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    Per {type.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="admin-edit-terms"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Rental Terms
              </label>
              <textarea
                id="admin-edit-terms"
                name="rentalTerms"
                rows={3}
                value={rentalTerms}
                onChange={(e) => setRentalTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground">Photo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="space-y-3">
              <label
                htmlFor="admin-edit-file-input"
                className="border-2 border-dashed border-border hover:border-primary rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-surface-2/30"
              >
                <input
                  id="admin-edit-file-input"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-semibold">Uploading to ImgBB...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs font-medium">Click to replace photo</span>
                  </div>
                )}
              </label>

              <label htmlFor="admin-edit-image-url" className="sr-only">
                Direct image URL
              </label>
              <input
                id="admin-edit-image-url"
                name="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste image URL"
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="aspect-video w-full rounded-xl border border-border bg-surface-2 overflow-hidden flex items-center justify-center">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/dashboard/admin/equipment">
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploadingImage}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Overrides...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Save Admin Overrides</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
