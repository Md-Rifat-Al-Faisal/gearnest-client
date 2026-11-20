import Link from "next/link"
import { Wrench } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950">
                <Wrench className="size-4" />
              </div>
              <span className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Gear<span className="text-amber-600 dark:text-amber-500">Nest</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Your trusted marketplace for industrial, construction, and specialized equipment rentals. Verified owners, flexible terms, and secure transactions.
            </p>
            {/* Social Links with new X logo */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on X"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                {/* Modern X logo SVG */}
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0 0-3.3 1.66 1.66 0 0 0 0 3.3m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-white">
              Rentals
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/equipment" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Browse All Equipment
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Construction" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Heavy Construction
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Photography" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Cameras & Lighting
                </Link>
              </li>
              <li>
                <Link href="/equipment?category=Vehicles" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Commercial Vehicles
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-white">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/#how-it-works" className="hover:text-amber-600 dark:hover:text-amber-400">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Why GearNest
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-amber-600 dark:hover:text-amber-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Become an Equipment Owner
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-600 dark:hover:text-amber-400">
                  Renter Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-white">
              Trust & Security
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Every equipment booking is backed by Stripe payment protection and verified equipment owner agreements.
            </p>
            <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} GearNest Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
