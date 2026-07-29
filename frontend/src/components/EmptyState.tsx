import { type LucideIcon, SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export default function EmptyState({ title, description, icon: Icon = SearchX }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-pulvis-gold/60" strokeWidth={1.2} />
      <p className="font-serif text-xl text-pulvis-cream">{title}</p>
      {description && <p className="max-w-sm text-sm text-pulvis-muted">{description}</p>}
    </div>
  )
}
