import { CheckCircle2 } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PartnerForm from '../components/PartnerForm'
import { usePageMeta } from '../hooks/usePageMeta'

const included = [
  'Installation et mise en service',
  'Parfums et réapprovisionnement',
  'Maintenance de la station',
  'Gestion des paiements',
  'Suivi et assistance',
]

export default function DevenirPartenaire() {
  usePageMeta(
    'Devenir partenaire',
    'Devenez établissement partenaire PULVIS. Étude de votre établissement, installation prise en charge, aucune gestion opérationnelle.',
  )

  return (
    <div className="container-pulvis grid grid-cols-1 gap-14 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start lg:gap-16">
      <ScrollReveal className="flex flex-col gap-8 lg:sticky lg:top-28">
        <SectionTitle
          eyebrow="Devenir partenaire"
          title="Étudions votre établissement."
          description="Renseignez vos coordonnées, notre équipe reviendra vers vous pour évaluer la pertinence d’une installation PULVIS."
        />

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-pulvis-bgLight p-6">
          <span className="eyebrow">Pris en charge par PULVIS</span>
          <ul className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-pulvis-cream sm:text-base">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pulvis-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1} className="rounded-2xl border border-white/10 bg-pulvis-bgLight p-6 sm:p-10">
        <PartnerForm />
      </ScrollReveal>
    </div>
  )
}
