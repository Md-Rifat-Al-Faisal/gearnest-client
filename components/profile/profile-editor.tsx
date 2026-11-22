"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Upload,
  Loader2,
  CheckCircle2,
  Camera,
  Save,
} from "lucide-react"
import { apiRequest } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  image?: string
  phone?: string
  address?: string
  createdAt?: string
}

interface ProfileEditorProps {
  initialUser?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string | null
    phone?: string
    address?: string
  }
}

export function ProfileEditor({ initialUser }: ProfileEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!initialUser)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [name, setName] = useState(initialUser?.name || "")
  const [email, setEmail] = useState(initialUser?.email || "")
  const [role, setRole] = useState(initialUser?.role || "customer")
  const [image, setImage] = useState(initialUser?.image || "")
  const [phone, setPhone] = useState(initialUser?.phone || "")
  const [address, setAddress] = useState(initialUser?.address || "")

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await apiRequest("/api/users/profile")
        const data = await res.json()
        if (res.ok && data.user) {
          setName(data.user.name || "")
          setEmail(data.user.email || "")
          setRole(data.user.role || "customer")
          setImage(data.user.image || "")
          setPhone(data.user.phone || "")
          setAddress(data.user.address || "")
        }
      } catch {
        // Fall back to initialUser if provided
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProfile()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!apiKey) {
      toast.error("ImgBB API key is not configured")
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.data?.url) {
        setImage(data.data.url)
        toast.success("Profile photo uploaded to ImgBB!")
      } else {
        toast.error("Image upload failed. You can paste a direct photo URL instead.")
      }
    } catch {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      setSaving(true)
      const res = await apiRequest("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        try {
          // Immediately update Better-Auth session cookie cache so navbar/sidebar refresh in real time
          await authClient.updateUser({
            name: name.trim(),
            image: image.trim() || undefined,
          })
        } catch {
          // Non-blocking fallback
        }
        toast.success("Profile updated successfully!")
        router.refresh()
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch {
      toast.error("Network error while updating profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading profile data...</p>
      </div>
    )
  }

  const roleBadgeStyle =
    role === "admin"
      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
      : role === "owner"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-blue-500/10 text-blue-500 border-blue-500/20"

  const roleTitle =
    role === "admin" ? "Platform Administrator" : role === "owner" ? "Equipment Fleet Partner" : "Equipment Renter"

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="size-20 sm:size-24 rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={name || "Avatar"} className="size-full object-cover" />
              ) : (
                <User className="size-10 sm:size-12 text-slate-400" />
              )}
            </div>

            <label
              htmlFor="avatar-file-upload"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer transition-transform hover:scale-105"
              title="Upload new photo"
            >
              {uploadingImage ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
              <input
                id="avatar-file-upload"
                name="avatarFile"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="sr-only"
              />
            </label>
          </div>

          {/* User Info & Role Badge */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white truncate">
                {name || "Your Profile"}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle}`}
              >
                <Shield className="size-3" />
                {roleTitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Account & Profile Information
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage your display name, photo, and job-site contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address <span className="text-slate-400 font-normal">(Primary Auth ID)</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="profile-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* City / Address */}
            <div>
              <label
                htmlFor="profile-address"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                City / Operating Location
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  id="profile-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Austin, TX"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Direct Image URL input */}
            <div className="sm:col-span-2">
              <label
                htmlFor="profile-image-url"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Photo Direct URL <span className="text-slate-400 font-normal">(Or use the camera upload button above)</span>
              </label>
              <input
                id="profile-image-url"
                name="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://i.ibb.co/... or https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
