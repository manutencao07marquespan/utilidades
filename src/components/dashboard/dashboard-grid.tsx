import { cn } from '@/lib/cn'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-5 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}

interface DashboardGridItemProps {
  children: React.ReactNode
  className?: string
  span?: 1 | 2 | 3
}

export function DashboardGridItem({
  children,
  className,
  span = 1,
}: DashboardGridItemProps) {
  return (
    <div
      className={cn(
        span === 2 && 'md:col-span-2',
        span === 3 && 'md:col-span-2 lg:col-span-3',
        className
      )}
    >
      {children}
    </div>
  )
}
