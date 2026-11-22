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
  XCircle,
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
  Legend,
} from "recharts"
import { apiRequest } from "@/lib/api-client"
import { fadeInUp, staggerContainer } from "@/lib/motion"

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
        setStatusBreakdown(data.equipmentStatusBreakdown || [])
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
              <Truck className="h-3.5 w-3.5" />
              Partner Overview
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Equipment Owner Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time rental earnings, fleet statuses, and reservation performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/owner/equipment/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400"
          >
            <PackagePlus className="h-4 w-4" />
            Add Equipment
          </Link>
        </div>
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Earnings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-white p-5 shadow-sm dark:from-amber-500/15 dark:via-slate-900 dark:to-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Earnings
            </span>
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${summary.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Verified rental income paid
            </p>
          </div>
        </motion.div>

        {/* Listed Fleet */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fleet Size
            </span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500 dark:bg-blue-500/20">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.totalListedEquipment.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary.approvedEquipment} live &middot; {summary.pendingEquipment} pending review
            </p>
          </div>
        </motion.div>

        {/* Active Rentals */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Rentals
            </span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 dark:bg-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.activeRentals.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Machinery currently deployed on site
            </p>
          </div>
        </motion.div>

        {/* Completed Bookings */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Orders
            </span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-500 dark:bg-purple-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.completedRentals.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Successfully fulfilled contracts
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Earnings Trend (Area Chart) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Monthly Earnings Velocity (6-Month)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gross rental booking earnings from your listed equipment
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
                  data={monthlyEarnings}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ownerEarningsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="earnings"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#ownerEarningsGradient)"
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

        {/* Equipment Status Donut Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Fleet Moderation Status
              </h2>
              <PieIcon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                  <div className="text-center text-xs text-slate-400">
                    No equipment listed yet.
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-400">Loading chart...</div>
              )}
            </div>

            {/* Custom Legend / Metric rows */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Approved & Cataloged
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {summary.approvedEquipment}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Pending Admin Review
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {summary.pendingEquipment}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Rejected / Incomplete
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {summary.rejectedEquipment}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard/owner/equipment"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Manage Fleet Inventory
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links & Shortcuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/owner/equipment/new"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-500/50 hover:bg-amber-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Add New Machinery
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                List cranes, excavators & lifts
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-500" />
        </Link>

        <Link
          href="/dashboard/owner/rentals"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500/50 hover:bg-blue-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Manage Rental Orders
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mark active, return & restock
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-500" />
        </Link>

        <Link
          href="/dashboard/owner/equipment"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Equipment Fleet
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Edit pricing, specs & availability
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500" />
        </Link>
      </div>
    </div>
  )
}
