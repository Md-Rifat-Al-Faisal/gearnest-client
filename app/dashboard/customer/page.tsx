import { redirect } from "next/navigation"

export default function CustomerDashboardRootPage() {
  redirect("/dashboard/customer/rentals")
}
