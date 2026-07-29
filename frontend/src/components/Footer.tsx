import { Link } from 'react-router-dom'
import { navLinks } from './Header'

const footerColumns = [
  {
    title: 'Découvrir',
    links: navLinks,
  },
  {
    title: 'Assistance',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Aide et assistance', to: '/aide' },
      { label: 'Trouver PULVIS', to: '/trouver-pulvis' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'Professionnels', to: '/professionnels' },
      { label: 'Mentions légales', to: '/mentions-legales' },
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
            Le parfum, au bon moment. Des stations de parfum en libre-service, installées dans vos
            lieux préférés.
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
        <div className="container-pulvis flex flex-col-reverse items-center justify-between gap-4 py-6 text-xs text-pulvis-muted sm:flex-row">
          <span>© {new Date().getFullYear()} PULVIS. Tous droits réservés.</span>
          <span className="text-center">Maquette de démonstration — contenus et données fictifs.</span>
        </div>
      </div>
    </footer>
  )
}
