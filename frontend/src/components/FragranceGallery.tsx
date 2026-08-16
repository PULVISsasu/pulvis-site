import { type Fragrance } from '../data/fragrances'

interface FragranceGalleryProps {
  fragrances: Fragrance[]
}

export default function FragranceGallery({ fragrances }: FragranceGalleryProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {fragrances.map((fragrance) => (
        <figure
          key={fragrance.slug}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-pulvis-bg transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-pulvis-gold/40"
        >
          <img
            src={fragrance.image}
            alt={`PULVIS ${fragrance.name} — ${fragrance.signature}`}
            loading="lazy"
            className="aspect-[760/1350] w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
          />
        </figure>
      ))}
    </div>
  )
}
