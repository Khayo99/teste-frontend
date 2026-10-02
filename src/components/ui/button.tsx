import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-text-accent disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        pagination:
          'size-[35px] rounded-sm border border-border text-body-18 text-text-primary hover:border-text-accent',
        primary: 'rounded-md bg-primary text-ink hover:bg-primary-light',
        outline:
          'rounded-[5px] border border-border text-text-secondary hover:border-primary hover:text-text-primary',
        ghost: 'rounded-md text-text-accent hover:text-text-primary'
      }
    },
    defaultVariants: { variant: 'primary' }
  }
)

export function Button({
  className,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className, 'px-1')}
      {...props}
    />
  )
}
