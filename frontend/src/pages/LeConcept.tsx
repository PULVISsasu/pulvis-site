import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import CTASection from '../components/CTASection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function LeConcept() {
  usePageMeta(
    'Le concept',
    'PULVIS rapproche le parfum des lieux de vie. Découvrez le concept, du constat à la vision long terme.',
  )

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis flex flex-col gap-6 py-16 sm:py-24">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Le concept</span>
            <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Le parfum devient un service.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS déploie des stations de parfum premium en libre-service dans des
              établissements accueillant du public.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Le constat</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Rarement disponible au bon moment.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Le parfum est généralement disponible à domicile ou dans les parfumeries, mais
              rarement au moment où l’on en a réellement besoin, au cours de ses déplacements.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Parfum et quotidien"
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal delay={0.1} className="order-2 lg:order-1">
            <PlaceholderImage
              label="Station PULVIS installée dans un lieu de vie"
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
          <ScrollReveal className="order-1 flex flex-col gap-6 lg:order-2">
            <span className="eyebrow">La réponse</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              PULVIS rapproche le parfum des lieux de vie.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Une station premium, installée directement dans un établissement, accessible en
              libre-service. PULVIS prend en charge l’intégralité de son exploitation :
              installation, parfums, réapprovisionnement, maintenance, paiements et suivi.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Déploiement" title="Aujourd’hui et demain" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ScrollReveal className="flex flex-col gap-3 rounded-2xl border border-pulvis-gold/30 bg-pulvis-bgLight p-8">
              <span className="eyebrow">Aujourd’hui</span>
              <h3 className="font-serif text-2xl text-pulvis-cream">Les salles de sport</h3>
              <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
                Les premiers déploiements PULVIS ont lieu dans les salles de sport, un lieu où le
                besoin du moment se fait naturellement sentir en fin de séance.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.08} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-pulvis-bgLight p-8">
              <span className="eyebrow">Demain</span>
              <h3 className="font-serif text-2xl text-pulvis-cream">D’autres établissements</h3>
              <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
                La technologie PULVIS pourra ensuite être déployée dans d’autres établissements
                recevant du public : hôtels, restaurants, bars, clubs, espaces événementiels ou
                centres commerciaux.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CTASection
        title="Découvrez PULVIS pour les salles de sport"
        description="Le marché prioritaire de PULVIS aujourd’hui, et les bénéfices pour votre établissement."
        buttonLabel="Pour les salles de sport"
        buttonTo="/salles-de-sport"
      />
    </div>
  )
}
