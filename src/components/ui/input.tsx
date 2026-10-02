import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-10 w-full rounded-[5px] border border-border bg-transparent px-4 py-3 text-sm leading-4 text-text-primary outline-none placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
}
