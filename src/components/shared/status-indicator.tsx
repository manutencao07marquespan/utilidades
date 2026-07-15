import { cn } from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { type LucideIcon } from 'lucide-react'

const statusIndicatorVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        ok: 'border-transparent bg-green-100 text-green-800',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        critical: 'border-transparent bg-red-100 text-red-800',
        inactive: 'border-transparent bg-gray-100 text-gray-800',
      },
    },
    defaultVariants: {
      variant: 'ok',
    },
  }
)

interface StatusIndicatorProps extends VariantProps<typeof statusIndicatorVariants> {
  label: string
  icon?: LucideIcon
  pulse?: boolean
}

export function StatusIndicator({
  label,
  variant,
  icon: Icon,
  pulse = false,
}: StatusIndicatorProps) {
  return (
    <span className={cn(statusIndicatorVariants({ variant }))}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {pulse && (
        <span className="relative mr-1 flex h-2 w-2">
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              variant === 'ok' && 'bg-green-400',
              variant === 'warning' && 'bg-yellow-400',
              variant === 'critical' && 'bg-red-400',
              variant === 'inactive' && 'bg-gray-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              variant === 'ok' && 'bg-green-500',
              variant === 'warning' && 'bg-yellow-500',
              variant === 'critical' && 'bg-red-500',
              variant === 'inactive' && 'bg-gray-500'
            )}
          />
        </span>
      )}
      {label}
    </span>
  )
}
