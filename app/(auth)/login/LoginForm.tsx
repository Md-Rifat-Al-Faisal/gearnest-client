"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { toast } from "sonner"
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirectTo") || "/"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in both email and password")
      return
    }

    try {
      setLoading(true)
      const res = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })

      if (res.error) {
        toast.error(res.error.message || "Invalid credentials. Please try again.")
        return
      }

      toast.success("Welcome back to GearNest!")
      router.refresh()
      router.push(callbackUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const res = await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      })
      if (res?.error) {
        toast.error(res.error.message || "Failed to initialize Google login")
        setGoogleLoading(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google login"
      toast.error(msg)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="gn-card p-8">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign In to GearNest
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Access your equipment rentals, listings, and reservations
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="gn-input pl-11"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="gn-input pl-11"
            />
          </div>
        </div>

        {/* Quick Fill Demo Credentials */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2.5">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Quick Demo Logins (Evaluation):</span>
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@gearnest.com")
                setPassword("Admin@123456")
                toast.info("Admin credentials loaded")
              }}
              className="py-1 px-2 rounded-lg text-[11px] font-bold border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("owner@gearnest.com")
                setPassword("Owner@123456")
                toast.info("Owner credentials loaded")
              }}
              className="py-1 px-2 rounded-lg text-[11px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("customer@gearnest.com")
                setPassword("Customer@123456")
                toast.info("Customer credentials loaded")
              }}
              className="py-1 px-2 rounded-lg text-[11px] font-bold border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              Customer
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gn-btn-primary w-full disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="gn-btn-secondary w-full"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
        )}
        Continue with Google
      </button>

      <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-amber-600 hover:underline dark:text-amber-500">
          Create an account
        </Link>
      </p>
    </div>
  )
}
