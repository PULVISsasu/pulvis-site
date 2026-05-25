/**
 * Visualisation du stock sur 5 slots.
 * Couleurs : vert = ok / jaune = stock bas / rouge = vide / gris = inactif
 */
interface Props {
  activeSlots:   number
  emptySlots:    number
  lowStockSlots: number
}

type DotState = 'ok' | 'low' | 'empty' | 'inactive'

const DOT_CLASSES: Record<DotState, string> = {
  ok:       'bg-emerald-500',
  low:      'bg-amber-400',
  empty:    'bg-red-500',
  inactive: 'bg-gray-700',
}

const DOT_TITLE: Record<DotState, string> = {
  ok:       'Stock OK',
  low:      'Stock bas',
  empty:    'Slot vide',
  inactive: 'Slot inactif',
}

export default function StockDots({ activeSlots, emptySlots, lowStockSlots }: Props) {
  const totalSlots  = 5
  const goodSlots   = Math.max(0, activeSlots - emptySlots - lowStockSlots)
  const inactiveSlots = Math.max(0, totalSlots - activeSlots)

  const dots: DotState[] = [
    ...Array<DotState>(emptySlots).fill('empty'),
    ...Array<DotState>(lowStockSlots).fill('low'),
    ...Array<DotState>(goodSlots).fill('ok'),
    ...Array<DotState>(inactiveSlots).fill('inactive'),
  ]

  return (
    <div className="flex items-center gap-1.5" title={`${goodSlots} OK · ${lowStockSlots} bas · ${emptySlots} vide(s)`}>
      {dots.map((state, i) => (
        <span
          key={i}
          title={DOT_TITLE[state]}
          className={`inline-block w-2.5 h-2.5 rounded-full ${DOT_CLASSES[state]}`}
        />
      ))}
    </div>
  )
}
