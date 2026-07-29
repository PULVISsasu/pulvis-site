import SectionTitle from '../components/SectionTitle'
import Accordion from '../components/Accordion'
import ScrollReveal from '../components/ScrollReveal'
import CTASection from '../components/CTASection'
import { faqCategories } from '../data/faq'

export default function Faq() {
  return (
    <div>
      <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
        <SectionTitle
          eyebrow="Questions fréquentes"
          title="FAQ"
          description="Tout ce qu'il faut savoir avant, pendant et après l'utilisation d'une station PULVIS."
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
        title="Vous ne trouvez pas votre réponse ?"
        description="Notre équipe assistance reste disponible pour vous accompagner."
        buttonLabel="Aide et assistance"
        buttonTo="/aide"
      />
    </div>
  )
}
