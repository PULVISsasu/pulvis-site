import { type Fragrance } from '../data/fragrances'

interface FragranceCardProps {
  fragrance: Fragrance
}

export default function FragranceCard({ fragrance }: FragranceCardProps) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-pulvis-bg p-7">
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-2xl tracking-wide text-pulvis-cream sm:text-3xl">
          {fragrance.name}
        </h3>
        <p className="text-sm text-pulvis-gold">{fragrance.signature}</p>
      </div>

      <p className="text-sm leading-relaxed text-pulvis-muted">{fragrance.description}</p>

      <ul className="flex flex-col gap-3 border-t border-white/10 pt-5">
        {fragrance.notes.map((note) => (
          <li key={note.label} className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-widest2 text-pulvis-cream">
              {note.label}
            </span>
            <span className="text-xs leading-relaxed text-pulvis-muted">{note.descriptor}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
