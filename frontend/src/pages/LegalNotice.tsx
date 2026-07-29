import SectionTitle from '../components/SectionTitle'

const sections = [
  {
    title: 'Éditeur du site',
    body: 'PULVIS SAS (fictif) — 12 rue de la Fragrance, 75011 Paris, France. Capital social : 10 000 € (fictif). RCS Paris 000 000 000 (fictif).',
  },
  {
    title: 'Directeur de la publication',
    body: 'PULVIS SAS, représentée par son président (fictif).',
  },
  {
    title: 'Hébergement',
    body: 'Ce site est une maquette de démonstration et n\'est pas hébergé en production. Aucune donnée réelle n\'est collectée.',
  },
  {
    title: 'Propriété intellectuelle',
    body: 'L\'ensemble des éléments visuels et textuels de cette maquette (marque, logo typographique, contenus) sont fournis à titre d\'exemple et ne constituent pas des éléments définitifs.',
  },
  {
    title: 'Données personnelles',
    body: 'Les formulaires présents sur cette maquette (assistance, professionnels) n\'envoient aucune donnée réelle et ne collectent aucune information personnelle.',
  },
  {
    title: 'Cookies',
    body: 'Cette maquette n\'utilise aucun cookie de suivi ou d\'analyse.',
  },
]

export default function LegalNotice() {
  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Contenu fictif, fourni à titre d'exemple pour cette maquette de démonstration."
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
