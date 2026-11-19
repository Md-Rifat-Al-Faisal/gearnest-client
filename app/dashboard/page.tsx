import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/server-auth"

export default async function DashboardPage() {
  const session = await getCurrentSession(true)

  if (!session?.user) {
    redirect("/login")
  }

  const role = (session.user as { role?: string }).role || "customer"

  if (role === "admin") {
    redirect("/dashboard/admin")
  } else if (role === "owner") {
    redirect("/dashboard/owner")
  } else {
    redirect("/dashboard/customer/rentals")
  }
}
