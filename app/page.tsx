import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Wrench, ShieldCheck, Zap, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Phase 1 Hero / Smoke Test Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 to-white px-4 py-20 text-center sm:px-6 lg:px-8 dark:from-slate-950 dark:to-slate-900">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <Zap className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Phase 1 Initialized — Authentication &amp; Middlewares Ready</span>
            </div>

            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Rent Professional Equipment <br />
              <span className="text-amber-600 dark:text-amber-500">Fast, Reliable, Secure.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
              GearNest connects contractors, creators, and businesses with top-tier equipment owners. Flexible daily, weekly, or monthly rentals backed by verified listings and secure payments.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/register" className="gn-btn-primary h-11 px-6 text-sm">
                Get Started as Renter
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="gn-btn-secondary h-11 px-6 text-sm">
                Sign In to Account
              </Link>
            </div>
          </div>
        </section>

        {/* Phase 1 Features / Architecture Overview */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="gn-card p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                JWT &amp; JWKS Authentication
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Stateless session tokens signed by Better-Auth and verified on Express using public JWKS with direct MongoDB user synchronization.
              </p>
            </div>

            <div className="gn-card p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Wrench className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                Three Role Workflows
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Dedicated RBAC permissions for Customers (renters), Equipment Owners, and Platform Administrators with protected layouts.
              </p>
            </div>

            <div className="gn-card p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Zap className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                Industrial Slate &amp; Amber Theme
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                A clean, modern design system featuring custom Tailwind CSS tokens, smooth light/dark switching, and zero reused legacy code.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
