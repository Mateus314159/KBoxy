import { cn } from '@/lib/utils'
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 focus:outline-none', className)}
      {...props}
    />
  )
}
