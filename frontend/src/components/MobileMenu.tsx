import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { navLinks } from './Header'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
          className="fixed inset-0 z-50 flex flex-col bg-pulvis-bg lg:hidden"
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="container-pulvis flex h-16 items-center justify-between sm:h-20">
            <span className="font-serif text-xl tracking-widest2 text-pulvis-cream">PULVIS</span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-pulvis-cream hover:text-pulvis-gold"
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          <nav aria-label="Navigation mobile" className="container-pulvis mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.to}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : i * 0.05 }}
              >
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `block border-b border-white/10 py-4 font-serif text-2xl transition-colors sm:text-3xl ${
                      isActive ? 'text-pulvis-gold' : 'text-pulvis-cream'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="container-pulvis mb-10 mt-4 flex flex-col gap-3">
            <NavLink
              to="/devenir-partenaire"
              className="inline-flex items-center justify-center rounded-full bg-pulvis-gold px-6 py-3.5 text-sm font-medium text-pulvis-bg"
            >
              Devenir partenaire
            </NavLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
