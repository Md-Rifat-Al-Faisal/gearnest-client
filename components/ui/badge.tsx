import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
        outline:
          "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400",
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
