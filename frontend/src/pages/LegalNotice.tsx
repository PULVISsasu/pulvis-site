import SectionTitle from '../components/SectionTitle'
import { usePageMeta } from '../hooks/usePageMeta'

const sections = [
  {
    title: 'Éditeur du site',
    body: '[À COMPLÉTER] PULVIS SAS — [adresse à compléter]. Capital social : [à compléter]. RCS [ville] [numéro à compléter].',
  },
  {
    title: 'Directeur de la publication',
    body: '[À COMPLÉTER] — nom et qualité du représentant légal.',
  },
  {
    title: 'Hébergement',
    body: '[À COMPLÉTER] — nom, adresse et coordonnées de l’hébergeur du site.',
  },
  {
    title: 'Propriété intellectuelle',
    body: 'L’ensemble des éléments présents sur ce site (marque, logo, textes, visuels) sont la propriété de PULVIS ou de ses partenaires, sauf mention contraire. Toute reproduction sans autorisation est interdite.',
  },
  {
    title: 'Données personnelles',
    body: 'Les informations transmises via les formulaires de ce site sont utilisées par PULVIS pour étudier les demandes de partenariat. Pour plus de détails, consultez notre politique de confidentialité.',
  },
  {
    title: 'Médiation',
    body: '[À COMPLÉTER] — coordonnées du médiateur compétent, le cas échéant.',
  },
]

export default function LegalNotice() {
  usePageMeta('Mentions légales', 'Mentions légales du site PULVIS.')

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Les informations marquées [À COMPLÉTER] seront renseignées avant la mise en production du site."
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
