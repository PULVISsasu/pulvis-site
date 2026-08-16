import { Link } from 'react-router-dom'
import SectionTitle from '../components/SectionTitle'
import { usePageMeta } from '../hooks/usePageMeta'

// Médiateur de la consommation, assurance professionnelle et éventuel numéro de dépôt de
// marque : non fournis à ce jour, à ajouter une fois validés — ne pas inventer ces données.

const identity = [
  { label: 'SIREN', value: '104 696 745' },
  { label: 'SIRET', value: '104 696 745 00017' },
  { label: 'TVA intracommunautaire', value: 'FR76104696745' },
  { label: 'Code APE', value: '47.99B — Vente par automates et autres commerces de détail hors magasin, éventaires ou marchés n.c.a.' },
]

export default function LegalNotice() {
  usePageMeta('Mentions légales', 'Mentions légales du site PULVIS.')

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Conformément à la loi, voici les informations légales relatives à l’édition et à l’hébergement du site pulvis.fr."
      />

      <div className="flex max-w-2xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Éditeur du site</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            PULVIS — SASU au capital de 1 000 €
            <br />
            47 rue Vivienne, 75002 Paris — France
          </p>

          <div className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-pulvis-bgLight">
            {identity.map((item) => (
              <div key={item.label} className="flex flex-col gap-1 p-5">
                <span className="text-xs uppercase tracking-widest2 text-pulvis-gold">{item.label}</span>
                <span className="text-sm text-pulvis-cream sm:text-base">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Activité déclarée : vente au détail de produits manufacturés non réglementés par
            distributeur automatique.
          </p>

          <p className="text-sm leading-relaxed text-pulvis-cream sm:text-base">
            Email :{' '}
            <a href="mailto:contact@pulvis.fr" className="link-underline text-pulvis-gold">
              contact@pulvis.fr
            </a>
            <br />
            Téléphone :{' '}
            <a href="tel:+33646292754" className="link-underline text-pulvis-gold">
              06 46 29 27 54
            </a>
            <br />
            Site :{' '}
            <a
              href="https://pulvis.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-pulvis-gold"
            >
              pulvis.fr
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Directeur de la publication</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Giovanni Patin, Président de PULVIS.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Hébergement</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Le site pulvis.fr est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
            91723, États-Unis.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Sauf mention contraire, l’ensemble des contenus présents sur le site pulvis.fr,
            notamment les textes, photographies, illustrations, éléments graphiques, logos,
            marques et éléments de design, est la propriété de PULVIS ou fait l’objet d’une
            autorisation d’utilisation. Aucune reproduction, représentation ou exploitation ne
            peut être effectuée sans autorisation préalable, sauf disposition légale contraire.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Responsabilité</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            PULVIS s’efforce de fournir sur ce site des informations exactes et régulièrement
            mises à jour. PULVIS ne peut toutefois garantir l’absence totale d’erreurs,
            d’inexactitudes ou d’indisponibilités temporaires, notamment liées à des interruptions
            techniques indépendantes de sa volonté.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Données personnelles</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Pour toute information concernant la collecte et le traitement des données
            personnelles, veuillez consulter notre{' '}
            <Link to="/politique-de-confidentialite" className="link-underline text-pulvis-gold">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">Cookies</h2>
          <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">
            Pour en savoir plus sur l’utilisation des cookies et technologies similaires, veuillez
            consulter notre{' '}
            <Link to="/cookies" className="link-underline text-pulvis-gold">
              politique dédiée
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
