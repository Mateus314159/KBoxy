import { cn } from '@/lib/utils'
import React from 'react'

export function Title({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-2xl md:text-3xl font-bold', className)} {...props} />
}

export function Subtitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-xl md:text-2xl font-semibold', className)} {...props} />
}

export function Paragraph({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('leading-relaxed', className)} {...props} />
}
