import { Hash } from 'lucide-react'
import SectionTitle from '../components/SectionTitle'
import SupportForm from '../components/SupportForm'
import PlaceholderImage from '../components/PlaceholderImage'
import ScrollReveal from '../components/ScrollReveal'

export default function Help() {
  return (
    <div className="container-pulvis flex flex-col gap-16 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Aide et assistance"
        title="Un problème ? Nous sommes là."
        description="Décrivez votre situation, nous examinons chaque demande individuellement."
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <ScrollReveal>
          <SupportForm />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="flex flex-col gap-6">
          <span className="eyebrow">Où trouver le numéro de la station ?</span>
          <PlaceholderImage
            label="Numéro de station affiché sur la façade"
            icon={Hash}
            className="aspect-[4/3] w-full rounded-2xl"
          />
          <p className="text-sm leading-relaxed text-pulvis-muted">
            Le numéro de la station (ex. « PLV-014 ») est affiché sur la façade avant de la
            machine, généralement près de l'écran ou du lecteur de paiement. Vous le retrouverez
            également sur la page de la station si vous avez scanné un QR code.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}
