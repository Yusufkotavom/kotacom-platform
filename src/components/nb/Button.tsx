import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utilities/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 border-2 border-ink font-bold uppercase tracking-wider press select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-nb-red text-white shadow-nb-sm',
        secondary: 'bg-nb-blue text-white shadow-nb-sm',
        yellow: 'bg-nb-yellow text-ink shadow-nb-sm',
        outline: 'bg-paper text-ink shadow-nb-sm',
        ink: 'bg-ink text-white shadow-nb-sm',
        ghost: 'border-transparent bg-transparent text-ink hover:bg-muted',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-3 text-sm',
        lg: 'px-7 py-4 text-base',
      },
      shape: {
        square: 'rounded-none',
        pill: 'rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'square' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

/** Anchor-styled variant for links. */
export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    />
  ),
)
LinkButton.displayName = 'LinkButton'

export { buttonVariants }
