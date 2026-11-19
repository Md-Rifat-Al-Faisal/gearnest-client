import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import { getCurrentSession } from "@/lib/server-auth"
import { EquipmentDetailsClient } from "@/components/equipment/equipment-details-client"

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const equipmentId = resolvedParams.id

  // 1. Mandatory server-side session check: redirect unauthenticated users to login with return callback
  const session = await getCurrentSession(true)
  if (!session?.user) {
    redirect(`/login?callbackUrl=/equipment/${equipmentId}`)
  }

  // 2. Fetch equipment data with resilient local/live fallback
  const FALLBACK_API = "https://gearnest-server.vercel.app"
  const apiBase = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API
  let equipment = null

  try {
    let res: Response
    try {
      res = await fetch(`${apiBase}/api/equipment/${equipmentId}`, {
        cache: "no-store",
      })
    } catch {
      res = await fetch(`${FALLBACK_API}/api/equipment/${equipmentId}`, {
        cache: "no-store",
      })
    }

    if (res.ok) {
      const data = await res.json()
      equipment = data.equipment
    }
  } catch (error) {
    console.error("Error retrieving equipment on server:", error)
  }

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Equipment Listing Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The requested machinery listing does not exist or is currently inactive.
        </p>
        <Link
          href="/equipment"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    )
  }

  const currentUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as { role?: string }).role || "customer",
    phone: (session.user as { phone?: string }).phone || "",
    address: (session.user as { address?: string }).address || "",
  }

  return <EquipmentDetailsClient equipment={equipment} currentUser={currentUser} />
}
