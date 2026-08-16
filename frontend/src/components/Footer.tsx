import { Link } from 'react-router-dom'
import { navLinks } from './Header'

const footerColumns = [
  {
    title: 'Découvrir',
    links: navLinks,
  },
  {
    title: 'Partenariat',
    links: [
      { label: 'Devenir partenaire', to: '/devenir-partenaire' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Politique de confidentialité', to: '/politique-de-confidentialite' },
      { label: 'Gestion des cookies', to: '/cookies' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-pulvis-bg">
      <div className="container-pulvis grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <span className="font-serif text-2xl tracking-widest2 text-pulvis-cream">PULVIS</span>
          <p className="max-w-xs text-sm leading-relaxed text-pulvis-muted">
            Des stations de parfum premium en libre-service, installées et exploitées par PULVIS
            dans les salles de sport.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <span className="eyebrow">{col.title}</span>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-underline text-sm text-pulvis-muted hover:text-pulvis-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-pulvis flex items-center justify-center py-6 text-xs text-pulvis-muted">
          <span>© {new Date().getFullYear()} PULVIS. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
