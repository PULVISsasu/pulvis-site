import { MapPin, Sparkles, CreditCard, Wind, ScanFace, ShieldCheck } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import Accordion from '../components/Accordion'
import CTASection from '../components/CTASection'
import PlaceholderImage from '../components/PlaceholderImage'

const steps = [
  {
    icon: MapPin,
    title: 'Repérez une station PULVIS',
    description: 'Dans votre salle de sport, votre hôtel, un bar ou un centre commercial.',
  },
  {
    icon: ScanFace,
    title: 'Découvrez les parfums disponibles',
    description: 'Cinq fragrances affichées directement sur l\'écran de la station.',
  },
  {
    icon: CreditCard,
    title: 'Payez 1 € sans contact',
    description: 'Carte bancaire, mobile ou montre connectée. Aucune inscription requise.',
  },
  {
    icon: Wind,
    title: 'Placez-vous devant la buse',
    description: 'La station se prépare automatiquement en quelques secondes.',
  },
  {
    icon: Sparkles,
    title: 'Profitez de deux pulvérisations',
    description: 'Votre fragrance est prête. Vous pouvez repartir immédiatement.',
  },
]

const quickFaq = [
  {
    question: 'Ai-je besoin de télécharger une application ?',
    answer: 'Non. Aucune application ni compte n\'est nécessaire pour utiliser une station PULVIS.',
  },
  {
    question: 'Combien de temps prend une utilisation ?',
    answer: 'Moins de 15 secondes, du paiement à la seconde pulvérisation.',
  },
  {
    question: 'Puis-je changer de parfum entre deux visites ?',
    answer: 'Oui, chaque utilisation est indépendante : vous choisissez librement à chaque passage.',
  },
]

export default function HowItWorks() {
  return (
    <div>
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-4 text-center">
          <ScrollReveal className="mx-auto flex flex-col items-center gap-4">
            <span className="eyebrow">Comment ça marche</span>
            <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Choisissez. Payez. Vaporisez.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Utiliser une station PULVIS est pensé pour être immédiat, sans friction, du premier
              coup d'œil au dernier geste.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-10">
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 0.06}>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                  <step.icon className="h-6 w-6" strokeWidth={1.4} />
                </div>
                <div className="flex flex-1 flex-col gap-1 border-b border-white/10 pb-8 sm:border-none sm:pb-0">
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">
                    Étape {i + 1}
                  </span>
                  <h2 className="font-serif text-2xl text-pulvis-cream sm:text-3xl">{step.title}</h2>
                  <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-b border-white/10 bg-pulvis-bgLight py-16 sm:py-24">
        <div className="container-pulvis grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal className="flex flex-col gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <h2 className="font-serif text-3xl font-medium text-pulvis-cream sm:text-4xl">
              Aucun compte. Aucune application.
            </h2>
            <p className="text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Une carte bancaire ou un moyen de paiement sans contact suffit. Pas de mot de passe,
              pas d'inscription, pas de temps perdu.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <PlaceholderImage
              label="Paiement sans contact sur une station PULVIS"
              icon={CreditCard}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-10">
          <SectionTitle eyebrow="Questions fréquentes" title="Encore un doute ?" />
          <Accordion items={quickFaq} />
        </div>
      </section>

      <CTASection
        title="Prêt à essayer ?"
        description="Trouvez la station PULVIS la plus proche de vous."
        buttonLabel="Trouver une station"
        buttonTo="/trouver-pulvis"
      />
    </div>
  )
}
