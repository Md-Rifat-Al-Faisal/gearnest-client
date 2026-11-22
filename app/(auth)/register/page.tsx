"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp, signIn } from "@/lib/auth-client"
import { toast } from "sonner"
import { Lock, Mail, User, Phone, MapPin, Upload, Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

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
  const [googleLoading, setGoogleLoading] = React.useState(false)

  // Password rules validation
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasMinLength = password.length >= 6
  const isPasswordValid = hasUpperCase && hasLowerCase && hasMinLength

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      const res = await signIn.social({
        provider: "google",
        callbackURL: "/equipment",
      })
      if (res?.error) {
        toast.error(res.error.message || "Failed to initialize Google sign-in")
        setGoogleLoading(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google sign-in"
      toast.error(msg)
      setGoogleLoading(false)
    }
  }

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
        phone: phone || undefined,
        address: address || undefined,
      })

      if (res.error) {
        toast.error(res.error.message || "Failed to create account")
        return
      }

      toast.success("Account created successfully! Welcome to GearNest.")
      router.refresh()
      router.push("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8 shadow-md">
      <div className="flex flex-col items-center text-center">
        <Logo href="/" className="mb-4" />
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Create GearNest Account
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Join verified equipment renters and machinery owners
        </p>
      </div>

      {/* Google OAuth Button */}
      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full text-xs font-semibold"
        >
          {googleLoading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <svg className="size-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-muted-foreground">
            Or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="register-name"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Walker"
              required
              className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div>
          <label
            htmlFor="register-file-input"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Profile Photo (Upload or Image URL)
          </label>
          <div className="mt-1.5 flex items-center gap-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Profile Preview"
                className="size-10 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground bg-surface-2">
                <User className="size-4" />
              </div>
            )}
            <div className="flex flex-1 items-center gap-2">
              <label
                htmlFor="register-file-input"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-2/80 transition-colors shrink-0"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    <span>Upload</span>
                  </>
                )}
                <input
                  id="register-file-input"
                  name="profilePhotoFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="sr-only"
                />
              </label>
              <input
                id="register-image-url"
                name="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste direct image URL"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Phone & Address */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="register-phone"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Phone Number
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="register-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="register-address"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              City / Address
            </label>
            <div className="relative mt-1.5">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="register-address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dallas, TX"
                className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password <span className="text-danger">*</span>
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Real-time validation indicators */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1 rounded-lg bg-surface-2 p-2.5 text-xs border border-border">
              <div className="flex items-center gap-1.5">
                {hasUpperCase ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground" />
                )}
                <span className={hasUpperCase ? "text-success font-medium" : "text-muted-foreground"}>
                  At least one uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowerCase ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground" />
                )}
                <span className={hasLowerCase ? "text-success font-medium" : "text-muted-foreground"}>
                  At least one lowercase letter (a-z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <XCircle className="size-3.5 text-muted-foreground" />
                )}
                <span className={hasMinLength ? "text-success font-medium" : "text-muted-foreground"}>
                  Minimum 6 characters
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting || uploadingImage}
          className="w-full text-xs font-bold mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1.5" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="size-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent-text hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  )
}
