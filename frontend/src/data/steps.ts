import { MessageCircle, SearchCheck, Wrench, RefreshCw, type LucideIcon } from 'lucide-react'

export interface PartnerStep {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

export const partnerSteps: PartnerStep[] = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Échange',
    description: 'PULVIS découvre votre établissement, son fonctionnement et ses besoins.',
  },
  {
    number: '02',
    icon: SearchCheck,
    title: 'Étude de l’emplacement',
    description: 'Analyse du lieu et sélection de l’emplacement le plus pertinent pour la station.',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Installation',
    description: 'La station est installée et mise en service par nos équipes.',
  },
  {
    number: '04',
    icon: RefreshCw,
    title: 'Exploitation',
    description: 'PULVIS assure le suivi, le réapprovisionnement et la maintenance dans la durée.',
  },
]
