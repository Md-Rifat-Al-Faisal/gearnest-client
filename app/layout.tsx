import type { Metadata } from "next"
import { Space_Grotesk, Manrope } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GearNest | Modern Smart-Rental Marketplace",
  description: "Modern, trustworthy smart-rental marketplace for machinery, cameras, drones and electronics.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        <ThemeProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-surface !text-foreground !border !border-border !shadow-lg",
              descriptionClassName: "!text-muted-foreground",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
