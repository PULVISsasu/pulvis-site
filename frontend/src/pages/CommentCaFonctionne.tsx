import SectionTitle from '../components/SectionTitle'
import ScrollReveal from '../components/ScrollReveal'
import Accordion from '../components/Accordion'
import CTASection from '../components/CTASection'
import { partnerSteps } from '../data/steps'
import { usePageMeta } from '../hooks/usePageMeta'

const quickFaq = [
  {
    question: 'Combien de temps prend l’ensemble du processus ?',
    answer:
      'La durée dépend de chaque établissement. Elle vous est précisée lors de l’étude de votre emplacement, dès les premiers échanges.',
  },
  {
    question: 'Dois-je préparer quelque chose avant l’échange ?',
    answer:
      'Non. Un premier échange suffit pour que PULVIS comprenne votre établissement et ses besoins.',
  },
  {
    question: 'Que se passe-t-il après l’installation ?',
    answer:
      'PULVIS assure le suivi, le réapprovisionnement et la maintenance de la station dans la durée, sans action nécessaire de votre part.',
  },
]

export default function CommentCaFonctionne() {
  usePageMeta(
    'Comment ça fonctionne',
    'Le parcours PULVIS pour devenir établissement partenaire : échange, étude de l’emplacement, installation, exploitation.',
  )

  return (
    <div>
      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-4 text-center">
          <ScrollReveal className="mx-auto flex flex-col items-center gap-4">
            <span className="eyebrow">Comment ça fonctionne</span>
            <h1 className="max-w-2xl font-serif text-4xl font-medium leading-tight text-pulvis-cream sm:text-5xl">
              Un parcours simple, du premier échange à l’exploitation.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pulvis-muted sm:text-lg">
              Devenir établissement partenaire PULVIS suit un processus clair, pensé pour ne
              demander aucune gestion quotidienne de votre part.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-10">
          {partnerSteps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.06}>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-pulvis-gold/30 text-pulvis-gold">
                  <step.icon className="h-6 w-6" strokeWidth={1.4} />
                </div>
                <div className="flex flex-1 flex-col gap-1 border-b border-white/10 pb-8 sm:border-none sm:pb-0">
                  <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">
                    Étape {step.number}
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

      <section className="border-t border-white/10 py-16 sm:py-24">
        <div className="container-pulvis flex flex-col gap-10">
          <SectionTitle eyebrow="Questions fréquentes" title="Encore un doute ?" />
          <Accordion items={quickFaq} />
        </div>
      </section>

      <CTASection
        title="Prêt à échanger sur votre établissement ?"
        description="Le premier échange ne vous engage à rien."
        buttonLabel="Devenir établissement partenaire"
        buttonTo="/devenir-partenaire"
      />
    </div>
  )
}
