import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const Component = motion[as]

  if (shouldReduceMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  )
}
