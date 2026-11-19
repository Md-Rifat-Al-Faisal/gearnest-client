import { requireRole } from "@/lib/server-auth"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforces admin role; redirects unauthenticated to /login and non-admins to /unauthorized
  await requireRole("admin")

  return <>{children}</>
}
