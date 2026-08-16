import { useState, type FormEvent } from 'react'
import { CheckCircle2, Info } from 'lucide-react'
import { establishmentTypes } from '../data/establishmentTypes'

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-pulvis-bgLight px-4 py-3 text-sm text-pulvis-cream placeholder:text-pulvis-muted focus:border-pulvis-gold focus:outline-none'
const labelClasses = 'text-sm text-pulvis-cream'

export default function PartnerForm() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-pulvis-gold/30 bg-pulvis-bgLight px-6 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-pulvis-gold" strokeWidth={1.3} />
        <h3 className="font-serif text-2xl text-pulvis-cream">Merci pour votre demande</h3>
        <p className="max-w-md text-sm leading-relaxed text-pulvis-muted">
          Nous allons étudier votre établissement afin de déterminer si une installation PULVIS
          est pertinente. Notre équipe reviendra vers vous prochainement.
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
        Ce formulaire fait partie d’une maquette. Il n’envoie aucune donnée réelle.
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="prenom" className={labelClasses}>
            Prénom
          </label>
          <input id="prenom" name="prenom" type="text" required className={inputClasses} autoComplete="given-name" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nom" className={labelClasses}>
            Nom
          </label>
          <input id="nom" name="nom" type="text" required className={inputClasses} autoComplete="family-name" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="fonction" className={labelClasses}>
            Fonction
          </label>
          <input
            id="fonction"
            name="fonction"
            type="text"
            required
            className={inputClasses}
            placeholder="Ex. Directeur, Responsable de club"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="etablissement" className={labelClasses}>
            Nom de l’établissement
          </label>
          <input id="etablissement" name="etablissement" type="text" required className={inputClasses} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className={labelClasses}>
            Type d’établissement
          </label>
          <select id="type" name="type" required className={inputClasses} defaultValue="">
            <option value="" disabled>
              Sélectionnez un type d’établissement
            </option>
            {establishmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ville" className={labelClasses}>
            Ville
          </label>
          <input id="ville" name="ville" type="text" required className={inputClasses} autoComplete="address-level2" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="codePostal" className={labelClasses}>
            Code postal
          </label>
          <input
            id="codePostal"
            name="codePostal"
            type="text"
            required
            inputMode="numeric"
            className={inputClasses}
            autoComplete="postal-code"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClasses}>
            Email professionnel
          </label>
          <input id="email" name="email" type="email" required className={inputClasses} autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="telephone" className={labelClasses}>
            Téléphone
          </label>
          <input id="telephone" name="telephone" type="tel" required className={inputClasses} autoComplete="tel" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClasses}>
          Message <span className="text-pulvis-muted">(facultatif)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClasses}
          placeholder="Parlez-nous de votre établissement, de vos espaces disponibles, de vos horaires…"
        />
      </div>

      <label htmlFor="consentement" className="flex items-start gap-3 text-sm text-pulvis-muted">
        <input
          id="consentement"
          name="consentement"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-pulvis-bgLight accent-pulvis-gold"
        />
        <span>
          J’accepte que les informations transmises via ce formulaire soient utilisées par PULVIS
          pour étudier ma demande de partenariat.
        </span>
      </label>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-pulvis-gold px-6 py-3.5 text-sm font-medium text-pulvis-bg transition-colors hover:bg-pulvis-goldSecondary"
      >
        Étudier mon établissement
      </button>
    </form>
  )
}
