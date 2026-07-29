import { type ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

export default function PageWrapper({ children }: { children: ReactNode }) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
