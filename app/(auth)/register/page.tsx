"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { Lock, Mail, User, Phone, MapPin, Upload, Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [image, setImage] = React.useState("")
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  // Password rules validation
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasMinLength = password.length >= 6
  const isPasswordValid = hasUpperCase && hasLowerCase && hasMinLength

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
        toast.success("Profile photo uploaded successfully!")
      } else {
        toast.error("Image upload failed. You can paste a direct photo URL instead.")
      }
    } catch {
      toast.error("Failed to upload image to ImgBB")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!isPasswordValid) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and be at least 6 characters long.")
      return
    }

    try {
      setSubmitting(true)
      const res = await signUp.email({
        name,
        email,
        password,
        image: image || undefined,
        callbackURL: "/",
        // role is intentionally excluded here as it's locked to customer by input: false & DB hook
      })

      if (res.error) {
        toast.error(res.error.message || "Registration failed. Please try another email.")
        return
      }

      toast.success("Account created successfully! Welcome to GearNest.")
      router.refresh()
      router.push("/login")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="gn-card p-8">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create GearNest Account
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Join thousands of equipment renters and owners worldwide
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Walker"
              required
              className="gn-input pl-9"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="gn-input pl-9"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Profile Photo (ImgBB Upload or Direct URL)
          </label>
          <div className="mt-1.5 flex items-center gap-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Profile Preview"
                className="size-11 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-slate-700">
                <User className="size-5" />
              </div>
            )}
            <div className="flex flex-1 items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {uploadingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    Upload Photo
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="sr-only"
                />
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste direct image URL"
                className="gn-input flex-1 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Phone & Address */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="gn-input pl-9 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              City / Address
            </label>
            <div className="relative mt-1.5">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dallas, TX"
                className="gn-input pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="gn-input pl-9"
            />
          </div>

          {/* Real-time validation indicators */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5">
                {hasUpperCase ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="size-3.5 text-slate-400" />
                )}
                <span className={hasUpperCase ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500"}>
                  At least one uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowerCase ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="size-3.5 text-slate-400" />
                )}
                <span className={hasLowerCase ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500"}>
                  At least one lowercase letter (a-z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="size-3.5 text-slate-400" />
                )}
                <span className={hasMinLength ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500"}>
                  Minimum 6 characters long
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || (password.length > 0 && !isPasswordValid)}
          className="gn-btn-primary w-full disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Register Account
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-600 hover:underline dark:text-amber-500">
          Sign in here
        </Link>
      </p>
    </div>
  )
}
