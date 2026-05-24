import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight text-gray-900 dark:text-gray-50', className)}>
      Grader Samsen
    </span>
  )
}
