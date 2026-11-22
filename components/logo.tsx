import * as React from "react"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  href?: string
}

export function Logo({ className = "", showText = true, href }: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Gear + Nest Inline SVG Mark */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-7 shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Outer 8-tooth industrial gear in foreground */}
        <path
          d="M14 2h4v3.08a11.05 11.05 0 0 1 2.83 1.17l2.18-2.18 2.83 2.83-2.18 2.18c.47.88.87 1.83 1.17 2.83H28v4h-3.08a11.05 11.05 0 0 1-1.17 2.83l2.18 2.18-2.83 2.83-2.18-2.18a11.05 11.05 0 0 1-2.83 1.17V30h-4v-3.08a11.05 11.05 0 0 1-2.83-1.17l-2.18 2.18-2.83-2.83 2.18-2.18a11.05 11.05 0 0 1-1.17-2.83H4v-4h3.08a11.05 11.05 0 0 1 1.17-2.83l-2.18-2.18 2.83-2.83 2.18 2.18c.88-.47 1.83-.87 2.83-1.17V2z"
          className="fill-foreground transition-colors"
        />
        {/* Inner aperture cut-out */}
        <circle cx="16" cy="16" r="7" className="fill-background" />
        {/* Nest cradle bracket accent in primary */}
        <path
          d="M12 14.5a4 4 0 0 0 8 0v-2.5h-2v2.5a2 2 0 1 1-4 0v-2.5h-2v2.5z"
          className="fill-primary"
        />
        <circle cx="16" cy="11.5" r="1.5" className="fill-primary" />
      </svg>

      {showText && (
        <span className="font-heading font-bold text-lg tracking-tight text-foreground">
          Gear<span className="text-accent-text">Nest</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
