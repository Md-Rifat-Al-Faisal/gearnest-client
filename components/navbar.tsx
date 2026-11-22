"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { ThemeToggle } from "./theme-toggle"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const user = session?.user as { role?: string; name?: string; email?: string; image?: string } | undefined
  const userRole = user?.role || "customer"

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "All Equipment", href: "/equipment" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Why Choose Us", href: "/#why-us" },
    { label: "About Us", href: "/#about" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "/#contact" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "")
      if (pathname === "/") {
        e.preventDefault()
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
          window.history.pushState(null, "", href)
        }
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to sign out")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Logo href="/" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive
                    ? "font-semibold text-accent-text"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 rounded-lg bg-surface-2 animate-pulse" />
              <div className="size-8 rounded-full bg-surface-2 animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-border/60"
              >
                <LayoutDashboard className="size-3.5 text-accent-text" />
                <span>Dashboard ({userRole})</span>
              </Link>

              <div className="flex items-center gap-2 border-l border-border pl-3">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="size-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-surface-2 text-foreground">
                    <User className="size-4" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground bg-surface"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false)
                  handleNavClick(e, link.href)
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-border" />

            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <LayoutDashboard className="size-4 text-accent-text" />
                  Dashboard ({userRole})
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger/10 cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
