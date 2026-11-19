import Link from "next/link"
import { ShieldAlert, Home, LogIn } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Access Restricted
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        You do not have the required permissions to view this dashboard or resource. Please ensure you are logged into an authorized account.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link href="/" className="gn-btn-secondary">
          <Home className="size-4" />
          Back to Home
        </Link>
        <Link href="/login" className="gn-btn-primary">
          <LogIn className="size-4" />
          Switch Account
        </Link>
      </div>
    </div>
  )
}
