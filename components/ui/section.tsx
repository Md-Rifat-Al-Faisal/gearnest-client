import * as React from "react"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  containerClassName?: string
  innerClassName?: string
}

export function Section({
  as: Component = "section",
  className = "",
  containerClassName = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  children,
  ...props
}: SectionProps) {
  return (
    <Component className={`py-14 sm:py-20 ${className}`} {...props}>
      <div className={containerClassName}>
        {children}
      </div>
    </Component>
  )
}
