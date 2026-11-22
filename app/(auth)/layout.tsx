import * as React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
        <div className="w-full max-w-md relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
