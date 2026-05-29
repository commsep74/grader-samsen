import { Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Code2 className="h-4 w-4" aria-hidden />
      </span>
      <span className="font-semibold tracking-tight text-foreground">Grader Samsen</span>
    </span>
  )
}
