import { Compass } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="container-pulvis flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <Compass className="h-10 w-10 text-pulvis-gold/60" strokeWidth={1.2} />
      <h1 className="font-serif text-4xl text-pulvis-cream sm:text-5xl">Page introuvable</h1>
      <p className="max-w-md text-sm text-pulvis-muted sm:text-base">
        La page que vous cherchez n'existe pas ou plus. Retournez à l'accueil pour continuer votre
        exploration.
      </p>
      <Button to="/" size="lg">
        Retour à l'accueil
      </Button>
    </div>
  )
}
