import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type Perfume } from '../data/perfumes'
import PlaceholderImage from './PlaceholderImage'
import { Droplet } from 'lucide-react'

interface PerfumeCardProps {
  perfume: Perfume
}

export default function PerfumeCard({ perfume }: PerfumeCardProps) {
  return (
    <Link
      to={`/parfums/${perfume.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-pulvis-bgLight transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-pulvis-gold/40"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <PlaceholderImage
          label={perfume.name}
          icon={Droplet}
          className="h-full w-full transition-transform duration-700 ease-smooth group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-2xl text-pulvis-cream">{perfume.name}</h3>
          <span className="text-xs uppercase tracking-widest2 text-pulvis-muted">{perfume.profile}</span>
        </div>
        <p className="text-sm text-pulvis-gold">{perfume.familyLabel}</p>
        <p className="text-sm leading-relaxed text-pulvis-muted">{perfume.tagline}</p>
        <span className="link-underline mt-2 inline-flex w-fit items-center gap-1.5 text-sm text-pulvis-cream group-hover:text-pulvis-gold">
          Découvrir
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
