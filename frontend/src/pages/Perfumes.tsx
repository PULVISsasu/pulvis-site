import { useMemo, useState } from 'react'
import SectionTitle from '../components/SectionTitle'
import FilterButtons from '../components/FilterButtons'
import PerfumeCard from '../components/PerfumeCard'
import EmptyState from '../components/EmptyState'
import ScrollReveal from '../components/ScrollReveal'
import { perfumes, type PerfumeFamily, type PerfumeGender } from '../data/perfumes'

type Filter = 'Tous' | PerfumeGender | PerfumeFamily

const filters: Filter[] = ['Tous', 'Homme', 'Femme', 'Mixte', 'Frais', 'Boisé', 'Floral', 'Ambré']

export default function Perfumes() {
  const [active, setActive] = useState<Filter>('Tous')

  const filtered = useMemo(() => {
    if (active === 'Tous') return perfumes
    return perfumes.filter((p) => p.profile === active || p.family === active)
  }, [active])

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Collection"
        title="Les parfums PULVIS"
        description="Cinq fragrances, pensées comme des réponses à des moments précis de votre journée. Filtrez par profil ou famille olfactive pour trouver la vôtre."
      />

      <FilterButtons options={filters} active={active} onChange={setActive} />

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun parfum ne correspond à ce filtre"
          description="Essayez un autre profil ou une autre famille olfactive."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((perfume, i) => (
            <ScrollReveal key={perfume.slug} delay={(i % 3) * 0.06}>
              <PerfumeCard perfume={perfume} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
