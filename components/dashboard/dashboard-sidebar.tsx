"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Wrench,
  LayoutDashboard,
  PackagePlus,
  Boxes,
  CalendarCheck2,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

interface DashboardSidebarProps {
  user: {
    id: string
    name: string
    email: string
    role?: string
    image?: string | null
  }
}

interface NavLinkItem {
  title: string
  href: string
  icon: any
  badge?: string
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = user.role || "customer"

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Failed to sign out")
    }
  }

  const ownerLinks: NavLinkItem[] = [
    {
      title: "My Equipment",
      href: "/dashboard/owner/equipment",
      icon: Boxes,
      badge: "Fleet",
    },
    {
      title: "Add Equipment",
      href: "/dashboard/owner/equipment/new",
      icon: PackagePlus,
    },
    {
      title: "Active Rentals",
      href: "/dashboard/owner/bookings",
      icon: CalendarCheck2,
    },
    {
      title: "Fleet Analytics",
      href: "/dashboard/owner",
      icon: LayoutDashboard,
    },
  ]

  const adminLinks: NavLinkItem[] = [
    {
      title: "Equipment Moderation",
      href: "/dashboard/admin/equipment",
      icon: Boxes,
      badge: "Review",
    },
    {
      title: "Rental Bookings",
      href: "/dashboard/admin/bookings",
      icon: CalendarCheck2,
    },
    {
      title: "Platform Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Master Analytics",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
  ]

  const renterLinks: NavLinkItem[] = [
    {
      title: "My Rental Bookings",
      href: "/dashboard/renter/bookings",
      icon: CalendarCheck2,
    },
    {
      title: "Browse Catalog",
      href: "/equipment",
      icon: Boxes,
    },
  ]

  const navLinks = role === "admin" ? adminLinks : role === "owner" ? ownerLinks : renterLinks

  const roleLabel =
    role === "admin" ? "Platform Administrator" : role === "owner" ? "Equipment Partner" : "Equipment Renter"

  const roleBadgeColor =
    role === "admin"
      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
      : role === "owner"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-blue-500/10 text-blue-500 border-blue-500/20"

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Wrench className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg text-white">
              Gear<span className="text-amber-500">Nest</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Workspace Console
            </span>
          </div>
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard/owner" && link.href !== "/dashboard/admin" && pathname.startsWith(link.href))
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{link.title}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-amber-400"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Quick Actions
          </div>
          <Link
            href="/equipment"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Public Catalog</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* User info & Logout footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors"
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
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Wrench className="h-4 w-4" />
            </div>
            <span className="font-bold text-base">
              Gear<span className="text-amber-500">Nest</span>
            </span>
          </Link>
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-slate-900"
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
