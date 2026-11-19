import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/server-auth"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession(true)

  if (!session?.user) {
    redirect("/login")
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as { role?: string }).role || "customer",
    image: session.user.image,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <DashboardSidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
