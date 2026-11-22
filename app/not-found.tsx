import Link from "next/link"
import { Compass, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 sm:p-10 text-center shadow-xs">
        {/* 404 Visual Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-accent-text">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-4xl font-extrabold tracking-tight font-heading text-accent-text">
            404
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground sm:text-3xl">
            Equipment Not Located
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page, machine specification, or catalog route you are looking for does not exist or has been relocated in the fleet registry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/equipment" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Browse Catalog</span>
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Logo showText={false} className="scale-75" />
            <span>GearNest Heavy Equipment Network</span>
          </div>
        </div>
      </div>
    </div>
  )
}
