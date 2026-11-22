import Link from "next/link"
import { ShieldAlert, Home, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-xl bg-danger/10 text-danger border border-danger/20">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-foreground">
        Access Restricted
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        You do not have the required permissions to view this dashboard or resource. Please ensure you are logged into an authorized account.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button variant="secondary" asChild>
          <Link href="/">
            <Home className="size-4" />
            <span>Back to Home</span>
          </Link>
        </Button>
        <Button asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            <span>Switch Account</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
