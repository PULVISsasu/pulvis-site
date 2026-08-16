import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from './Button'
import { establishmentTypes } from '../data/establishmentTypes'

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-pulvis-bg px-4 py-3 text-sm text-pulvis-cream placeholder:text-pulvis-muted focus:border-pulvis-gold focus:outline-none'

export default function EligibilityCheck() {
  const [checked, setChecked] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setChecked(true)
  }

  if (checked) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-9 w-9 text-pulvis-gold" strokeWidth={1.3} />
        <p className="max-w-md font-serif text-xl text-pulvis-cream sm:text-2xl">
          Votre établissement semble correspondre aux critères de déploiement PULVIS.
        </p>
        <p className="max-w-md text-sm text-pulvis-muted">
          Notre équipe peut réaliser une étude plus précise de votre établissement.
        </p>
        <Button to="/devenir-partenaire" icon={<ArrowRight className="h-4 w-4" />}>
          Étudier mon établissement
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select required defaultValue="" className={inputClasses} aria-label="Type d’établissement">
          <option value="" disabled>
            Type d’établissement
          </option>
          {establishmentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input required type="text" placeholder="Ville" className={inputClasses} aria-label="Ville" />
        <select required defaultValue="" className={inputClasses} aria-label="Nombre d’adhérents">
          <option value="" disabled>
            Nombre d’adhérents
          </option>
          <option value="< 500">Moins de 500</option>
          <option value="500 – 1500">500 à 1 500</option>
          <option value="> 1500">Plus de 1 500</option>
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-pulvis-gold/50 px-6 py-3.5 text-sm font-medium text-pulvis-cream transition-colors hover:border-pulvis-gold hover:bg-pulvis-gold/10 sm:w-fit"
      >
        Vérifier l’éligibilité de mon établissement
      </button>
    </form>
  )
}
