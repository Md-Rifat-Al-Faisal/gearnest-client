"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  Boxes,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  CalendarCheck2,
  AlertCircle,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { apiRequest } from "@/lib/api-client"
import { fadeInUp, staggerContainer } from "@/lib/motion"

interface AdminSummary {
  totalUsers: number
  totalEquipment: number
  totalBookings: number
  pendingApprovals: number
  activeRentals: number
  completedRentals: number
  totalRevenue: number
}

interface MonthlyStat {
  month: string
  bookings: number
  revenue: number
}

interface CategoryStat {
  category: string
  count: number
}

interface StatusStat {
  status: string
  count: number
}

const CATEGORY_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
]

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<AdminSummary>({
    totalUsers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalRevenue: 0,
  })
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<StatusStat[]>([])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiRequest("/api/analytics/admin")
      if (!res.ok) {
        throw new Error(`Failed to load admin analytics (${res.status})`)
      }
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary)
        setMonthlyStats(data.monthlyStats || [])
        setCategoryStats(data.equipmentByCategory || [])
        setStatusBreakdown(data.statusBreakdown || [])
      }
    } catch (err: any) {
      console.error("Admin analytics fetch error:", err)
      setError(err.message || "Failed to retrieve analytics data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchAnalytics()
  }, [])

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-sm font-bold text-amber-500">
            {prefix}
            {payload[0].value?.toLocaleString()}
            {suffix}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrative Intelligence
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Platform Master Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time fleet aggregation, revenue metrics, and booking velocity across GearNest.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      >
        {/* Total Revenue */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-white p-5 shadow-sm dark:from-amber-500/15 dark:via-slate-900 dark:to-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Revenue
            </span>
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Verified Stripe gross sales
            </p>
          </div>
        </motion.div>

        {/* Total Bookings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Bookings
            </span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500 dark:bg-blue-500/20">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.totalBookings.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary.activeRentals} active &middot; {summary.completedRentals} completed
            </p>
          </div>
        </motion.div>

        {/* Total Equipment */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fleet Inventory
            </span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 dark:bg-emerald-500/20">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.totalEquipment.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Heavy equipment items cataloged
            </p>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Approvals
            </span>
            <div className={`rounded-xl p-2 ${summary.pendingApprovals > 0 ? "bg-amber-500/20 text-amber-500" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {summary.pendingApprovals.toLocaleString()}
              </div>
              {summary.pendingApprovals > 0 && (
                <Link
                  href="/dashboard/admin/equipment?status=Pending"
                  className="inline-flex items-center text-xs font-semibold text-amber-500 hover:underline"
                >
                  Review
                  <ArrowUpRight className="ml-0.5 h-3 w-3" />
                </Link>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Awaiting admin moderation
            </p>
          </div>
        </motion.div>

        {/* Total Users */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform Users
            </span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-500 dark:bg-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.totalUsers.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Customers, Owners & Admins
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Trend (Area Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Revenue Trajectory (6-Month)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gross rental revenue earned through verified Stripe checkouts
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Monthly Bookings Trend (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Monthly Booking Volume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completed reservation transactions per calendar month
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    stroke="#cbd5e1"
                    className="dark:stroke-slate-700"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip suffix=" orders" />} />
                  <Bar
                    dataKey="bookings"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Distribution & Quick Management Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Equipment Category Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total industrial machinery classified by machinery segment
              </p>
            </div>
            <Layers className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No equipment categories cataloged yet.
              </div>
            ) : (
              categoryStats.map((item, index) => {
                const total = summary.totalEquipment || 1
                const percent = Math.round((item.count / total) * 100)
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.count} items ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Fast Action Shortcuts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Admin Moderation Hub
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Immediate management controls and review queues.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/admin/equipment"
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-500/50 hover:bg-amber-500/5 dark:border-slate-800 dark:hover:border-amber-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Equipment Moderation
                    </div>
                    <div className="text-xs text-slate-500">
                      {summary.pendingApprovals} pending review
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-500" />
              </Link>

              <Link
                href="/dashboard/admin/rentals"
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-500/50 hover:bg-blue-500/5 dark:border-slate-800 dark:hover:border-blue-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                    <CalendarCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      All Platform Bookings
                    </div>
                    <div className="text-xs text-slate-500">
                      {summary.totalBookings} total orders
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-500" />
              </Link>

              <Link
                href="/dashboard/admin/users"
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-purple-500/50 hover:bg-purple-500/5 dark:border-slate-800 dark:hover:border-purple-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Manage Platform Users
                    </div>
                    <div className="text-xs text-slate-500">
                      {summary.totalUsers} registered accounts
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-purple-500" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400">
            Platform data refreshed live with strict MongoDB aggregation pipeline queries.
          </div>
        </div>
      </div>
    </div>
  )
}
