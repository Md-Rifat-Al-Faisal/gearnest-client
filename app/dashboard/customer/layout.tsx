import { requireRole } from "@/lib/server-auth"

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforces customer role with disableCookieCache: true so DB role modifications take effect immediately
  await requireRole("customer")

  return <>{children}</>
}
