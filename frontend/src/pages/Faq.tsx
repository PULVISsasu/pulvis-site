import SectionTitle from '../components/SectionTitle'
import Accordion from '../components/Accordion'
import ScrollReveal from '../components/ScrollReveal'
import CTASection from '../components/CTASection'
import { faqCategories } from '../data/faq'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Faq() {
  usePageMeta(
    'FAQ',
    'Toutes les réponses aux questions des établissements sur le partenariat, l’exploitation et les parfums PULVIS.',
  )

  return (
    <div>
      <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
        <SectionTitle
          eyebrow="Questions fréquentes"
          title="FAQ"
          description="Tout ce qu’il faut savoir avant de devenir établissement partenaire PULVIS."
        />

        <div className="flex flex-col gap-14">
          {faqCategories.map((category, i) => (
            <ScrollReveal key={category.title} delay={i * 0.06} className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl text-pulvis-cream sm:text-3xl">{category.title}</h2>
              <Accordion items={category.items} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <CTASection
        title="Une question spécifique à votre établissement ?"
        description="Contactez-nous directement, nous reviendrons vers vous rapidement."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
      />
    </div>
  )
}
