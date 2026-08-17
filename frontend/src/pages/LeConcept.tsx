import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import PlaceholderImage from '../components/PlaceholderImage'
import CTASection from '../components/CTASection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function LeConcept() {
  usePageMeta(
    'Le concept',
    'Le constat, la réponse et la vision de PULVIS : rendre le parfum accessible dans les établissements accueillant du public.',
  )

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-pulvis flex flex-col gap-6 py-16 sm:py-24">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Le concept</span>
            <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Rendre le parfum accessible là où la vie se passe.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS transforme un geste personnel en un service disponible directement dans les
              établissements du quotidien.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <span className="eyebrow">Le constat</span>
            <h2 className="font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl">
              Le parfum reste souvent là où l’on n’est plus.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              À la maison, dans un sac ou sur une étagère, le parfum n’est pas toujours accessible
              au moment où l’on souhaite l’utiliser. Après une séance de sport, avant un
              rendez-vous ou simplement au cours de la journée, il existe peu de solutions
              permettant de se parfumer immédiatement, simplement et sur place.
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
              PULVIS amène le parfum là où le besoin apparaît.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              PULVIS installe des stations de parfum premium en libre-service directement dans les
              établissements. Les utilisateurs peuvent accéder à une sélection de fragrances en
              quelques instants, tandis que PULVIS prend en charge l’installation, les parfums, le
              réapprovisionnement, la maintenance, les paiements, le suivi et l’assistance.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-12">
          <SectionTitle eyebrow="Déploiement" title="Aujourd’hui et demain." />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ScrollReveal className="flex flex-col gap-3 rounded-2xl border border-pulvis-gold/30 bg-pulvis-bgLight p-8">
              <span className="eyebrow">Aujourd’hui</span>
              <h3 className="font-serif text-2xl text-pulvis-cream">Les salles de sport</h3>
              <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
                PULVIS concentre actuellement son déploiement sur les salles de sport en
                Île-de-France. Un environnement où l’expérience PULVIS s’intègre naturellement
                dans le parcours des adhérents, notamment après l’entraînement.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.08} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-pulvis-bgLight p-8">
              <span className="eyebrow">Demain</span>
              <h3 className="font-serif text-2xl text-pulvis-cream">D’autres lieux de vie</h3>
              <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
                À terme, le concept pourra s’étendre à d’autres établissements accueillant du
                public : hôtels, restaurants, bars, espaces de loisirs, centres commerciaux et
                autres lieux où une expérience parfumée peut apporter un service supplémentaire.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CTASection
        title="Découvrez PULVIS dans les salles de sport."
        description="Découvrez comment le service s’intègre dans un établissement et ce que PULVIS prend en charge."
        buttonLabel="Découvrir PULVIS pour les salles de sport"
        buttonTo="/salles-de-sport"
      />
    </div>
  )
}
