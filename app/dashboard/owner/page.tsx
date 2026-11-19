import { redirect } from "next/navigation"

export default function OwnerDashboardRootPage() {
  redirect("/dashboard/owner/equipment")
}
