import SectionTitle from '../components/SectionTitle'
import { usePageMeta } from '../hooks/usePageMeta'

const sections = [
  {
    title: 'Utilisation des cookies',
    body: 'Ce site n’utilise actuellement aucun cookie de suivi publicitaire ou d’analyse tiers.',
  },
  {
    title: 'Cookies techniques',
    body: '[À COMPLÉTER] — le cas échéant, liste des cookies strictement nécessaires au fonctionnement du site.',
  },
  {
    title: 'Gestion de vos préférences',
    body: '[À COMPLÉTER] — modalités de gestion et de retrait du consentement, si des cookies non essentiels venaient à être utilisés.',
  },
]

export default function Cookies() {
  usePageMeta('Gestion des cookies', 'Politique de gestion des cookies du site PULVIS.')

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Cookies"
        title="Gestion des cookies"
        description="Les informations marquées [À COMPLÉTER] seront renseignées si des cookies non essentiels sont introduits."
      />

      <div className="flex max-w-2xl flex-col gap-10">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">{section.title}</h2>
            <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
