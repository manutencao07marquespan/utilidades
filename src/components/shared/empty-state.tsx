import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#28A745]/10 to-[#218838]/10 flex items-center justify-center mb-5">
        <Icon className="h-8 w-8 text-[#28A745]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-5">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="btn-gradient-green text-white border-0">
          {action.label}
        </Button>
      )}
    </div>
  )
}
