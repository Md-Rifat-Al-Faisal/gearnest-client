"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  PackagePlus,
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

export default function NewEquipmentPage() {
  const router = useRouter()

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

  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const url = await uploadImageToImgBB(file)
      setImage(url)
      toast.success("Equipment photo uploaded successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image to ImgBB")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !category || !rentalPrice || !rentalType || !availableQuantity) {
      toast.error("Please fill in all mandatory equipment details")
      return
    }

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
      }

      const res = await apiRequest("/api/owner/equipment", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Equipment submitted! It will be reviewed by an administrator before appearing live.")
        router.push("/dashboard/owner/equipment")
      } else {
        toast.error(data.message || "Failed to submit equipment listing")
      }
    } catch {
      toast.error("Network error while submitting listing. Please try again.")
    } finally {
      setSubmitting(false)
    }
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
          <Link href="/dashboard/owner/equipment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            List New Equipment
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add a machine or production tool to your rentable inventory.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Information Card */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-5 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-accent-text" />
            General Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label
                htmlFor="new-equipment-name"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Equipment Title / Name *
              </label>
              <input
                id="new-equipment-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Caterpillar 308 CR Mini Excavator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-equipment-category"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Category *
              </label>
              <select
                id="new-equipment-category"
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
                htmlFor="new-equipment-location"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Location (City, State / Metro) *
              </label>
              <input
                id="new-equipment-location"
                name="location"
                type="text"
                required
                placeholder="e.g. Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-equipment-brand"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Manufacturer / Brand
              </label>
              <input
                id="new-equipment-brand"
                name="brand"
                type="text"
                placeholder="e.g. Caterpillar, Sony, John Deere"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-equipment-model"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Model Number / Variant
              </label>
              <input
                id="new-equipment-model"
                name="model"
                type="text"
                placeholder="e.g. 308 CR / FX6 / S650"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-equipment-condition"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Condition
              </label>
              <select
                id="new-equipment-condition"
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
                htmlFor="new-equipment-quantity"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Units Available for Rent *
              </label>
              <input
                id="new-equipment-quantity"
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
                htmlFor="new-equipment-description"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Detailed Description & Features
              </label>
              <textarea
                id="new-equipment-description"
                name="description"
                rows={4}
                placeholder="Describe horsepower, included accessories, boom reach, lenses, attachments, or operating specs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Terms Card */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-5 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <span className="text-accent-text font-extrabold text-lg">$</span>
            Rental Pricing & Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="new-equipment-price"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Rental Price (USD) *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                  $
                </span>
                <input
                  id="new-equipment-price"
                  name="rentalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="150.00"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new-equipment-rental-type"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Rental Billing Period *
              </label>
              <select
                id="new-equipment-rental-type"
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
                htmlFor="new-equipment-rental-terms"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Rental Terms & Handover Requirements
              </label>
              <textarea
                id="new-equipment-rental-terms"
                name="rentalTerms"
                rows={3}
                placeholder="e.g. Valid operator license required. Fuel tank full upon handover. Return in clean working condition."
                value={rentalTerms}
                onChange={(e) => setRentalTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-accent-text" />
            Equipment Photo (ImgBB Hosted)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="space-y-3">
              <label
                htmlFor="new-equipment-file-input"
                className="block text-xs font-semibold text-foreground"
              >
                Upload Image File
              </label>
              <label
                htmlFor="new-equipment-file-input"
                className="border-2 border-dashed border-border hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group bg-surface-2/30"
              >
                <input
                  id="new-equipment-file-input"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-xs font-semibold">Uploading to ImgBB CDN...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary">
                    <Upload className="h-8 w-8" />
                    <span className="text-xs font-medium">Click to select photo or drag here</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP up to 10MB</span>
                  </div>
                )}
              </label>

              <div className="pt-2">
                <label
                  htmlFor="new-equipment-image-url"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Or enter Direct Image URL
                </label>
                <input
                  id="new-equipment-image-url"
                  name="image"
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-3">
                Live Preview
              </label>
              <div className="aspect-video w-full rounded-xl border border-border bg-surface-2 overflow-hidden flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">No image provided yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/dashboard/owner/equipment">
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
                <span>Submitting Listing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Publish Listing for Moderation</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
