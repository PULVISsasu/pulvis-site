import { useState, type FormEvent } from 'react'
import { CheckCircle2, Paperclip, Info } from 'lucide-react'

const problemTypes = [
  'Paiement effectué sans pulvérisation',
  'Station indisponible',
  'Parfum vide',
  'Problème d\'affichage',
  'Autre',
]

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-pulvis-bgLight px-4 py-3 text-sm text-pulvis-cream placeholder:text-pulvis-muted focus:border-pulvis-gold focus:outline-none'
const labelClasses = 'text-sm text-pulvis-cream'

export default function SupportForm() {
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/30 bg-pulvis-bgLight px-6 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-300" strokeWidth={1.3} />
        <h3 className="font-serif text-2xl text-pulvis-cream">Demande enregistrée (maquette)</h3>
        <p className="max-w-md text-sm text-pulvis-muted">
          Dans la version finale, votre demande serait transmise à notre équipe assistance. Ceci est
          une maquette : aucune donnée n'a réellement été envoyée.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="link-underline text-sm text-pulvis-gold"
        >
          Envoyer une nouvelle demande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-xl border border-pulvis-gold/30 bg-pulvis-gold/5 px-4 py-3.5 text-sm text-pulvis-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-pulvis-gold" />
        Ce formulaire fait partie d'une maquette. Il n'envoie aucune donnée réelle.
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="lieu" className={labelClasses}>
            Lieu
          </label>
          <input id="lieu" name="lieu" type="text" required className={inputClasses} placeholder="Ex. Fit Club République" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="station" className={labelClasses}>
            Numéro de la station
          </label>
          <input id="station" name="station" type="text" required className={inputClasses} placeholder="Ex. PLV-014" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className={labelClasses}>
            Date
          </label>
          <input id="date" name="date" type="date" required className={inputClasses} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="heure" className={labelClasses}>
            Heure
          </label>
          <input id="heure" name="heure" type="time" required className={inputClasses} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="type" className={labelClasses}>
          Type de problème
        </label>
        <select id="type" name="type" required className={inputClasses} defaultValue="">
          <option value="" disabled>
            Sélectionnez un type de problème
          </option>
          {problemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className={inputClasses}
          placeholder="Décrivez ce qui s'est passé…"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClasses} placeholder="vous@exemple.com" />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClasses}>Photo (facultatif)</span>
        <label
          htmlFor="photo"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-4 text-sm text-pulvis-muted transition-colors hover:border-pulvis-gold/50"
        >
          <Paperclip className="h-4 w-4 text-pulvis-gold" />
          {fileName ?? 'Ajouter une photo (maquette, aucun envoi réel)'}
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-pulvis-gold px-6 py-3.5 text-sm font-medium text-pulvis-bg transition-colors hover:bg-pulvis-goldSecondary"
      >
        Envoyer la demande
      </button>
    </form>
  )
}
