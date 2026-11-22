"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Boxes,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  PackagePlus,
  RefreshCw,
  CalendarCheck2,
  AlertCircle,
  PieChart as PieIcon,
  Truck,
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { apiRequest } from "@/lib/api-client"
import { fadeInUp, staggerContainer } from "@/lib/motion"
import { Button } from "@/components/ui/button"

interface OwnerSummary {
  totalListedEquipment: number
  approvedEquipment: number
  pendingEquipment: number
  rejectedEquipment: number
  activeRentals: number
  completedRentals: number
  totalEarnings: number
}

interface MonthlyEarningsStat {
  month: string
  bookings: number
  earnings: number
}

interface StatusSlice {
  name: string
  value: number
  color: string
}

export default function OwnerAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<OwnerSummary>({
    totalListedEquipment: 0,
    approvedEquipment: 0,
    pendingEquipment: 0,
    rejectedEquipment: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalEarnings: 0,
  })
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarningsStat[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<StatusSlice[]>([])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiRequest("/api/analytics/owner")
      if (!res.ok) {
        throw new Error(`Failed to load owner analytics (${res.status})`)
      }
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary)
        setMonthlyEarnings(data.monthlyEarnings || [])
        // Map status colors to design tokens
        const rawBreakdown: StatusSlice[] = data.equipmentStatusBreakdown || []
        const mappedBreakdown = rawBreakdown.map((s) => ({
          ...s,
          color:
            s.name.toLowerCase().includes("approved")
              ? "var(--success)"
              : s.name.toLowerCase().includes("pending")
                ? "var(--primary)"
                : "var(--danger)",
        }))
        setStatusBreakdown(mappedBreakdown)
      }
    } catch (err: any) {
      console.error("Owner analytics fetch error:", err)
      setError(err.message || "Failed to retrieve partner analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchAnalytics()
  }, [])

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
              <Truck className="h-3.5 w-3.5 text-primary" />
              Fleet Partner Intelligence
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
            Owner Fleet Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor machinery deployment velocity, monthly rental earnings, and fleet status.
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
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Gross Earnings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Earnings
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              ${summary.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-success" />
              Verified Stripe gross rental payouts
            </p>
          </div>
        </motion.div>

        {/* Listed Equipment */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fleet Size
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.totalListedEquipment.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.approvedEquipment} live · {summary.pendingEquipment} pending review
            </p>
          </div>
        </motion.div>

        {/* Active Rentals */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Rentals
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.activeRentals.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Machinery currently deployed on site
            </p>
          </div>
        </motion.div>

        {/* Completed Bookings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs spec-line-kpi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Orders
            </span>
            <div className="rounded-lg bg-surface-2 p-2 text-accent-text border border-border">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {summary.completedRentals.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Successfully fulfilled contracts
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Earnings Trend (Area Chart) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Monthly Earnings Velocity (6-Month)
              </h2>
              <p className="text-xs text-muted-foreground">
                Gross rental booking earnings from your listed equipment
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
                  data={monthlyEarnings}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ownerEarningsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="earnings"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ownerEarningsGradient)"
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

        {/* Equipment Status Donut Pie Chart */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground font-heading">
                Fleet Moderation Status
              </h2>
              <PieIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Live status breakdown of all your listed equipment
            </p>

            <div className="mt-4 h-52 w-full flex items-center justify-center">
              {mounted ? (
                summary.totalListedEquipment > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-muted-foreground">
                    No equipment listed yet.
                  </div>
                )
              ) : (
                <div className="text-xs text-muted-foreground">Loading chart...</div>
              )}
            </div>

            {/* Custom Legend / Metric rows */}
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                  Approved & Cataloged
                </span>
                <span className="font-bold text-foreground font-heading">
                  {summary.approvedEquipment}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Pending Admin Review
                </span>
                <span className="font-bold text-foreground font-heading">
                  {summary.pendingEquipment}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                  Rejected / Incomplete
                </span>
                <span className="font-bold text-foreground font-heading">
                  {summary.rejectedEquipment}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="outline" asChild size="sm" className="w-full">
              <Link href="/dashboard/owner/equipment">
                <span>Manage Fleet Inventory</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links & Shortcuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/owner/equipment/new"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-xs transition hover:border-primary/50 hover:bg-surface-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-surface-2 p-2.5 text-accent-text border border-border">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Add New Machinery
              </div>
              <div className="text-xs text-muted-foreground">
                List cranes, excavators & lifts
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
        </Link>

        <Link
          href="/dashboard/owner/rentals"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-xs transition hover:border-primary/50 hover:bg-surface-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-surface-2 p-2.5 text-accent-text border border-border">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Fleet Rental Orders
              </div>
              <div className="text-xs text-muted-foreground">
                Active bookings & return dispatches
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
        </Link>

        <Link
          href="/dashboard/owner/profile"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-xs transition hover:border-primary/50 hover:bg-surface-2"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-surface-2 p-2.5 text-accent-text border border-border">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Partner Profile
              </div>
              <div className="text-xs text-muted-foreground">
                Operating details & depot location
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-text" />
        </Link>
      </div>
    </div>
  )
}
