"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  Plus,
  ClipboardList,
  User,
  Heart,
  BarChart3,
  Users,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react"
import { signOut, useSession } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

interface NavLink {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface DashboardSidebarProps {
  user?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string | null
  }
  role?: "admin" | "owner" | "customer"
}

export function DashboardSidebar({ user, role: roleProp }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeUser = user || session?.user
  const role = (roleProp || (activeUser as any)?.role || "customer") as "admin" | "owner" | "customer"
  const userImage = activeUser?.image
  const userName = activeUser?.name || "GearNest User"
  const userEmail = activeUser?.email || "user@gearnest.com"

  // Explicit, distinct routes for each role
  const customerLinks: NavLink[] = [
    { title: "Rental History", href: "/dashboard/customer/rentals", icon: ClipboardList },
    { title: "Saved Wishlist", href: "/dashboard/customer/favorites", icon: Heart },
    { title: "My Profile", href: "/dashboard/customer/profile", icon: User },
  ]

  const ownerLinks: NavLink[] = [
    { title: "Overview Analytics", href: "/dashboard/owner", icon: BarChart3 },
    { title: "My Equipment", href: "/dashboard/owner/equipment", icon: Boxes, badge: "Fleet" },
    { title: "Add Equipment", href: "/dashboard/owner/equipment/new", icon: Plus },
    { title: "Rental Orders", href: "/dashboard/owner/rentals", icon: ClipboardList },
    { title: "Partner Profile", href: "/dashboard/owner/profile", icon: User },
  ]

  const adminLinks: NavLink[] = [
    { title: "Master Analytics", href: "/dashboard/admin", icon: BarChart3 },
    { title: "Equipment Moderation", href: "/dashboard/admin/equipment", icon: Boxes, badge: "Review" },
    { title: "All Platform Rentals", href: "/dashboard/admin/rentals", icon: ClipboardList },
    { title: "Platform Users", href: "/dashboard/admin/users", icon: Users },
    { title: "Admin Profile", href: "/dashboard/admin/profile", icon: User },
  ]

  const links =
    role === "admin" ? adminLinks : role === "owner" ? ownerLinks : customerLinks

  const roleLabel =
    role === "admin"
      ? "Platform Administrator"
      : role === "owner"
        ? "Equipment Partner"
        : "Verified Renter"

  const roleBadgeColor =
    role === "admin"
      ? "bg-danger/10 text-danger border-danger/20"
      : role === "owner"
        ? "bg-primary/10 text-accent-text border-primary/20"
        : "bg-surface-2 text-foreground border-border"

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-foreground border-r border-border transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-border">
        <Logo href="/" />
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
          Navigation
        </div>

        {links.map((link) => {
          // Precise active match
          const isExact = pathname === link.href
          const isOverviewLink = link.href === "/dashboard/owner" || link.href === "/dashboard/admin"
          const isChild = !isOverviewLink && pathname.startsWith(link.href)

          let isLongestPrefix = false
          if (isChild) {
            const hasMoreSpecificSibling = links.some(
              (other) => other.href !== link.href && other.href.length > link.href.length && pathname.startsWith(other.href)
            )
            isLongestPrefix = !hasMoreSpecificSibling
          }

          const isActive = isExact || isLongestPrefix
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-surface-2 text-foreground font-bold border-l-[3px] border-l-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-accent-text font-bold" : "text-muted-foreground"}`} />
                <span>{link.title}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground border border-border"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
            Quick Actions
          </div>
          <Link
            href="/equipment"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/60 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>Public Catalog</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-border bg-surface-2/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="h-8 w-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-xs text-foreground shrink-0 border border-border">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {userName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border text-foreground sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-surface-2 text-foreground"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo href="/" />
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
            {role.toUpperCase()}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-band/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  )
}
