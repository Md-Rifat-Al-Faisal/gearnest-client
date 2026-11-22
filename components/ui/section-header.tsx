import * as React from "react"

interface SectionHeaderProps {
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
  titleClassName?: string
}

export function SectionHeader({
  title,
  description,
  align = "left",
  className = "",
  titleClassName = "",
}: SectionHeaderProps) {
  const isCenter = align === "center"

  return (
    <div className={`mb-10 sm:mb-12 ${isCenter ? "text-center flex flex-col items-center" : ""} ${className}`}>
      <h2 className={`font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground ${titleClassName}`}>
        {title}
      </h2>
      <div className={`w-10 h-[3px] bg-primary rounded-full mt-2.5 ${isCenter ? "mx-auto" : ""}`} />
      {description && (
        <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl">
          {description}
        </p>
      )}
    </div>
  )
}
