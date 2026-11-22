import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs active:scale-[0.98]",
        default:
          "bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs active:scale-[0.98]",
        secondary:
          "border border-border bg-surface hover:bg-surface-2 text-foreground active:scale-[0.98]",
        outline:
          "border border-border bg-transparent hover:bg-surface-2 text-foreground active:scale-[0.98]",
        ghost:
          "hover:bg-surface-2 text-foreground active:scale-[0.98]",
        danger:
          "bg-danger hover:opacity-90 text-band-foreground dark:text-primary-foreground shadow-xs active:scale-[0.98]",
        destructive:
          "bg-danger hover:opacity-90 text-band-foreground dark:text-primary-foreground shadow-xs active:scale-[0.98]",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-xs rounded-lg",
        lg: "px-6 py-2.5 text-base rounded-lg",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant, size, asChild = false, children, ...props }, ref) => {
    const classes = `${buttonVariants({ variant, size })} ${className}`

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>
      return React.cloneElement(child, {
        className: `${classes} ${child.props.className || ""}`.trim(),
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
