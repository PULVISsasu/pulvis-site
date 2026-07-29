import { type LucideIcon, Sparkles } from 'lucide-react'

interface PlaceholderImageProps {
  label: string
  icon?: LucideIcon
  className?: string
  tone?: 'gold' | 'cream' | 'deep'
}

const tones: Record<NonNullable<PlaceholderImageProps['tone']>, string> = {
  gold: 'from-[#3a3126] via-[#22201c] to-[#141311]',
  cream: 'from-[#33312b] via-[#231f1b] to-[#161513]',
  deep: 'from-[#2a2622] via-[#1c1a17] to-[#121110]',
}

export default function PlaceholderImage({
  label,
  icon: Icon = Sparkles,
  className = '',
  tone = 'gold',
}: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={`Visuel de démonstration — ${label}`}
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(212,161,90,0.25), transparent 55%), radial-gradient(circle at 80% 85%, rgba(212,161,90,0.12), transparent 50%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="h-8 w-8 text-pulvis-gold/30" strokeWidth={1} />
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="truncate rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-widest2 text-pulvis-muted backdrop-blur-sm">
          Visuel — {label}
        </span>
      </div>
    </div>
  )
}
