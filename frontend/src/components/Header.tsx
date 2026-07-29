import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

export const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Parfums', to: '/parfums' },
  { label: 'Comment ça marche', to: '/comment-ca-marche' },
  { label: 'Trouver PULVIS', to: '/trouver-pulvis' },
  { label: 'Journal', to: '/journal' },
  { label: 'Aide', to: '/aide' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
        scrolled
          ? 'border-white/10 bg-pulvis-bg/90 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="container-pulvis flex h-16 items-center justify-between sm:h-20">
        <NavLink to="/" className="font-serif text-xl tracking-widest2 text-pulvis-cream sm:text-2xl">
          PULVIS
        </NavLink>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `link-underline text-sm tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-pulvis-gold' : 'text-pulvis-cream hover:text-pulvis-gold'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-pulvis-cream transition-colors hover:text-pulvis-gold lg:hidden"
          aria-label="Ouvrir le menu"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Menu className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  )
}
