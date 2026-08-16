import Button from './Button'
import ScrollReveal from './ScrollReveal'
import { ArrowRight } from 'lucide-react'

interface CTASectionProps {
  title: string
  description?: string
  buttonLabel: string
  buttonTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

export default function CTASection({
  title,
  description,
  buttonLabel,
  buttonTo,
  secondaryLabel,
  secondaryTo,
}: CTASectionProps) {
  return (
    <section className="border-t border-white/10 bg-pulvis-bgLight">
      <div className="container-pulvis flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <ScrollReveal className="flex flex-col items-center gap-6">
          <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight text-pulvis-cream sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-xl text-base text-pulvis-muted sm:text-lg">{description}</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to={buttonTo} size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              {buttonLabel}
            </Button>
            {secondaryLabel && secondaryTo && (
              <Button to={secondaryTo} variant="secondary" size="lg">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
