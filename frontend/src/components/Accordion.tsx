import { useState, useId } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { type FaqItem } from '../data/faq'

interface AccordionProps {
  items: FaqItem[]
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const idBase = useId()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col divide-y divide-white/10 border-t border-white/10">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${idBase}-panel-${index}`
        const buttonId = `${idBase}-button-${index}`

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-serif text-lg text-pulvis-cream sm:text-xl">{item.question}</span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-pulvis-gold transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-pulvis-muted sm:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
