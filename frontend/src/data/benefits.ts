import {
  Sparkles,
  Wrench,
  PackageCheck,
  ShieldCheck,
  CreditCard,
  Gem,
  type LucideIcon,
} from 'lucide-react'

export interface Benefit {
  icon: LucideIcon
  title: string
  description: string
}

export const benefits: Benefit[] = [
  {
    icon: Sparkles,
    title: 'Une nouvelle expérience adhérent',
    description: 'Un service supplémentaire directement disponible dans votre établissement.',
  },
  {
    icon: Wrench,
    title: 'Une installation prise en charge',
    description: 'PULVIS organise la pose et la mise en service de la station.',
  },
  {
    icon: PackageCheck,
    title: 'Aucun stock à gérer',
    description: 'PULVIS assure l’intégralité du réapprovisionnement en parfums.',
  },
  {
    icon: ShieldCheck,
    title: 'Maintenance assurée',
    description: 'Nos équipes suivent et entretiennent chaque station installée.',
  },
  {
    icon: CreditCard,
    title: 'Paiements gérés par PULVIS',
    description: 'Aucune gestion de caisse supplémentaire pour votre établissement.',
  },
  {
    icon: Gem,
    title: 'Une image premium',
    description: 'La station s’intègre visuellement dans des établissements modernes.',
  },
]
