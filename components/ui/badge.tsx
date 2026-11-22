import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border bg-surface-2 text-foreground",
        primary:
          "border-primary/30 bg-primary/10 text-accent-text",
        success:
          "border-success/30 bg-success/10 text-success",
        warning:
          "border-warning-text/30 bg-warning-text/10 text-warning-text",
        danger:
          "border-danger/30 bg-danger/10 text-danger",
        destructive:
          "border-danger/30 bg-danger/10 text-danger",
        outline:
          "border-border bg-transparent text-muted-foreground",
        gold:
          "border-transparent bg-gold-fill text-gold-fill-foreground font-bold tabular-nums shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className = "", variant, ...props }: BadgeProps) {
  return <div className={`${badgeVariants({ variant })} ${className}`} {...props} />
}
