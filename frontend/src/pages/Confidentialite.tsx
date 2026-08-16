import SectionTitle from '../components/SectionTitle'
import { usePageMeta } from '../hooks/usePageMeta'

const sections = [
  {
    title: 'Responsable du traitement',
    body: '[À COMPLÉTER] PULVIS SAS — [adresse à compléter]. Contact : [à compléter].',
  },
  {
    title: 'Données collectées',
    body: 'Via le formulaire « Devenir partenaire » et le module d’éligibilité : nom, prénom, fonction, coordonnées professionnelles, informations relatives à l’établissement. Aucune donnée bancaire ou de paiement n’est collectée sur ce site.',
  },
  {
    title: 'Finalité du traitement',
    body: 'Les données transmises sont utilisées exclusivement pour étudier votre demande de partenariat et vous recontacter.',
  },
  {
    title: 'Base légale',
    body: 'Le traitement repose sur votre consentement, exprimé lors de l’envoi du formulaire.',
  },
  {
    title: 'Durée de conservation',
    body: '[À COMPLÉTER] — durée de conservation des données selon la finalité du traitement.',
  },
  {
    title: 'Destinataires',
    body: 'Les données sont destinées aux équipes PULVIS en charge du développement des partenariats. Elles ne sont pas cédées à des tiers à des fins commerciales.',
  },
  {
    title: 'Vos droits',
    body: 'Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d’un droit d’accès, de rectification, d’effacement et d’opposition sur vos données personnelles. Pour exercer ces droits : [à compléter].',
  },
  {
    title: 'Cookies',
    body: 'Pour la gestion des cookies, consultez notre politique de cookies.',
  },
]

export default function Confidentialite() {
  usePageMeta('Politique de confidentialité', 'Politique de confidentialité et de protection des données du site PULVIS.')

  return (
    <div className="container-pulvis flex flex-col gap-12 py-16 sm:py-24">
      <SectionTitle
        eyebrow="Confidentialité"
        title="Politique de confidentialité"
        description="Les informations marquées [À COMPLÉTER] seront renseignées avant la mise en production du site."
      />

      <div className="flex max-w-2xl flex-col gap-10">
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <h2 className="font-serif text-xl text-pulvis-cream sm:text-2xl">{section.title}</h2>
            <p className="text-sm leading-relaxed text-pulvis-muted sm:text-base">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
