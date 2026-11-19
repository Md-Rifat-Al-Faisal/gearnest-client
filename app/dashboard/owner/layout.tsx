import { requireRole } from "@/lib/server-auth"

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforces owner role; redirects unauthenticated to /login and non-owners to /unauthorized
  await requireRole("owner")

  return <>{children}</>
}
