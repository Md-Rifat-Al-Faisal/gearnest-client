"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  Boxes,
  Clock,
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
import { Button } from "@/components/ui/button"

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
  "var(--primary)",
  "var(--chart-2)",
  "var(--gold-fill)",
  "var(--accent-text)",
  "var(--success)",
  "var(--primary-hover)",
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
        <div className="rounded-lg border border-border bg-surface p-3 shadow-lg text-foreground">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="text-sm font-bold text-accent-text font-heading">
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-accent-text border border-primary/20">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Administrative Intelligence
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
            Platform Master Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time fleet aggregation, revenue metrics, and booking velocity across GearNest.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-accent-text" : ""}`} />
          <span>Refresh Stats</span>
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Stat Cards Grid with .spec-line-kpi */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      >
        {/* Total Revenue */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-success" />
              Verified Stripe gross sales
            </p>
          </div>
        </motion.div>

        {/* Total Bookings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Bookings
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.totalBookings.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.activeRentals} active · {summary.completedRentals} completed
            </p>
          </div>
        </motion.div>

        {/* Total Equipment */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fleet Inventory
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.totalEquipment.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Machinery items cataloged
            </p>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Approvals
            </span>
            <div className={`rounded-lg p-2 border border-border ${summary.pendingApprovals > 0 ? "bg-primary/10 text-accent-text" : "bg-surface-2 text-muted-foreground"}`}>
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                {summary.pendingApprovals.toLocaleString()}
              </div>
              {summary.pendingApprovals > 0 && (
                <Link
                  href="/dashboard/admin/equipment?status=Pending"
                  className="inline-flex items-center text-xs font-semibold text-accent-text hover:underline"
                >
                  Review
                  <ArrowUpRight className="ml-0.5 h-3 w-3" />
                </Link>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting admin moderation
            </p>
          </div>
        </motion.div>

        {/* Total Users */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Users
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.totalUsers.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Customers, Owners & Admins
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Trend (Area Chart) */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Revenue Trajectory (6-Month)
              </h2>
              <p className="text-xs text-muted-foreground">
                Gross rental revenue earned through verified Stripe checkouts
              </p>
            </div>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
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
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Monthly Bookings Trend (Bar Chart) */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Monthly Booking Volume
              </h2>
              <p className="text-xs text-muted-foreground">
                Completed reservation transactions per calendar month
              </p>
            </div>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip suffix=" orders" />} />
                  <Bar
                    dataKey="bookings"
                    fill="var(--chart-2)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Distribution & Quick Management Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Equipment Category Distribution
              </h2>
              <p className="text-xs text-muted-foreground">
                Total industrial machinery classified by segment
              </p>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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
                      <span className="text-foreground">
                        {item.category}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} items ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border">
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
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground font-heading">
              Admin Moderation Hub
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Immediate management controls and review queues.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/admin/equipment"
                className="group flex items-center justify-between rounded-lg border border-border p-3.5 transition hover:border-primary/50 hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Equipment Moderation
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summary.pendingApprovals} pending review
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
              </Link>

              <Link
                href="/dashboard/admin/rentals"
                className="group flex items-center justify-between rounded-lg border border-border p-3.5 transition hover:border-primary/50 hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
                    <CalendarCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      All Platform Bookings
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summary.totalBookings} total orders
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
              </Link>

              <Link
                href="/dashboard/admin/users"
                className="group flex items-center justify-between rounded-lg border border-border p-3.5 transition hover:border-primary/50 hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Manage Platform Users
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {summary.totalUsers} registered accounts
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface-2/60 p-3.5 text-xs text-muted-foreground">
            Platform data refreshed live with strict MongoDB aggregation pipeline queries.
          </div>
        </div>
      </div>
    </div>
  )
}
